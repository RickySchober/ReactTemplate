#Trades routes manages trades between users tracking status and all items in trade
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.database import get_session
from .models import TradeOffer, TradeItem, TradeOfferWrite, TradeOfferRead
from uuid import UUID

router = APIRouter(prefix="/trades", tags=["trades"])

#Create new trade and link related trade items and users
@router.post("/", response_model=TradeOffer)
def create_trade_offer(data: TradeOfferWrite, session: Session = Depends(get_session)):
    trade = TradeOffer(
        a_user_id=data.a_user_id,
        b_user_id=data.b_user_id,
        status=data.status,
        activeUser=data.activeUser
    )
    session.add(trade)
    session.commit()
    session.refresh(trade)

    for item in data.trade_items:
        trade_item = TradeItem(
            trade_id=trade.id,      # Relate to trade
            card_id=item.card_id,
            quantity=item.quantity,
        )
        session.add(trade_item)

    session.commit()
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
    session.refresh(trade)

    return session.exec(query).one()


# Get a single trade by its trade ID
@router.get("/{trade_id}", response_model=TradeOfferRead)
def get_single_trade_offer(trade_id: UUID, session: Session = Depends(get_session)):
    trade = (select(TradeOffer)
            .where(TradeOffer.id == trade_id)
            .options(
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
            selectinload(TradeOffer.trade_items)
                .selectinload(TradeItem.card)
            ))
    trade = session.exec(trade).one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

# Get all trades for a specific user ID
@router.get("/user/{user_id}", response_model=list[TradeOfferRead]) 
def get_user_trades(user_id: UUID, session: Session = Depends(get_session)):
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
                .selectinload(TradeItem.card)
        ))
    return session.exec(statement).all() 

#Modify a specfic trade based on its ID
@router.patch("/{trade_id}", response_model=TradeOfferRead)
def patch_trade_offer(trade_id: UUID, data: TradeOfferWrite, session: Session = Depends(get_session),):
    stmt = (
        select(TradeOffer)
        .where(TradeOffer.id == trade_id)
        .options(
            selectinload(TradeOffer.trade_items).selectinload(TradeItem.card),
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
        )
    )
    trade = session.exec(stmt).one_or_none()
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        trade.status = update_data["status"]
    if "activeUser" in update_data:
        trade.activeUser = update_data["activeUser"]

    if data.trade_items is not None:
        incoming_items = {item.id: item for item in data.trade_items if item.id}
        existing_items = {item.id: item for item in trade.trade_items}

        #Update existing items or remove if missing
        for existing_id, existing_item in list(existing_items.items()):
            if existing_id not in incoming_items:
                session.delete(existing_item)
            else:
                inc = incoming_items[existing_id]
                existing_item.quantity = inc.quantity
                existing_item.card_id = inc.card_id

        #Add new items (items without IDs)
        for inc in data.trade_items:
            if inc.id is None:
                new_item = TradeItem(
                    trade_id=trade.id,
                    card_id=inc.card_id,
                    quantity=inc.quantity,
                )
                session.add(new_item)

    session.commit()
    session.refresh(trade)

    return trade

