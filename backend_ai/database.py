import aiosqlite
import os
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# =============================================================================
# Local PDF Management (Async SQLite)
# =============================================================================

# Database file location
DB_PATH = Path(__file__).parent / "pdfs.db"


async def init_database() -> None:
    """
    Initialize the database schema for PDF metadata.
    """
    async with aiosqlite.connect(DB_PATH) as db:
        # Create pdfs table
        await db.execute("""
            CREATE TABLE IF NOT EXISTS pdfs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_hash TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                storage_path TEXT NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, filename)
            )
        """)
        
        # Create indexes for faster lookups
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_id ON pdfs(user_id)
        """)
        
        await db.execute("""
            CREATE INDEX IF NOT EXISTS idx_file_hash ON pdfs(file_hash)
        """)
        
        await db.commit()


@asynccontextmanager
async def get_pdf_db():
    """
    Async context manager for PDF database connections (SQLite).
    """
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db


async def insert_pdf(
    user_id: str,
    filename: str,
    file_hash: str,
    file_size: int,
    storage_path: str
) -> int:
    async with get_pdf_db() as db:
        cursor = await db.execute(
            """
            INSERT INTO pdfs (user_id, filename, file_hash, file_size, storage_path)
            VALUES (?, ?, ?, ?, ?)
            """,
            (user_id, filename, file_hash, file_size, storage_path)
        )
        await db.commit()
        return cursor.lastrowid


async def get_pdf_by_name(user_id: str, filename: str) -> Optional[dict]:
    async with get_pdf_db() as db:
        cursor = await db.execute(
            """
            SELECT id, user_id, filename, file_hash, file_size, storage_path, upload_date
            FROM pdfs
            WHERE user_id = ? AND filename = ?
            """,
            (user_id, filename)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None


async def get_pdf_by_hash(user_id: str, file_hash: str) -> Optional[dict]:
    async with get_pdf_db() as db:
        cursor = await db.execute(
            """
            SELECT id, user_id, filename, file_hash, file_size, storage_path, upload_date
            FROM pdfs
            WHERE user_id = ? AND file_hash = ?
            """,
            (user_id, file_hash)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None


async def get_user_pdfs(user_id: str) -> list[dict]:
    async with get_pdf_db() as db:
        cursor = await db.execute(
            """
            SELECT filename, file_size, upload_date
            FROM pdfs
            WHERE user_id = ?
            ORDER BY upload_date DESC
            """,
            (user_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def delete_pdf_metadata(user_id: str, filename: str) -> bool:
    async with get_pdf_db() as db:
        cursor = await db.execute(
            """
            DELETE FROM pdfs
            WHERE user_id = ? AND filename = ?
            """,
            (user_id, filename)
        )
        await db.commit()
        return cursor.rowcount > 0


# =============================================================================
# Remote Auth & Admin Management (SQLAlchemy)
# =============================================================================

# Load environment variables from .env file
load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:@localhost:3306/ki8_exe"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session (SQLAlchemy).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables (SQLAlchemy).
    """
    Base.metadata.create_all(bind=engine)
