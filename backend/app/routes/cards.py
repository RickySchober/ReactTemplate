from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from ..database import get_session
from ..models import User, Card
from ..auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/cards", tags=["cards"])

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

@router.post("/", response_model=Card)
def create_card(card: Card, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    card.owner_id = user.id
    session.add(card)
    session.commit()
    session.refresh(card)
    return card

@router.get("/users/{user_id}/", response_model=list[Card])
def get_user_cards(user_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Card).where(Card.owner_id == user_id)).all()

@router.get("/search/", response_model=list[Card])
def get_search_results(name: str, setName: str = "", session: Session = Depends(get_session)):
    if(setName == ""):
        statement = select(Card).where(Card.name.contains(name))
    else:
        statement = select(Card).where(
            (Card.name.contains(name)) |
            (Card.set_name.contains(setName))
        )
    return session.exec(statement).all()