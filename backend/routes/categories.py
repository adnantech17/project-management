from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from schemas.category import CategoryCreate, CategoryUpdate, CategoryOut, CategoryWithTickets
from database import SessionLocal
from services.category_service import CategoryService
from utils.jwt import decode_access_token
from models.user import User
from utils.logger import log_request

router = APIRouter(prefix="/categories", tags=["categories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = decode_access_token(token)
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

@router.post("/", response_model=CategoryOut)
def create_category(
    request: Request, 
    category: CategoryCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, category.model_dump())
    
    category_service = CategoryService(db)
    created_category = category_service.create_category(category, current_user.id)
    
    return created_category

@router.get("/", response_model=List[CategoryOut])
def get_categories(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {})
    
    category_service = CategoryService(db)
    categories = category_service.get_categories()
    
    return categories

@router.get("/{category_id}", response_model=CategoryWithTickets)
def get_category(
    request: Request,
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"category_id": str(category_id)})
    
    category_service = CategoryService(db)
    category = category_service.get_category(category_id)
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return category

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    request: Request,
    category_id: uuid.UUID,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"category_id": str(category_id), **category_update.model_dump()})
    
    category_service = CategoryService(db)
    updated_category = category_service.update_category(category_id, category_update)
    
    if not updated_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return updated_category

@router.delete("/{category_id}")
def delete_category(
    request: Request,
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"category_id": str(category_id)})
    
    category_service = CategoryService(db)
    deleted = category_service.delete_category(category_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}
