from sqlalchemy.orm import Session
from sqlalchemy import and_, update
from typing import List, Optional
import uuid

from models.category import Category
from models.ticket import Ticket
from schemas.category import CategoryCreate, CategoryUpdate, CategoryReorder

class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_category(self, category_data: CategoryCreate, user_id: uuid.UUID) -> Category:
        max_position = self.db.query(Category).filter(Category.is_deleted == False).count()
        
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
             Category.is_deleted == False
        ).order_by(Category.position).all()

    def get_category(self, category_id: uuid.UUID) -> Optional[Category]:
        return self.db.query(Category).filter(
            and_(Category.id == category_id, Category.is_deleted == False)
        ).first()

    def update_category(self, category_id: uuid.UUID, category_data: CategoryUpdate) -> Optional[Category]:
        db_category = self.get_category(category_id)
        if not db_category:
            return None

        update_data = category_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_category, field, value)

        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def delete_category(self, category_id: uuid.UUID) -> dict:
        db_category = self.get_category(category_id)
        if not db_category:
            return {"success": False, "error": "Category not found"}

        # Check if category has any tickets
        ticket_count = self.db.query(Ticket).filter(Ticket.category_id == category_id).count()
        if ticket_count > 0:
            return {"success": False, "error": f"Cannot delete category. It contains {ticket_count} ticket(s). Please move or delete the tickets first."}

        # Soft delete
        db_category.is_deleted = True
        self.db.commit()
        return {"success": True}

    def reorder_categories(self, category_positions: List[CategoryReorder]) -> bool:
        """Update positions of multiple categories"""
        try:
            if not category_positions:
                return True
                
            mappings = [{"id": item.id, "position": item.position} for item in category_positions]
            
            self.db.bulk_update_mappings(Category, mappings)
            self.db.commit()

            return True
        except Exception:
            self.db.rollback()
            return False
