from __future__ import annotations

from fastapi import APIRouter
from fastapi import Depends, HTTPException
from infra.db import SessionLocal
from infra.db import User
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter(tags=['auth'])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


pwd_context = CryptContext(schemes=['argon2', 'bcrypt'], deprecated='auto')


class RegisterRequest(BaseModel):
    username: str
    phone: str
    password: str


class LoginRequest(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    phone: str

    class Config:
        orm_mode = True


@router.post('/register')
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        return {'error': 'Phone already registered'}
    # We prefer Argon2 for hashing (configured in CryptContext). Keep a
    # defensive try/except to convert unexpected hashing errors into a clear
    # 400 response rather than allowing an internal 500.
    try:
        hashed_pw = pwd_context.hash(req.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    user = User(username=req.username, phone=req.phone, password=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(id=user.id, username=user.username, phone=user.phone)


@router.post('/login')
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == req.phone).first()
    try:
        verified = user and pwd_context.verify(req.password, user.password)
    except ValueError as e:
        # If verify raises (e.g. malformed/stub backend issues), treat as invalid
        # credentials rather than crashing the server.
        return {'error': 'Invalid phone or password'}

    if not verified:
        return {'error': 'Invalid phone or password'}
    return UserResponse(id=user.id, username=user.username, phone=user.phone)
