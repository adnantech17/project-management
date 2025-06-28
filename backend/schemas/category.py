from pydantic import BaseModel
from typing import Optional, List
import uuid
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    color: str = "#3B82F6"
    position: int = 0

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    position: Optional[int] = None

class CategoryOut(CategoryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CategoryReorder(BaseModel):
    id: uuid.UUID
    position: int