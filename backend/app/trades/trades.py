#Trades routes manages trades between users tracking status and all items in trade
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from sqlmodel.ext.asyncio.session import AsyncSession
from app.database import get_session
from app.auth.services import get_current_user
from app.auth.models import User
from .models import TradeOffer, TradeItem
from .schemas import TradeOfferWrite, TradeOfferRead, TradeOfferPatch
from .dependencies import validate_trade_users
from .services import check_status_update, view_trade
from uuid import UUID
from datetime import datetime, timezone

router = APIRouter(prefix="/trades", tags=["trades"])

#Create new trade and link related trade items and users
@router.post("/", response_model=TradeOfferRead)
async def create_trade_offer(data: TradeOfferWrite, users: tuple = Depends(validate_trade_users), session: AsyncSession = Depends(get_session)):
    trade = TradeOffer(
        a_user_id=data.a_user_id,
        b_user_id=data.b_user_id,
        status=data.status,
        activeUser=data.activeUser
    )
    session.add(trade)
    await session.commit()
    await session.refresh(trade)

    for item in data.trade_items:
        trade_item = TradeItem(
            trade_id=trade.id,      # Relate to trade
            card_id=item.card_id,
            quantity=item.quantity,
        )
        session.add(trade_item)

    await session.commit()
    # reload WITH nested relationships
    query = (
        select(TradeOffer)
        .where(TradeOffer.id == trade.id)
        .options(
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
            selectinload(TradeOffer.trade_items)
                .selectinload(TradeItem.card)
        )
    )
    await session.refresh(trade)

    result = await session.exec(query)
    trade = result.one()
    return trade


# Get a single trade by its trade ID
@router.get("/{trade_id}", response_model=TradeOfferRead)
async def get_single_trade_offer(trade_id: UUID, session: AsyncSession = Depends(get_session)):
    trade = (select(TradeOffer)
            .where(TradeOffer.id == trade_id)
            .options(
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
            selectinload(TradeOffer.trade_items)
                .selectinload(TradeItem.card)
            ))
    trade = await session.exec(trade)
    trade = trade.one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

# Get all trades for a specific user ID
@router.get("/user/{user_id}", response_model=list[TradeOfferRead]) 
async def get_user_trades(user_id: UUID, session: AsyncSession = Depends(get_session)):
    statement = (
        select(TradeOffer)
        .where(
            (TradeOffer.a_user_id == user_id) |
            (TradeOffer.b_user_id == user_id)
        )
        .options(
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
            selectinload(TradeOffer.trade_items)
                .selectinload(TradeItem.card),
        ))
    result = await session.exec(statement)
    trades = result.all()
    return trades

#Modify a specfic trade based on its ID
@router.patch("/{trade_id}", response_model=TradeOfferRead)
async def patch_trade_offer(trade_id: UUID, data: TradeOfferPatch, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    stmt = (
        select(TradeOffer)
        .where(TradeOffer.id == trade_id)
        .options(
            selectinload(TradeOffer.trade_items).selectinload(TradeItem.card),
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
        )
        .execution_options(populate_existing=True)
    )
    result = await session.exec(stmt)
    trade = result.one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    previous_status = trade.status
    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        trade.status = update_data["status"]
        # If trade status changed handle side effects
        await check_status_update(trade, previous_status, session)      
    if "activeUser" in update_data:
        trade.activeUser = update_data["activeUser"]

    if data.trade_items is not None:
        incoming_items = {item.id: item for item in data.trade_items if item.id}
        existing_items = {item.id: item for item in trade.trade_items}

        #Update existing items or remove if missing
        for existing_id, existing_item in list(existing_items.items()):
            if existing_id not in incoming_items:
                await session.delete(existing_item)
            else:
                inc = incoming_items[existing_id]
                existing_item.quantity = inc.quantity
                existing_item.card_id = inc.card_id

        #Add new items (items without IDs)
        for inc in data.trade_items:
            if inc.id is None:
                new_item = TradeItem(
                    trade_id=trade_id,
                    card_id=inc.card_id,
                    quantity=inc.quantity,
                )
                session.add(new_item)
    # If a user has uptaded trade  change timestamps to notify other user
    if "status" in update_data or "activeUser" in update_data:
        trade.last_updated = datetime.now(timezone.utc)
        await view_trade(trade, user)

    await session.commit()
    result = await session.exec(stmt)
    trade = result.one()

    return trade



@router.patch("/view/{trade_id}", response_model=TradeOfferRead)
async def mark_trade_viewed(trade_id: UUID, user: User = Depends(get_current_user), session: AsyncSession = Depends(get_session)):
    stmt = (
        select(TradeOffer)
        .where(TradeOffer.id == trade_id)
        .options(
            selectinload(TradeOffer.trade_items).selectinload(TradeItem.card),
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
        )
        .execution_options(populate_existing=True)
    )
    result = await session.exec(stmt)
    trade = result.one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    
    await view_trade(trade, user)
    await session.commit()
    result = await session.exec(stmt)
    trade = result.one()

    return trade
