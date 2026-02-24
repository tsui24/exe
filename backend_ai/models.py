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


class SubscriptionPlan(str, enum.Enum):
    """Subscription plan enum."""
    free = "free"
    normal = "normal"
    pro = "pro"


class PaymentStatus(str, enum.Enum):
    """Payment status enum."""
    pending = "pending"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    subscription_plan = Column(SQLEnum(SubscriptionPlan), default=SubscriptionPlan.free, nullable=False)
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")

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


class Payment(Base):
    """Payment model for subscription payments."""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    order_code = Column(String(100), unique=True, nullable=False, index=True)  # PayOS order code
    amount = Column(Integer, nullable=False)  # Amount in VND
    subscription_plan = Column(SQLEnum(SubscriptionPlan), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.pending, nullable=False)
    payment_url = Column(String(500), nullable=True)  # PayOS payment URL
    transaction_id = Column(String(100), nullable=True)  # PayOS transaction ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", back_populates="payments")

    def __repr__(self):
        return f"<Payment(id={self.id}, order_code={self.order_code}, amount={self.amount}, status={self.status})>"
