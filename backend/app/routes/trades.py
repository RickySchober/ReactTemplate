from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from .auth import get_current_user
from ..database import get_session
from ..models import User, Card, TradeOffer

router = APIRouter(prefix="/trades", tags=["trades"])

@router.post("/", response_model=TradeOffer)
def create_trade_offer(trade: TradeOffer, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    session.add(trade)
    session.commit()
    session.refresh(trade)
    return trade

@router.get("/{trade_id}", response_model=list[TradeOffer])
def get_trade_offer(trade_id: int, session: Session = Depends(get_session)):
    trade = session.get(TradeOffer, trade_id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade offer not found")
    return trade