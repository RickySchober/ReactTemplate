# Card route handles creating, updating, and retrieving cards from database
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from .auth import get_current_user
from ..database import get_session
from ..models import User, Card, CardUpdate

router = APIRouter(prefix="/cards", tags=["cards"])

#Create new card and relate to its owner
@router.post("/", response_model=Card)
def create_card(card: Card, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    card.owner_id = user.id
    card.owner = user
    if card.intent not in ("have", "want"):
        raise HTTPException(status_code=400, detail="intent must be 'have' or 'want'")
    if card.quantity is None or card.quantity < 1:
        card.quantity = 1
    # If card already exists for user with same name, set_name, and intent, update quantity instead
    statement = select(Card).where(Card.owner_id == user.id,
                                   Card.name == card.name,
                                   Card.set_name == card.set_name,
                                   Card.intent == card.intent)
    existing_card = session.exec(statement).first()
    if existing_card:
        existing_card.quantity += card.quantity
        session.add(existing_card)
        session.commit()
        session.refresh(existing_card)
        return existing_card

    session.add(card)
    session.commit()
    session.refresh(card)
    return card

#Update modifiable information on card which right now is just its quantity
@router.patch("/{card_id}")
def modify_quantity(card_id: int, update: CardUpdate, session: Session = Depends(get_session)):
    card = session.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        #Remove from db if quantity 0
        if(key == "quantity" and value < 1):
            session.delete(card)
            session.commit()
            return card
        else:
            setattr(card, key, value)
    session.add(card)
    session.commit()
    session.refresh(card)
    return 

#Get all cards owned by a certain user
@router.get("/user/{user_id}", response_model=list[Card])
def get_user_cards(user_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Card).where(Card.owner_id == user_id)).all()

#Return all cards in database with specified name/setname ignoring user
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