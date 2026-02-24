from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Annotated, Optional
import os
import tempfile

from .gemini_client import (
    chat_inline_pdf, upload_file_to_gemini, chat_with_file_api, 
    chat_smart_pdf, chat_with_image, chat_inline_image, chat_pdf_from_path
)
from .openai_client import chat_with_model
from .prompt import SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT
from .database import get_db, init_db, init_database
from . import pdf_storage
from .models import User, Document, Feedback
from .schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    UserUpdate, PasswordChange, AdminUserUpdate, UserListResponse,
    DocumentCreate, DocumentResponse, DocumentUpdate,
    FeedbackCreate, FeedbackResponse, FeedbackListResponse
)
from .auth import (
    get_password_hash,
    authenticate_user,
    create_access_token,
    get_current_active_user,
    get_current_admin_user,
    get_user_by_username,
    verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class PDFInlineChatRequest(BaseModel):
    message: str
    pdf_base64: str

class PDFFileChatRequest(BaseModel):
    message: str
    file_uri: str

class UploadResponse(BaseModel):
    file_uri: str

class ChatImageRequest(BaseModel):
    query: str
    image_base64: str

class ChatImageResponse(BaseModel):
    reply: str

# New models for PDF management
class PDFUploadResponse(BaseModel):
    filename: str
    is_new: bool
    file_hash: str
    file_size: int

class PDFChatRequest(BaseModel):
    user_id: str
    pdf_name: str
    message: str

class PDFListResponse(BaseModel):
    pdfs: list[dict]

class PDFDeleteResponse(BaseModel):
    success: bool
    message: str

app = FastAPI(
    title="backend-ai",
    description="Simple FastAPI service that proxies requests to OpenAI ChatGPT and handles PDF management.",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    root_path=os.getenv("ROOT_PATH", "")
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://100.48.76.109",
        "http://constructioniq.com.vn",
        "https://constructioniq.com.vn",
        "http://www.constructioniq.com.vn",
        "https://www.constructioniq.com.vn"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize databases on startup."""
    await init_database() # PDF SQLite
    init_db() # Auth MySQL
    print("Databases initialized successfully!")

@app.get("/health", tags=["system"])
async def health_check() -> dict:
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        reply = chat_with_model(user_message=request.message)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Internal error") from exc
    return ChatResponse(reply=reply)

# =============================================================================
# PDF Management Endpoints
# =============================================================================

@app.post("/pdfs/upload", response_model=PDFUploadResponse, tags=["pdf-management"])
async def upload_pdf_new(
    user_id: Annotated[str, Form()],
    file: UploadFile = File(...)
) -> PDFUploadResponse:
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        content = await file.read()
        MAX_SIZE = 50 * 1024 * 1024
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=413, detail=f"File too large. Maximum size is 50MB")
        filename = file.filename or "document.pdf"
        result = await pdf_storage.save_pdf(user_id=user_id, filename=filename, file_bytes=content)
        return PDFUploadResponse(**result)
    except FileExistsError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to upload PDF: {str(exc)}") from exc

@app.get("/pdfs/{user_id}", response_model=PDFListResponse, tags=["pdf-management"])
async def list_user_pdfs(user_id: str) -> PDFListResponse:
    try:
        pdfs = await pdf_storage.get_user_pdfs(user_id)
        return PDFListResponse(pdfs=pdfs)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list PDFs: {str(exc)}") from exc

@app.post("/pdfs/chat", response_model=ChatResponse, tags=["pdf-management"])
async def chat_with_pdf(request: PDFChatRequest) -> ChatResponse:
    try:
        pdf_info = await pdf_storage.get_pdf_info(user_id=request.user_id, filename=request.pdf_name)
        if not pdf_info:
            raise HTTPException(status_code=404, detail=f"PDF '{request.pdf_name}' not found")
        reply = chat_pdf_from_path(prompt=request.message, pdf_path=pdf_info["storage_path"], system_instruction=SYSTEM_PROMPT)
        return ChatResponse(reply=reply)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to chat with PDF: {str(exc)}") from exc

@app.delete("/pdfs/{user_id}/{filename}", response_model=PDFDeleteResponse, tags=["pdf-management"])
async def delete_user_pdf(user_id: str, filename: str) -> PDFDeleteResponse:
    try:
        deleted = await pdf_storage.delete_pdf(user_id, filename)
        if not deleted:
            raise HTTPException(status_code=404, detail="PDF not found")
        return PDFDeleteResponse(success=True, message=f"PDF '{filename}' deleted successfully")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(exc)}") from exc

# ========================
# Authentication Endpoints
# ========================

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["auth"])
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_username = get_user_by_username(db, username=user_data.username)
    if existing_username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already taken")
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_admin=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login", response_model=Token, tags=["auth"])
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user account")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username, "user_id": user.id}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

# ========================
# User Profile Endpoints
# ========================

@app.put("/users/me", response_model=UserResponse, tags=["users"])
async def update_profile(user_data: UserUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/users/me/change-password", tags=["users"])
async def change_password(password_data: PasswordChange, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

# ========================
# Admin User Management
# ========================

@app.get("/admin/users", response_model=List[UserListResponse], tags=["admin"])
async def list_users(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/admin/users/{user_id}", response_model=UserListResponse, tags=["admin"])
async def get_user(user_id: int, current_user: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
