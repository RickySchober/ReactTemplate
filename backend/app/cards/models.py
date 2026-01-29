from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.sql import func
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from app.auth.models import User
    from app.trades.models import TradeItem

class Card(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    set_name: str
    rarity: str
    price: float
    image_url: str
    owner_id: UUID = Field(default=None, foreign_key="user.id")
    owner: Optional["User"] = Relationship(back_populates="cards")
    quantity: int = Field(default=1, nullable=False)
    intent: str = Field(default="have", nullable=False)
    trade_items: List["TradeItem"] = Relationship(back_populates="card")
    date_added: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),  # client-side default
        sa_column=Column(DateTime(timezone=True), server_default=func.now())
    )
    locked: bool = Field(default=False, nullable=False) # Cards are locked on trade confirmation
    


