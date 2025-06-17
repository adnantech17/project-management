from pydantic import BaseModel
from typing import Optional, TYPE_CHECKING
import uuid
from datetime import datetime

if TYPE_CHECKING:
    from .category import CategoryOut

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    expiry_date: Optional[datetime] = None
    position: int = 0

class TicketCreate(TicketBase):
    category_id: uuid.UUID

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    expiry_date: Optional[datetime] = None
    position: Optional[int] = None
    category_id: Optional[uuid.UUID] = None

class TicketOut(TicketBase):
    id: uuid.UUID
    category_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TicketWithCategory(TicketOut):
    category: "CategoryOut" 