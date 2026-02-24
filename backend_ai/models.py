"""
Database models.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base


class DocumentType(str, enum.Enum):
    """Document type enum."""
    pdf = "pdf"
    docx = "docx"
    image = "image"
    xlsx = "xlsx"


class DocumentStatus(str, enum.Enum):
    """Document status enum."""
    processing = "processing"
    processed = "processed"
    error = "error"


class FeedbackType(str, enum.Enum):
    """Feedback type enum."""
    like = "like"
    dislike = "dislike"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Document(Base):
    """Document model for user uploads."""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(DocumentType), nullable=True)
    size = Column(Integer, nullable=False)  # size in bytes
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.error, nullable=False)
    processing_time = Column(Float, nullable=True)  # in seconds
    chunks = Column(Integer, nullable=True)
    embeddings = Column(Integer, nullable=True)

    # Relationship
    user = relationship("User", back_populates="documents")

    def __repr__(self):
        return f"<Document(id={self.id}, name={self.name}, user_id={self.user_id})>"


class Feedback(Base):
    """Feedback model for AI chat responses."""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    message = Column(String(500), nullable=False)  # User's message
    ai_response = Column(String(1000), nullable=True)  # AI's response (optional, shortened)
    feedback_type = Column(SQLEnum(FeedbackType), nullable=False)  # like or dislike
    comment = Column(String(1000), nullable=True)  # Optional comment for dislike
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    user = relationship("User", back_populates="feedbacks")

    def __repr__(self):
        return f"<Feedback(id={self.id}, user_id={self.user_id}, type={self.feedback_type})>"
