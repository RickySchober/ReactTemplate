from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from app.cards.models import Card
    from app.trades.models import TradeOffer

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
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

    settings: Optional["UserSettings"] = Relationship(back_populates="user")
    address: Optional["UserAddress"] = Relationship(back_populates="user")

class UserSettings(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)

    disable_warning: bool = Field(default=False)
    backsplash: str
    dark_mode: bool = Field(default=True)
    email_notifications: bool = Field(default=True)

    user: "User" = Relationship(back_populates="settings")


class UserAddress(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)

    full_name: str
    street: str
    city: str
    state: str = Field(max_length=2)   
    zip_code: str                     
    country: str = Field(default="USA")

    user: "User" = Relationship(back_populates="address")


