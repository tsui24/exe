"""
PDF Storage Layer - Manages PDF files on filesystem and metadata in database.
"""

import hashlib
import os
from pathlib import Path
from typing import Optional
import aiosqlite

from .database import (
    get_pdf_by_name,
    get_pdf_by_hash,
    insert_pdf,
    get_user_pdfs as db_get_user_pdfs,
    delete_pdf_metadata as db_delete_pdf
)

# Base directory for PDF storage
STORAGE_BASE = Path(__file__).parent / "pdf_storage"


def _compute_file_hash(file_bytes: bytes) -> str:
    """
    Compute SHA256 hash of file content for deduplication.
    
    Returns:
        str: Hash in format "sha256:hexdigest"
    """
    sha256 = hashlib.sha256(file_bytes).hexdigest()
    return f"sha256:{sha256}"


def _get_storage_path(user_id: str, filename: str) -> str:
    """
    Get the storage path for a PDF file.
    
    Returns:
        str: Relative path like "pdf_storage/user_001/document.pdf"
    """
    return str(STORAGE_BASE / user_id / filename)


def _ensure_user_directory(user_id: str) -> None:
    """
    Create user's PDF directory if it doesn't exist.
    """
    user_dir = STORAGE_BASE / user_id
    user_dir.mkdir(parents=True, exist_ok=True)


async def save_pdf(
    user_id: str,
    filename: str,
    file_bytes: bytes
) -> dict:
    """
    Save a PDF file to storage and database.
    Handles deduplication: if file with same hash exists, returns existing info.
    If filename exists with different hash, raises error.
    
    Args:
        user_id: User identifier
        filename: Desired filename (should include .pdf extension)
        file_bytes: PDF file content as bytes
    
    Returns:
        dict: {
            "filename": str,
            "file_hash": str,
            "file_size": int,
            "storage_path": str,
            "is_new": bool  # True if new file, False if duplicate
        }
    
    Raises:
        FileExistsError: If filename exists with different content
        ValueError: If filename is invalid
    """
    # Validate filename
    if not filename or not filename.endswith('.pdf'):
        raise ValueError("Filename must end with .pdf")
    
    # Compute file hash and size
    file_hash = _compute_file_hash(file_bytes)
    file_size = len(file_bytes)
    
    # Check for duplicate by hash (same content)
    existing_by_hash = await get_pdf_by_hash(user_id, file_hash)
    if existing_by_hash:
        # Same file already exists, return existing info
        return {
            "filename": existing_by_hash["filename"],
            "file_hash": file_hash,
            "file_size": file_size,
            "storage_path": existing_by_hash["storage_path"],
            "is_new": False
        }
    
    # Check for duplicate filename (different content)
    existing_by_name = await get_pdf_by_name(user_id, filename)
    if existing_by_name:
        # Filename exists but different hash - reject
        raise FileExistsError(
            f"Filename '{filename}' already exists for this user with different content. "
            "Please rename the file."
        )
    
    # New file - save to disk and database
    storage_path = _get_storage_path(user_id, filename)
    _ensure_user_directory(user_id)
    
    # Write file to disk
    with open(storage_path, 'wb') as f:
        f.write(file_bytes)
    
    # Insert metadata into database
    try:
        await insert_pdf(
            user_id=user_id,
            filename=filename,
            file_hash=file_hash,
            file_size=file_size,
            storage_path=storage_path
        )
    except aiosqlite.IntegrityError as e:
        # Cleanup file if DB insert fails
        if os.path.exists(storage_path):
            os.remove(storage_path)
        raise e
    
    return {
        "filename": filename,
        "file_hash": file_hash,
        "file_size": file_size,
        "storage_path": storage_path,
        "is_new": True
    }


async def get_pdf_info(user_id: str, filename: str) -> Optional[dict]:
    """
    Get information about a PDF file.
    
    Returns:
        dict: {
            "filename": str,
            "storage_path": str,
            "file_hash": str,
            "file_size": int
        } or None if not found
    """
    pdf = await get_pdf_by_name(user_id, filename)
    if not pdf:
        return None
    
    return {
        "filename": pdf["filename"],
        "storage_path": pdf["storage_path"],
        "file_hash": pdf["file_hash"],
        "file_size": pdf["file_size"]
    }


async def get_user_pdfs(user_id: str) -> list[dict]:
    """
    List all PDFs for a user.
    
    Returns:
        list of dicts: [{
            "filename": str,
            "file_size": int,
            "upload_date": str
        }]
    """
    return await db_get_user_pdfs(user_id)


async def delete_pdf(user_id: str, filename: str) -> bool:
    """
    Delete a PDF file from storage and database.
    
    Returns:
        bool: True if deleted, False if not found
    """
    # Get file info first
    pdf_info = await get_pdf_by_name(user_id, filename)
    if not pdf_info:
        return False
    
    # Delete from database
    deleted = await db_delete_pdf(user_id, filename)
    
    if deleted:
        # Delete file from disk
        storage_path = pdf_info["storage_path"]
        if os.path.exists(storage_path):
            os.remove(storage_path)
        
        # Try to remove user directory if empty
        user_dir = STORAGE_BASE / user_id
        try:
            if user_dir.exists() and not any(user_dir.iterdir()):
                user_dir.rmdir()
        except OSError:
            # Directory not empty or other error - ignore
            pass
    
    return deleted


def load_pdf_bytes(storage_path: str) -> bytes:
    """
    Load PDF file bytes from disk (synchronous helper).
    
    Args:
        storage_path: Path to the PDF file
    
    Returns:
        bytes: File content
    
    Raises:
        FileNotFoundError: If file doesn't exist
    """
    if not os.path.exists(storage_path):
        raise FileNotFoundError(f"PDF file not found at {storage_path}")
    
    with open(storage_path, 'rb') as f:
        return f.read()
