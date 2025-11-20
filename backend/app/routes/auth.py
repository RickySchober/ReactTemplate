# Auth route handles user signup, login, and fetching user-specific data
from fastapi import APIRouter, Depends, HTTPException, status
import logging
import sys
from sqlmodel import Session, select
from datetime import timedelta
from ..database import get_session
from ..models import User, Card, UserRead
from ..auth import hash_password, verify_password, create_access_token
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from ..auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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
    return {"message": "User created", "user_id": user.id}

@router.post("/login")
def login(email: str, password: str, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/my_cards", response_model=list[Card])
def my_cards(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Card).where(Card.owner_id == user.id)).all()

@router.get("/user/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    return session.get(User, user_id)
