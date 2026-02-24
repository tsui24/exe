"""
Database layer for PDF management using SQLite with async support.
"""

import aiosqlite
import os
from pathlib import Path
from typing import Optional
from contextlib import asynccontextmanager

# Database file location
DB_PATH = Path(__file__).parent / "pdfs.db"


async def init_database() -> None:
    """
    Initialize the database schema.
    Creates the pdfs table and indexes if they don't exist.
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
async def get_db():
    """
    Async context manager for database connections.
    
    Usage:
        async with get_db() as db:
            cursor = await db.execute("SELECT * FROM pdfs")
            rows = await cursor.fetchall()
    """
    async with aiosqlite.connect(DB_PATH) as db:
        # Enable row factory for dict-like access
        db.row_factory = aiosqlite.Row
        yield db


async def insert_pdf(
    user_id: str,
    filename: str,
    file_hash: str,
    file_size: int,
    storage_path: str
) -> int:
    """
    Insert a new PDF record into the database.
    
    Returns:
        int: The ID of the inserted record
    
    Raises:
        aiosqlite.IntegrityError: If (user_id, filename) already exists
    """
    async with get_db() as db:
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
    """
    Get a PDF record by user_id and filename.
    
    Returns:
        dict with keys: id, user_id, filename, file_hash, file_size, storage_path, upload_date
        or None if not found
    """
    async with get_db() as db:
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
    """
    Get a PDF record by user_id and file_hash (to detect duplicates).
    
    Returns:
        dict or None if not found
    """
    async with get_db() as db:
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
    """
    Get all PDFs for a specific user.
    
    Returns:
        list of dicts, each with keys: filename, file_size, upload_date
    """
    async with get_db() as db:
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


async def delete_pdf(user_id: str, filename: str) -> bool:
    """
    Delete a PDF record from the database.
    
    Returns:
        bool: True if a record was deleted, False if not found
    """
    async with get_db() as db:
        cursor = await db.execute(
            """
            DELETE FROM pdfs
            WHERE user_id = ? AND filename = ?
            """,
            (user_id, filename)
        )
        await db.commit()
        return cursor.rowcount > 0
