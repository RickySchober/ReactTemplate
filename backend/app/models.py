from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum
from pydantic import Field as PydanticField


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    cards: List["Card"] = Relationship(back_populates="owner")
    sent_offers: List["TradeOffer"] = Relationship(
        back_populates="a_user",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.a_user_id"},
    )

    received_offers: List["TradeOffer"] = Relationship(
        back_populates="b_user",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.b_user_id"},
    )

class Card(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    set_name: str
    rarity: str
    price: float
    image_url: str
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="cards")
    quantity: int = Field(default=1, nullable=False)
    intent: str = Field(default="have", nullable=False)
    trade_items: List["TradeItem"] = Relationship(back_populates="card")

#Model for updating modifiable fields of Card
class CardUpdate(SQLModel, table=False):
    quantity: Optional[int] = None
    price: Optional[str] = None

#All possible trade statuses
class TradeStatus(str, Enum):
  PROPOSED = "proposed"
  COUNTERED = "countered"
  ACCEPTED = "accepted"
  SHIPPED = "shipped"
  RECEIVED = "received"
  COMPLETED = "completed"
  CANCELED = "canceled"
#User driving current status
class ActiveUser(str, Enum):
    NONE = "none",
    A = "a",
    B = "b",
    BOTH = "both",

class TradeItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    quantity: int = Field(default=1)

    card_id: int = Field(foreign_key="card.id")
    card: "Card" = Relationship(back_populates="trade_items")

    trade_id: int = Field(foreign_key="tradeoffer.id")
    trade: "TradeOffer" = Relationship(back_populates="trade_items")

class TradeOffer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    a_user_id: int = Field(foreign_key="user.id")
    b_user_id: int = Field(foreign_key="user.id")

    a_user: User = Relationship(
        back_populates="sent_offers",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.a_user_id"},
    )

    b_user: User = Relationship(
        back_populates="received_offers",
        sa_relationship_kwargs={"foreign_keys": "TradeOffer.b_user_id"},
    )

    trade_items: List["TradeItem"] = Relationship(back_populates="trade")

    status: TradeStatus = Field(default=TradeStatus.CANCELED)
    activeUser: ActiveUser = Field(default=ActiveUser.NONE)


#
# Return models to return relevant information in nested relations
#

class TradeItemCreate(SQLModel):
    card_id: int
    quantity: int

class TradeOfferCreate(SQLModel):
    a_user_id: int
    b_user_id: int
    status: TradeStatus = TradeStatus.PROPOSED
    activeUser: ActiveUser = ActiveUser.NONE
    trade_items: List[TradeItemCreate]

class UserRead(SQLModel):
    id: int
    username: str

class CardRead(SQLModel):
    id: int 
    name: str
    set_name: str
    rarity: str
    price: float
    image_url: str
    quantity: int
    owner_id: int 
    intent: str

class TradeItemRead(SQLModel):
    id: int
    card: Optional[CardRead]
    quantity: int

class TradeOfferRead(SQLModel):
    id: int
    status: TradeStatus
    activeUser: ActiveUser

    a_user: Optional[UserRead]
    b_user: Optional[UserRead]

    trade_items: List[TradeItemRead] = PydanticField(default_factory=list)

