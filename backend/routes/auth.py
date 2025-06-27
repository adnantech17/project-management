from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from typing import List
from schemas import UserCreate, UserOut, UserLogin
from schemas import Token
from schemas.user import UserAssigned, UserUpdate
from core.database import get_db
from core.auth import get_current_user, set_auth_cookies, clear_auth_cookies
from services.auth_service import create_user, authenticate_user
from services.user_service import UserService
from models.user import User
from utils.logger import log_request

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    log_request(request, user.dict())

    created = create_user(db, user.email, user.username, user.password)

    if not created:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    return created

@router.post("/login", response_model=Token)
def login(request: Request, response: Response, user: UserLogin, db: Session = Depends(get_db)):
    log_request(request, user.dict())

    user_obj = authenticate_user(db, user.username, user.password)

    if not user_obj:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    set_auth_cookies(response, user_obj.username)

    return {"access_token": "set_in_cookie", "token_type": "bearer"}

@router.post("/logout")
def logout(request: Request, response: Response):
    log_request(request, {})

    clear_auth_cookies(response)

    return {"message": "Logged out"}

@router.get("/me", response_model=UserOut)
def get_me(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log_request(request, {})
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    request: Request,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile"""
    log_request(request, user_update.model_dump(exclude_unset=True))
    
    user_service = UserService(db)
    updated_user = user_service.update_user(current_user.id, user_update)
    
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

@router.get("/users", response_model=List[UserAssigned])
def get_all_users(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users for assignment purposes"""
    log_request(request, {})
    
    users = db.query(User).filter(User.is_active == True).all()
    return users 