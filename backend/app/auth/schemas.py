from sqlmodel import SQLModel
from uuid import UUID

# Minimal user info for general use
class UserRead(SQLModel):
    id: UUID
    username: str

class UserSettingsRead(SQLModel):
    disable_warning: bool
    backsplash: str
    dark_mode: bool
    email_notifications: bool

class UserAddressRead(SQLModel):
    full_name: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str
# Full user profile for logged in users and trade partners
class UserProfileRead(SQLModel):
    id: UUID
    username: str
    email: str
    settings: UserSettingsRead
    address: UserAddressRead