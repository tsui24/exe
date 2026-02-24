from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .gemini_client import (
    chat_inline_pdf, upload_file_to_gemini, chat_with_file_api, 
    chat_smart_pdf, chat_with_image, chat_inline_image, chat_pdf_from_path
)
from fastapi import UploadFile, File, Form
from typing import Annotated, Optional
from .openai_client import chat_with_model
from .prompt import SYSTEM_PROMPT, IMAGE_SYSTEM_PROMPT
from .database import init_database
from . import pdf_storage
import os
import tempfile


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
    description="Simple FastAPI service that proxies requests to OpenAI ChatGPT.",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Initialize database on application startup.
    """
    await init_database()



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


def main() -> None:
    """
    Entrypoint để chạy dev server trực tiếp bằng `python -m backend_ai.main`.
    """
    import uvicorn

    uvicorn.run("backend_ai.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
