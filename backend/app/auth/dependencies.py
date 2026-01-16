from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database import get_session
from .models import User
from .schemas import SignupRequest
from .services import verify_password
from sqlmodel import select

async def validate_signup(data: SignupRequest, session: AsyncSession = Depends(get_session)) -> SignupRequest:
    existing = await session.exec(
        select(User).where(User.email == data.email)
    )
    if existing.first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return data

async def validate_login(email: str, password: str, session: AsyncSession = Depends(get_session)) -> User:
    user = await session.exec(select(User).where(User.email == email))
    user = user.first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

async def validate_user_exists(user_id: str, session: AsyncSession = Depends(get_session)) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user