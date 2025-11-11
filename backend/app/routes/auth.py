from fastapi import APIRouter, Depends, HTTPException, status
import logging
import sys
from sqlmodel import Session, select
from datetime import timedelta
from .cards import get_current_user
from ..database import get_session
from ..models import User, Card
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

logger = logging.getLogger(__name__)

@router.post("/signup")
def signup(username: str, email: str, password: str, session: Session = Depends(get_session)):
    # DEBUG: log incoming values for troubleshooting. Remove in production!
    try:
        pw_bytes = password.encode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid password encoding")

    # print minimal debug info to stderr so it's visible in the server terminal
    try:
        logger.debug(
            "signup called: username=%r email=%r password_type=%s password_repr=%r pwd_bytes_len=%d",
            username,
            email,
            type(password).__name__,
            password,
            len(pw_bytes),
        )
    except Exception:
        # Ensure debug printing never crashes the endpoint
        print(f"[DEBUG] signup: username={username!r} email={email!r} (error logging password details)", file=sys.stderr)

    # Also print to stderr so it's visible even if logging is not configured for DEBUG
    print(f"[DEBUG] signup called - username={username!r} email={email!r} pwd_bytes_len={len(pw_bytes)}", file=sys.stderr)

    if len(pw_bytes) > 72:
        # Don't attempt to hash very long inputs; give a clear error to the client
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

@router.get("/me", response_model=list[Card])
def my_cards(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Card).where(Card.owner_id == user.id)).all()