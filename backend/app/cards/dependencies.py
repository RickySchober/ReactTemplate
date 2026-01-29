from fastapi import Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.cards.models import Card
from app.auth.services import get_current_user
from app.trades.models import TradeItem, TradeOffer, TradeStatus
from app.auth.models import User
from app.database import get_session
from uuid import UUID

async def verify_card(card: Card, user: User = Depends(get_current_user)) -> Card:
    card.owner_id = user.id
    card.owner = user
    if card.intent not in ("have", "want"):
        raise HTTPException(status_code=400, detail="intent must be 'have' or 'want'")
    if card.quantity is None or card.quantity < 1:
        card.quantity = 1

    return card

async def verify_card_by_id(card_id: UUID, session: AsyncSession = Depends(get_session)) -> Card:
    card = await session.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card

async def verify_not_locked_in_trade(card: Card = Depends(verify_card_by_id), session: AsyncSession = Depends(get_session)) -> Card:
    result = await session.exec(
        select(TradeItem)
        .join(TradeOffer)
        .where(
            TradeItem.card_id == card.id,
            (TradeOffer.status == TradeStatus.SHIP) | 
            (TradeOffer.status == TradeStatus.RECEIVE)
        )
    )
    confirmed_use = result.first()
    if confirmed_use or card.locked:
        raise HTTPException(status_code=400, detail="Card is currently locked in a confirmed trade and cannot be modified")
    return card