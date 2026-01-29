from sqlmodel import SQLModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CardUpdate(SQLModel, table=False):
    quantity: Optional[int] = None
    price: Optional[str] = None

class CardRead(SQLModel):
    id: UUID 
    name: str
    set_name: str
    rarity: str
    price: float
    image_url: str
    quantity: int
    owner_id: UUID 
    intent: str
    date_added: datetime