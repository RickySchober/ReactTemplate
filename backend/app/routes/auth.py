#Auth route handles user signup, login, and fetching user-specific data

from fastapi import APIRouter, Depends, HTTPException
import logging
import sys
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from ..database import get_session
from ..models import User, Card, UserProfileRead, UserRead, UserAddress, UserSettings
from ..auth import hash_password, verify_password, create_access_token
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from ..auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

#Gets current user ensuring they have a valid authentication token to access user information
def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid token")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise credentials_exception

    user = session.get(User, user_id)
    if not user:
        raise credentials_exception
    return user

#Creates user in database with all default account settings and returns token
@router.post("/signup")
def signup(username: str, email: str, password: str, session: Session = Depends(get_session)):
    try:
        pw_bytes = password.encode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid password encoding")

    if len(pw_bytes) > 72:
        logger.warning("Password too long for bcrypt: %d bytes (user=%r)", len(pw_bytes), username)
        raise HTTPException(
            status_code=400,
            detail="Password is too long (max 72 bytes for bcrypt). Please choose a shorter password.",
        )

    existing = session.exec(select(User).where(User.email == email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(username=username, email=email, hashed_password=hash_password(password))
    session.add(user)
    session.commit()
    session.refresh(user)

    settings = UserSettings(user_id=user.id, disable_warning=False,backsplash="Gudul_Lurker.jpg",dark_mode=True,email_notifications=False)
    address = UserAddress(user_id=user.id, full_name="", street="",city="",state="",zip_code="",country="")
    session.add(settings)
    session.add(address)
    session.commit()
    query = (
        select(User)
        .where(User.id == user.id)
        .options(
            selectinload(User.address),
            selectinload(User.settings),
        )
    )
    session.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "message": "User created", "user_id": user.id}

#Login and return authentication token
@router.post("/login")
def login(email: str, password: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

#Get user profile
@router.get("/me", response_model=UserProfileRead)
def read_users_me(current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    stmt = (
        select(User)
        .where(User.id == current_user.id)
        .options(
            selectinload(User.settings),
            selectinload(User.address),
        )
    )
    db_user = session.exec(stmt).one()

    return db_user

#Get user cards
@router.get("/my_cards", response_model=list[Card])
def my_cards(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Card).where(Card.owner_id == user.id)).all()

#Minimal get user that doesn't require authentication
@router.get("/user/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    return session.get(User, user_id)

#Verbose get user which requires authentication
@router.get("/user_full/{user_id}", response_model=UserProfileRead)
def get_user(user_id: int, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.settings),
            selectinload(User.address),
        )
    )
    db_user = session.exec(stmt).one()

    return db_user

#Update user profile including settings
@router.patch("/me", response_model=UserProfileRead)
def update_profile(
    data: UserProfileRead,
    session: Session = Depends(get_session),
    user=Depends(get_current_user),
):
    db_user = session.get(User, user.id)
    print("db_user")
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
    session.commit()
    session.refresh(db_user)

    return db_user


