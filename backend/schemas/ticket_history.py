from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class TicketHistoryBase(BaseModel):
    action_type: str
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    from_category_name: Optional[str] = None
    to_category_name: Optional[str] = None

class TicketHistoryCreate(TicketHistoryBase):
    ticket_id: uuid.UUID
    user_id: uuid.UUID

class TicketHistoryOut(TicketHistoryBase):
    id: uuid.UUID
    ticket_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    ticket_title: Optional[str] = None

    class Config:
        from_attributes = True 