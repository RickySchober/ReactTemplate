# Card route handles creating, updating, and retrieving cards from database
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.auth.services import get_current_user
from app.database import get_session
from .models import Card
from .schemas import CardUpdate, CardRead
from .dependencies import verify_card, verify_card_by_id
from app.auth.models import User
from uuid import UUID

router = APIRouter(prefix="/cards", tags=["cards"])

#Create new card and relate to its owner
@router.post("/", response_model=CardRead)
async def create_card(card: Card = Depends(verify_card), user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    statement = select(Card).where(Card.owner_id == user.id,
                                   Card.name == card.name,
                                   Card.set_name == card.set_name,
                                   Card.intent == card.intent)
    existing_card = await session.exec(statement)
    existing_card = existing_card.first()
    if existing_card:
        existing_card.quantity += card.quantity
        session.add(existing_card)
        await session.commit()
        await session.refresh(existing_card)
        return existing_card

    session.add(card)
    await session.commit()
    await session.refresh(card)
    return card

#Update modifiable information on card which right now is just its quantity
@router.patch("/{card_id}")
async def modify_quantity(update: CardUpdate, card: Card = Depends(verify_card_by_id), session: AsyncSession = Depends(get_session)):
    update_data = update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        #Remove from db if quantity 0
        if(key == "quantity" and value < 1):
            await session.delete(card)
            await session.commit()
            return card
        else:
            setattr(card, key, value)
    session.add(card)
    await session.commit()
    await session.refresh(card)
    return card

#Get all cards owned by a certain user
@router.get("/user/{user_id}", response_model=list[CardRead])
async def get_user_cards(user_id: UUID, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Card).where(Card.owner_id == user_id))
    return result.all()

#Return all cards in database with specified name/setname ignoring user
@router.get("/search/", response_model=list[CardRead])
async def get_search_results(name: str, setName: str = "", session: AsyncSession = Depends(get_session)):
    if(setName == ""):
        statement = select(Card).where(Card.name.contains(name))
    else:
        statement = select(Card).where(
            (Card.name.contains(name)) |
            (Card.set_name.contains(setName))
        )
    result = await session.exec(statement)
    return result.all()