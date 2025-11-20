from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from .auth import get_current_user
from ..database import get_session
from ..models import User, Card, TradeOffer, TradeItem, TradeOfferRead, TradeOfferCreate

router = APIRouter(prefix="/trades", tags=["trades"])

@router.post("/", response_model=TradeOffer)
def create_trade_offer(data: TradeOfferCreate, session: Session = Depends(get_session)):
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
def get_single_trade_offer(trade_id: int, session: Session = Depends(get_session)):
    trade = (select(TradeOffer)
            .where(TradeOffer.id == trade_id)
            .options(
            selectinload(TradeOffer.a_user),
            selectinload(TradeOffer.b_user),
            selectinload(TradeOffer.trade_items)
                .selectinload(TradeItem.card)
            ))
    return session.exec(trade).one_or_none()

# Get all trades for a specific user ID
@router.get("/user/{user_id}", response_model=list[TradeOfferRead]) 
def get_user_trades(user_id: int, session: Session = Depends(get_session)):
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