from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from enum import Enum
from pydantic import Field as PydanticField
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from app.auth.models import User, UserRead
    from app.cards.models import Card, CardRead

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


# Models for reading and writing to relational DB entries
# limiting data to what is accessible to end user.

class TradeItemWrite(SQLModel):
    id: UUID 
    card_id: UUID
    quantity: int

class TradeOfferWrite(SQLModel):
    a_user_id: UUID
    b_user_id: UUID
    status: TradeStatus = TradeStatus.PENDING
    activeUser: ActiveUser = ActiveUser.NONE
    trade_items: List[TradeItemWrite]

class TradeItemRead(SQLModel):
    id: UUID
    card: Optional["CardRead"]
    quantity: int

class TradeOfferRead(SQLModel):
    id: UUID
    status: TradeStatus
    activeUser: ActiveUser

    a_user: Optional["UserRead"]
    b_user: Optional["UserRead"]

    trade_items: List[TradeItemRead] = PydanticField(default_factory=list)