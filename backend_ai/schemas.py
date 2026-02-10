"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


# Enums
class DocumentTypeEnum(str, Enum):
    pdf = "pdf"
    docx = "docx"
    image = "image"
    xlsx = "xlsx"


class DocumentStatusEnum(str, Enum):
    processing = "processing"
    processed = "processed"
    error = "error"


class FeedbackTypeEnum(str, Enum):
    like = "like"
    dislike = "dislike"


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    hashed_password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6, max_length=100)


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class UserListResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


# Document Schemas
class DocumentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: Optional[DocumentTypeEnum] = None
    size: int = Field(..., gt=0)


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    name: str
    type: Optional[DocumentTypeEnum] = None
    size: int
    uploaded_at: datetime
    status: DocumentStatusEnum
    processing_time: Optional[float] = None
    chunks: Optional[int] = None
    embeddings: Optional[int] = None
    
    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    status: Optional[DocumentStatusEnum] = None
    processing_time: Optional[float] = None
    chunks: Optional[int] = None
    embeddings: Optional[int] = None


# Feedback Schemas
class FeedbackCreate(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    ai_response: Optional[str] = Field(None, max_length=1000)  # Optional, shortened
    feedback_type: FeedbackTypeEnum
    comment: Optional[str] = Field(None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    message: str
    ai_response: Optional[str]
    feedback_type: FeedbackTypeEnum
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class FeedbackListResponse(FeedbackResponse):
    username: Optional[str] = None  # Include username for admin view
