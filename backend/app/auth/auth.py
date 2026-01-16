#Auth route handles user signup, login, and fetching user-specific data
from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload
from app.database import get_session
from app.cards.schemas import CardRead
from app.cards.models import Card
from .models import User, UserAddress, UserSettings
from .schemas import UserProfileRead, UserRead, SignupRequest
from .services import hash_password, create_access_token, get_current_user
from .dependencies import validate_signup, validate_login

from uuid import UUID

router = APIRouter(prefix="/auth", tags=["auth"])

#Creates user in database with all default account settings and returns token
@router.post("/signup")
async def signup(data: SignupRequest = Depends(validate_signup), session: AsyncSession = Depends(get_session)):
    user = User(username=data.username, email=data.email, hashed_password=hash_password(data.password))
    session.add(user)
    await session.commit()
    await session.refresh(user)

    settings = UserSettings(user_id=user.id, disable_warning=False,backsplash="Gudul_Lurker.jpg",dark_mode=True,email_notifications=False)
    address = UserAddress(user_id=user.id, full_name="", street="",city="",state="",zip_code="",country="")
    session.add(settings)
    session.add(address)
    await session.commit()

    token = create_access_token({"user_id": str(user.id)})
    return {"access_token": token, "message": "User created", "user_id": user.id}

#Login and return authentication token
@router.post("/login")
async def login(user: User = Depends(validate_login)):
    token = create_access_token({"user_id": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

#Get user profile
@router.get("/me", response_model=UserProfileRead)
async def read_users_me(current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    stmt = (
        select(User)
        .where(User.id == current_user.id)
        .options(
            selectinload(User.settings),
            selectinload(User.address),
        )
    )
    result = await session.exec(stmt)
    db_user = result.one()

    return db_user

#Get user cards
@router.get("/my_cards", response_model=list[CardRead])
async def my_cards(user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Card).where(Card.owner_id == user.id))
    return result.all()

#Minimal get user that doesn't require authentication
@router.get("/user/{user_id}", response_model=UserRead)
async def get_user(user_id: UUID, session: AsyncSession = Depends(get_session)):
    return await session.get(User, user_id)

#Verbose get user which requires authentication
@router.get("/user_full/{user_id}", response_model=UserProfileRead)
async def get_user(user_id: UUID, session: AsyncSession = Depends(get_session)):
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.settings),
            selectinload(User.address),
        )
    )
    result = await session.exec(stmt)
    db_user = result.one()

    return db_user

#Update user profile including settings
@router.patch("/me", response_model=UserProfileRead)
async def update_profile(data: UserProfileRead, session: AsyncSession = Depends(get_session), user: User=Depends(get_current_user)):
    stmt = (
        select(User)
        .where(User.id == user.id)
        .options(
            selectinload(User.settings),
            selectinload(User.address),
        )
    )
    result = await session.exec(stmt)
    db_user = result.one()
    if data.settings:
        if not db_user.settings:
            db_user.settings = UserSettings(user_id=db_user.id)

        settings_data = data.settings.dict(exclude_none=True)
        for key, value in settings_data.items():
            setattr(db_user.settings, key, value)

    if data.address:
        if not db_user.address:
            db_user.address = UserAddress(user_id=db_user.id)

        addr_data = data.address.dict(exclude_none=True)
        for key, value in addr_data.items():
            setattr(db_user.address, key, value)

    session.add(db_user)
    await session.commit()

    return db_user