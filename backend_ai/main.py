from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List, Annotated
import os
import tempfile
import time
import random

from .openai_client import chat_with_model
from .gemini_client import chat_inline_pdf, upload_file_to_gemini, chat_with_file_api, chat_smart_pdf, chat_with_image, chat_inline_image
from .prompt import IMAGE_SYSTEM_PROMPT, SYSTEM_PROMPT
from .database import get_db, init_db
from .models import User, Document, Feedback, Payment, SubscriptionPlan, PaymentStatus
from .schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    UserUpdate, PasswordChange, AdminUserUpdate, UserListResponse,
    DocumentCreate, DocumentResponse, DocumentUpdate,
    FeedbackCreate, FeedbackResponse, FeedbackListResponse,
    PaymentCreate, PaymentResponse, PaymentLinkResponse, PaymentWebhook
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
from .payos_client import PayOSClient, get_plan_info


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


app = FastAPI(
    title="backend-ai",
    description="Simple FastAPI service that proxies requests to OpenAI ChatGPT.",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    root_path=os.getenv("ROOT_PATH", "")  # Empty for local, /api for production
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
    """Initialize database on startup."""
    init_db()
    print("Database initialized successfully!")


@app.get("/health", tags=["system"])
async def health_check() -> dict:
    """
    Simple healthcheck endpoint so orchestration tools can verify the service.
    """
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse, tags=["chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat endpoint that forwards the user message (và context nếu có) tới OpenAI.
    """
    try:
        # `chat_with_model` là hàm đồng bộ, nên gọi trực tiếp không dùng `await`.
        reply = chat_with_model(
            user_message=request.message,
        )
    except RuntimeError as exc:
        # Lỗi cấu hình (ví dụ thiếu API key)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - catch-all
        raise HTTPException(status_code=500, detail="Internal error") from exc

    return ChatResponse(reply=reply)


# ========================
# Authentication Endpoints
# ========================

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["auth"])
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    - **username**: Username (must be unique, 3-100 characters)
    - **password**: Password (minimum 6 characters)
    - **full_name**: Optional full name
    """
    # Check if username already exists
    existing_username = get_user_by_username(db, username=user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
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
    """
    Login with username and password to get access token.
    
    - **username**: User's username
    - **password**: User's password
    
    Returns JWT access token that should be included in subsequent requests.
    """
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse, tags=["auth"])
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """
    Get current logged-in user information.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user


# ========================
# User Profile Endpoints
# ========================

@app.put("/users/me", response_model=UserResponse, tags=["users"])
async def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    
    - **full_name**: User's full name
    - **phone**: Phone number (optional)
    - **company**: Company name (optional)
    - **address**: Address (optional)
    """
    # Update user fields
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    
    # Note: phone, company, address fields are not in the current User model
    # You may need to add these fields to the User model if needed
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@app.post("/users/me/change-password", tags=["users"])
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    - **current_password**: User's current password
    - **new_password**: New password (minimum 6 characters)
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


# ========================
# Admin User Management Endpoints
# ========================

@app.get("/admin/users", response_model=List[UserListResponse], tags=["admin"])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all users (Admin only).
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.get("/admin/users/{user_id}", response_model=UserListResponse, tags=["admin"])
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (Admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@app.put("/admin/users/{user_id}", response_model=UserListResponse, tags=["admin"])
async def update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update user information (Admin only).
    
    - **full_name**: User's full name
    - **is_active**: Active status
    - **is_admin**: Admin role
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin
    
    db.commit()
    db.refresh(user)
    
    return user


@app.delete("/admin/users/{user_id}", tags=["admin"])
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete user (Admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


# ========================
# Document Management Endpoints
# ========================

@app.post("/documents/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, tags=["documents"])
async def upload_document(
    document_data: DocumentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a document (simulated upload - always returns error status).
    
    - **name**: Document name
    - **type**: Document type (pdf, docx, image, xlsx)
    - **size**: File size in bytes
    
    Note: This endpoint simulates upload failure but still saves document to database.
    """
    # Create document with error status (simulating upload failure)
    new_document = Document(
        user_id=current_user.id,
        name=document_data.name,
        type=document_data.type,
        size=document_data.size,
        status="error"  # Always set to error for now
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    return new_document


@app.get("/documents", response_model=List[DocumentResponse], tags=["documents"])
async def list_user_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List all documents for current user.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return documents


@app.get("/documents/{document_id}", response_model=DocumentResponse, tags=["documents"])
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get document by ID (must be owned by current user).
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return document


@app.delete("/documents/{document_id}", tags=["documents"])
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document (must be owned by current user).
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


# ========================
# Admin Document Management
# ========================

@app.get("/admin/documents", response_model=List[DocumentResponse], tags=["admin"])
async def list_all_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all documents from all users (Admin only).
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    documents = db.query(Document).offset(skip).limit(limit).all()
    return documents


# ========== Feedback Endpoints ==========

@app.post("/feedbacks", response_model=FeedbackResponse, tags=["feedbacks"])
async def create_feedback(
    feedback: FeedbackCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create feedback for AI chat response.
    
    - **message**: User's original message
    - **ai_response**: AI's response text
    - **feedback_type**: 'like' or 'dislike'
    - **comment**: Optional comment (required for dislike)
    """
    db_feedback = Feedback(
        user_id=current_user.id,
        message=feedback.message,
        ai_response=feedback.ai_response,
        feedback_type=feedback.feedback_type,
        comment=feedback.comment
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback


@app.get("/feedbacks/me", response_model=List[FeedbackResponse], tags=["feedbacks"])
async def list_my_feedbacks(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    List current user's feedbacks.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    feedbacks = db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return feedbacks


@app.get("/admin/feedbacks", response_model=List[FeedbackListResponse], tags=["admin"])
async def list_all_feedbacks(
    skip: int = 0,
    limit: int = 100,
    feedback_type: str = None,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all feedbacks from all users (Admin only).
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **feedback_type**: Filter by 'like' or 'dislike' (optional)
    """
    query = db.query(Feedback, User.username).join(User, Feedback.user_id == User.id)
    
    if feedback_type:
        query = query.filter(Feedback.feedback_type == feedback_type)
    
    results = query.offset(skip).limit(limit).all()
    
    feedbacks_with_username = []
    for feedback, username in results:
        feedback_dict = {
            "id": feedback.id,
            "user_id": feedback.user_id,
            "message": feedback.message,
            "ai_response": feedback.ai_response,
            "feedback_type": feedback.feedback_type,
            "comment": feedback.comment,
            "created_at": feedback.created_at,
            "username": username
        }
        feedbacks_with_username.append(feedback_dict)
    
    return feedbacks_with_username


@app.get("/admin/feedbacks/stats", tags=["admin"])
async def get_feedback_stats(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get feedback statistics (Admin only).
    
    Returns:
    - Total feedbacks
    - Total likes
    - Total dislikes
    - Like percentage
    """
    total = db.query(Feedback).count()
    likes = db.query(Feedback).filter(Feedback.feedback_type == "like").count()
    dislikes = db.query(Feedback).filter(Feedback.feedback_type == "dislike").count()
    
    like_percentage = (likes / total * 100) if total > 0 else 0
    
    return {
        "total_feedbacks": total,
        "total_likes": likes,
        "total_dislikes": dislikes,
        "like_percentage": round(like_percentage, 2)
    }
    
@app.post("/chat/pdf/inline", response_model=ChatResponse, tags=["pdf"])
async def chat_pdf_inline(request: PDFInlineChatRequest) -> ChatResponse:
    """
    Chat with an inline PDF (Base64 encoded).
    """
    try:
        reply = chat_inline_pdf(
            prompt=request.message,
            pdf_data_base64=request.pdf_base64,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(reply=reply)


@app.post("/upload/pdf", response_model=UploadResponse, tags=["pdf"])
async def upload_pdf(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload a PDF file to Gemini Files API.
    Returns the file URI to be used in `/chat/pdf/file`.
    """
    try:
        # Read file bytes
        content = await file.read()
        file_uri = upload_file_to_gemini(file_bytes=content, mime_type=file.content_type or "application/pdf")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
        
    return UploadResponse(file_uri=file_uri)


@app.post("/chat/pdf/file", response_model=ChatResponse, tags=["pdf"])
async def chat_pdf_file_api(request: PDFFileChatRequest) -> ChatResponse:
    """
    Chat with a PDF already uploaded to Gemini Files API (via file_uri).
    """
    try:
        reply = chat_with_file_api(
            prompt=request.message,
            file_uri=request.file_uri,
            system_instruction=SYSTEM_PROMPT
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(reply=reply)


@app.post("/chat/pdf", response_model=ChatResponse, tags=["pdf"])
async def chat_pdf_auto(
    message: Annotated[str, Form()],
    file: UploadFile = File(...)
) -> ChatResponse:
    """
    Smart Chat with PDF.
    - Uploads file and selects strategy (Inline vs Files API) based on size.
    - System automatically handles the logic.
    """
    try:
        content = await file.read()
        reply = chat_smart_pdf(
            prompt=message,
            file_bytes=content,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(reply=reply)


@app.post("/chat/image/inline", response_model=ChatImageResponse, tags=["images"])
async def chat_image_inline(request: ChatImageRequest) -> ChatImageResponse:
    """
    Chat with an inline image (Base64 encoded).
    Suitable for images that can be encoded in base64.
    """
    try:
        reply = chat_inline_image(
            user_query=request.query,
            image_base64=request.image_base64,
            system_prompt=IMAGE_SYSTEM_PROMPT
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatImageResponse(reply=reply)


@app.post("/chat-image", response_model=ChatImageResponse, tags=["images"])

async def chat_image(
    query: Annotated[str, Form()],
    image: UploadFile = File(...),
) -> ChatImageResponse:
    """
    Chat endpoint that analyzes an image using Gemini AI.
    Accepts an image file, user query, and optional system prompt.
    """
    # Create a temporary file to save the uploaded image
    temp_file = None
    try:
        # Create temporary file with the same extension as uploaded file
        suffix = os.path.splitext(image.filename)[1] if image.filename else ".jpg"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        
        # Write uploaded image to temporary file
        content = await image.read()
        temp_file.write(content)
        temp_file.close()
        
        # Call chat_with_image function
        reply = chat_with_image(
            image_path=temp_file.name,
            user_query=query,   
            system_prompt=IMAGE_SYSTEM_PROMPT   
        )   
        
        return ChatImageResponse(reply=reply)
        
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(exc)}"
        ) from exc
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
            except Exception:
                pass  # Ignore cleanup errors


# ========================
# Payment Endpoints
# ========================

@app.get("/payments/plans", tags=["payments"])
async def get_subscription_plans():
    """
    Get available subscription plans with pricing.
    """
    from .payos_client import SUBSCRIPTION_PLANS
    
    return {
        "plans": [
            {
                "id": plan_id,
                "name": plan_data["name"],
                "price": plan_data["price"],
                "duration_days": plan_data["duration_days"],
                "features": plan_data["features"]
            }
            for plan_id, plan_data in SUBSCRIPTION_PLANS.items()
        ]
    }


@app.post("/payments/create", response_model=PaymentLinkResponse, tags=["payments"])
async def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a payment link for subscription purchase.
    
    - **subscription_plan**: Plan to purchase (normal or pro)
    
    Returns payment URL for user to complete payment.
    """
    # Validate plan
    if payment_data.subscription_plan == "free":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot purchase free plan"
        )
    
    plan_info = get_plan_info(payment_data.subscription_plan)
    if not plan_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription plan"
        )
    
    # Generate unique order code
    order_code = int(time.time() * 1000) + random.randint(1000, 9999)
    
    # Initialize PayOS client
    try:
        payos_client = PayOSClient()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment service not configured: {str(e)}"
        )
    
    # Create payment record
    payment = Payment(
        user_id=current_user.id,
        order_code=str(order_code),
        amount=plan_info["price"],
        subscription_plan=payment_data.subscription_plan,
        status=PaymentStatus.pending
    )
    
    db.add(payment)
    db.commit()
    db.refresh(payment)
    
    # Create payment link
    try:
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        payment_link = payos_client.create_payment_link(
            order_code=order_code,
            amount=plan_info["price"],
            description=f"Thanh toán gói {plan_info['name']} - {current_user.username}",
            return_url=f"{frontend_url}/payment/success?orderCode={order_code}",
            cancel_url=f"{frontend_url}/payment/cancel?orderCode={order_code}",
            buyer_name=current_user.full_name or current_user.username,
            buyer_email=None,
            buyer_phone=None
        )
        
        # Update payment record with payment URL
        payment.payment_url = payment_link["payment_url"]
        db.commit()
        
        return PaymentLinkResponse(
            payment_url=payment_link["payment_url"],
            order_code=str(order_code),
            qr_code=payment_link["qr_code"],
            amount=plan_info["price"],
            subscription_plan=payment_data.subscription_plan
        )
    
    except Exception as e:
        # Update payment status to failed
        payment.status = PaymentStatus.failed
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment link: {str(e)}"
        )


@app.post("/payments/webhook", tags=["payments"])
async def payment_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook endpoint for PayOS payment notifications.
    This endpoint is called by PayOS when payment status changes.
    """
    try:
        webhook_data = await request.json()
        
        # Initialize PayOS client
        payos_client = PayOSClient()
        
        # Verify webhook signature
        if not payos_client.verify_webhook_signature(webhook_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature"
            )
        
        # Extract payment info
        data = webhook_data.get("data", {})
        order_code = str(data.get("orderCode"))
        payment_status = data.get("code")  # "00" means success
        transaction_id = data.get("id")
        
        # Find payment record
        payment = db.query(Payment).filter(Payment.order_code == order_code).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Update payment status
        if payment_status == "00":
            payment.status = PaymentStatus.completed
            payment.transaction_id = transaction_id
            payment.completed_at = datetime.utcnow()
            
            # Update user subscription
            user = db.query(User).filter(User.id == payment.user_id).first()
            if user:
                user.subscription_plan = payment.subscription_plan
                
                # Set expiration date
                plan_info = get_plan_info(payment.subscription_plan)
                if plan_info:
                    duration_days = plan_info["duration_days"]
                    user.subscription_expires_at = datetime.utcnow() + timedelta(days=duration_days)
        else:
            payment.status = PaymentStatus.failed
        
        db.commit()
        
        return {"message": "Webhook processed successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook processing failed: {str(e)}"
        )


@app.get("/payments/verify/{order_code}", response_model=PaymentResponse, tags=["payments"])
async def verify_payment(
    order_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment status by order code.
    Users can only check their own payments.
    """
    # Find payment record
    payment = db.query(Payment).filter(
        Payment.order_code == order_code,
        Payment.user_id == current_user.id
    ).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment not found"
        )
    
    # Check payment status from PayOS if still pending
    if payment.status == PaymentStatus.pending:
        try:
            payos_client = PayOSClient()
            payment_info = payos_client.get_payment_info(int(order_code))
            
            # Update payment status based on PayOS response
            if payment_info.get("status") == "PAID":
                payment.status = PaymentStatus.completed
                payment.transaction_id = payment_info.get("id")
                payment.completed_at = datetime.utcnow()
                
                # Update user subscription
                current_user.subscription_plan = payment.subscription_plan
                plan_info = get_plan_info(payment.subscription_plan)
                if plan_info:
                    duration_days = plan_info["duration_days"]
                    current_user.subscription_expires_at = datetime.utcnow() + timedelta(days=duration_days)
                
                db.commit()
                db.refresh(payment)
            
        except Exception as e:
            # If verification fails, just return current payment status
            pass
    
    return payment


@app.get("/payments/my-payments", response_model=List[PaymentResponse], tags=["payments"])
async def get_my_payments(
    skip: int = 0,
    limit: int = 10,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's payment history.
    """
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()
    
    return payments


@app.get("/admin/payments", response_model=List[PaymentResponse], tags=["admin"])
async def list_all_payments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    List all payments (Admin only).
    """
    payments = db.query(Payment).order_by(
        Payment.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return payments


def main() -> None:
    """
    Entrypoint để chạy dev server trực tiếp bằng `python -m backend_ai.main`.
    """
    import uvicorn

    uvicorn.run("backend_ai.main:app", host="0.0.0.0", port=8002, reload=True)


if __name__ == "__main__":
    main()
