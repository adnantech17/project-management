from pydantic import BaseModel
import uuid

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    email: str
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    email: str
    id: uuid.UUID
    
    class Config:
        orm_mode = True 

class UserAssigned(BaseModel):
    id: uuid.UUID
    username: str
    
    class Config:
        from_attributes = True 