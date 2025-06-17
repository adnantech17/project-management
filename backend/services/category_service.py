from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
import uuid

from models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate

class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_category(self, category_data: CategoryCreate, user_id: uuid.UUID) -> Category:
        max_position = self.db.query(Category).filter(
            Category.user_id == user_id
        ).count()
        
        db_category = Category(
            name=category_data.name,
            color=category_data.color,
            position=max_position,
            user_id=user_id
        )
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def get_categories(self, user_id: uuid.UUID) -> List[Category]:
        return self.db.query(Category).filter(
            Category.user_id == user_id
        ).order_by(Category.position).all()

    def get_category(self, category_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Category]:
        return self.db.query(Category).filter(
            and_(Category.id == category_id, Category.user_id == user_id)
        ).first()

    def update_category(self, category_id: uuid.UUID, category_data: CategoryUpdate, user_id: uuid.UUID) -> Optional[Category]:
        db_category = self.get_category(category_id, user_id)
        if not db_category:
            return None

        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)

        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def delete_category(self, category_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        db_category = self.get_category(category_id, user_id)
        if not db_category:
            return False

        self.db.delete(db_category)
        self.db.commit()
        return True

    def reorder_categories(self, user_id: uuid.UUID, category_positions: List[dict]) -> List[Category]:
        """Update positions of multiple categories"""
        for item in category_positions:
            category_id = item["id"]
            new_position = item["position"]
            
            db_category = self.get_category(category_id, user_id)
            if db_category:
                db_category.position = new_position

        self.db.commit()
        return self.get_categories(user_id)
