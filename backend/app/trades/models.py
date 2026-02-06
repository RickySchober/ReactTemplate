from sqlmodel import SQLModel, Field, Relationship
from typing import List, TYPE_CHECKING
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy.sql import func
from sqlalchemy import Column, DateTime
if TYPE_CHECKING:
    from app.auth.models import User
    from app.cards.models import Card

#All possible trade statuses
class TradeStatus(str, Enum):
  PENDING = "pending"
  PROPOSE = "propose"
  SHIP = "ship"
  RECEIVE = "receive"
  COMPLETED = "completed"
  CANCELED = "canceled"
#User driving current status
class ActiveUser(str, Enum):
    NONE = "none",
    A = "a",
    B = "b",
    BOTH = "both",

class TradeItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    quantity: int = Field(default=1)

    card_id: UUID = Field(foreign_key="card.id")
    card: "Card" = Relationship(back_populates="trade_items")

    trade_id: UUID = Field(foreign_key="tradeoffer.id")
    trade: "TradeOffer" = Relationship(back_populates="trade_items")

class TradeOffer(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    a_user_id: UUID = Field(foreign_key="user.id")
    b_user_id: UUID = Field(foreign_key="user.id")
    a_user: "User" = Relationship(
        back_populates="sent_offers",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.a_user_id"},
    )

    b_user: "User" = Relationship(
        back_populates="received_offers",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.b_user_id"},
    )

    trade_items: List["TradeItem"] = Relationship(back_populates="trade")

    status: TradeStatus = Field(default=TradeStatus.CANCELED)
    activeUser: ActiveUser = Field(default=ActiveUser.NONE)
    date_added: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    # Timestamp of last update
    last_updated: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), 
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    # Timestamp when the non-active user last viewed the trade
    a_viewed: datetime = Field( 
        default_factory=lambda: datetime.now(timezone.utc),  
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    b_viewed: datetime = Field( 
        default_factory=lambda: datetime.now(timezone.utc),  
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
