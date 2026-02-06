from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from .models import TradeOffer
from app.cards.models import Card
from app.auth.models import User
from app.trades.models import TradeStatus
from sqlalchemy.orm import selectinload
from sqlmodel import select
from datetime import datetime, timezone

# Lock cards confirmed in trade or split them if quantity used is less than total quantity
async def handle_trade_confirmed(trade: TradeOffer, session: AsyncSession):
    for item in trade.trade_items:
        card = item.card

        used_qty = item.quantity
        total_qty = card.quantity

        if used_qty > total_qty:
            raise HTTPException(
                status_code=400,
                detail="Trade item quantity exceeds card quantity"
            )
        if used_qty == total_qty:
            card.locked = True
        else:
            remaining_qty = total_qty - used_qty

            card.quantity = used_qty
            card.locked = True

            leftover_card = Card(
                name=card.name,
                set_name=card.set_name,
                rarity=card.rarity,
                price=card.price,
                image_url=card.image_url,
                owner_id=card.owner_id,
                quantity=remaining_qty,
                intent=card.intent,
                locked=False,
                #maybe set date_added to now?
            )

            session.add(leftover_card)

# If user has add to collection setting enabled, create new card for them on trade completion
async def handle_trade_completed(trade: TradeOffer, session: AsyncSession):
    stmt = (
        select(User)
        .where(User.id == trade.a_user_id)
        .options(
            selectinload(User.settings),
        )
    )
    result = await session.exec(stmt)
    a_user = result.one()
    stmt = (
        select(User)
        .where(User.id == trade.b_user_id)
        .options(
            selectinload(User.settings),
        )
    )
    result = await session.exec(stmt)
    b_user = result.one()
    for item in trade.trade_items:
        card = item.card
        user_id = None
        if (card.owner_id == trade.a_user_id and b_user.settings.add_cards_to_collection_after_trade):
            user_id = trade.b_user_id
        elif (card.owner_id == trade.b_user_id and a_user.settings.add_cards_to_collection_after_trade):
            user_id = trade.a_user_id
        if user_id:
            new_card = Card(
                name=card.name,
                set_name=card.set_name,
                rarity=card.rarity,
                price=card.price,
                image_url=card.image_url,
                owner_id=user_id,
                quantity=item.quantity,
                intent="have",
                locked=False,
            )
            session.add(new_card)

async def check_status_update(trade: TradeOffer, previous_status: TradeStatus, session: AsyncSession):
    if(previous_status != TradeStatus.SHIP and trade.status == TradeStatus.SHIP):
        await handle_trade_confirmed(trade, session)
    elif previous_status != TradeStatus.COMPLETED and trade.status == TradeStatus.COMPLETED:
        await handle_trade_completed(trade, session)

async def view_trade(trade: TradeOffer, user: User):
    if user.id == trade.a_user_id:
        trade.a_viewed = datetime.now(timezone.utc)
    elif user.id == trade.b_user_id:
        trade.b_viewed = datetime.now(timezone.utc)
    else:
        raise HTTPException(status_code=403, detail="Not a participant in this trade")