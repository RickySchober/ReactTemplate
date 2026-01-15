from sqlmodel import SQLModel
from typing import List
from uuid import UUID
from app.cards.schemas import CardRead
from app.auth.schemas import UserRead
from .models import TradeStatus, ActiveUser

class TradeItemWrite(SQLModel):
    card_id: UUID
    quantity: int

class TradeOfferWrite(SQLModel):
    a_user_id: UUID
    b_user_id: UUID
    status: TradeStatus = TradeStatus.PENDING
    activeUser: ActiveUser = ActiveUser.NONE
    trade_items: List["TradeItemWrite"]

class TradeItemRead(SQLModel):
    id: UUID
    quantity: int
    card: "CardRead"


class TradeOfferRead(SQLModel):
    id: UUID
    a_user: "UserRead"
    b_user: "UserRead"
    trade_items: list["TradeItemRead"]
    status: TradeStatus
    activeUser: ActiveUser

TradeItemRead.model_rebuild()
TradeOfferRead.model_rebuild()
