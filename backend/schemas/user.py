from pydantic import BaseModel
from typing import Optional
import uuid

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    email: str
    password: str

class UserLogin(UserBase):
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture: Optional[str] = None  # Base64 encoded image

class UserOut(UserBase):
    email: str
    id: uuid.UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture: Optional[str] = None
    
    class Config:
        orm_mode = True 

class UserAssigned(BaseModel):
    id: uuid.UUID
    username: str
    profile_picture: Optional[str] = None
    
    class Config:
        from_attributes = True 