from sqlalchemy.orm import Session
from sqlalchemy import and_, update
from typing import List, Optional
import uuid

from models.ticket import Ticket
from models.category import Category
from schemas.ticket import TicketCreate, TicketUpdate

class TicketService:
    def __init__(self, db: Session):
        self.db = db

    def create_ticket(self, ticket_data: TicketCreate, user_id: uuid.UUID) -> Optional[Ticket]:
        category = self.db.query(Category).filter(
            and_(Category.id == ticket_data.category_id, Category.user_id == user_id)
        ).first()
        
        if not category:
            return None

        max_position = self.db.query(Ticket).filter(
            Ticket.category_id == ticket_data.category_id
        ).count()
        
        db_ticket = Ticket(
            title=ticket_data.title,
            description=ticket_data.description,
            expiry_date=ticket_data.expiry_date,
            position=max_position,
            category_id=ticket_data.category_id,
            user_id=user_id
        )
        self.db.add(db_ticket)
        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket

    def get_tickets(self, user_id: uuid.UUID, category_id: Optional[uuid.UUID] = None, page: int = 0, page_size: int = 0) -> dict:
        query = self.db.query(Ticket).filter(Ticket.user_id == user_id)
        
        if category_id:
            query = query.filter(Ticket.category_id == category_id)
            
        query = query.order_by(Ticket.position)
        
        # If page_size is 0, return all tickets (backward compatibility)
        if page_size == 0:
            tickets = query.all()
            return {
                "items": tickets,
                "total": len(tickets),
                "page": 1,
                "page_size": len(tickets) if tickets else 0,
                "total_pages": 1
            }
        
        # Get total count
        total = query.count()
        
        # Calculate pagination
        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        offset = (page - 1) * page_size
        
        # Get paginated results
        tickets = query.offset(offset).limit(page_size).all()
        
        return {
            "items": tickets,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    def get_ticket(self, ticket_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Ticket]:
        return self.db.query(Ticket).filter(
            and_(Ticket.id == ticket_id, Ticket.user_id == user_id)
        ).first()

    def update_ticket(self, ticket_id: uuid.UUID, ticket_data: TicketUpdate, user_id: uuid.UUID) -> Optional[Ticket]:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return None

        if ticket_data.category_id:
            category = self.db.query(Category).filter(
                and_(Category.id == ticket_data.category_id, Category.user_id == user_id)
            ).first()
            if not category:
                return None

        update_data = ticket_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_ticket, field, value)

        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket

    def delete_ticket(self, ticket_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return False

        self.db.delete(db_ticket)
        self.db.commit()
        return True

    def reorder_tickets(self, user_id: uuid.UUID, ticket_positions: List[dict]) -> List[Ticket]:
        """Update positions of multiple tickets"""
        for item in ticket_positions:
            ticket_id = item["id"]
            new_position = item["position"]
            new_category_id = item.get("category_id")
            
            db_ticket = self.get_ticket(ticket_id, user_id)
            if db_ticket:
                db_ticket.position = new_position
                if new_category_id:
                    category = self.db.query(Category).filter(
                        and_(Category.id == new_category_id, Category.user_id == user_id)
                    ).first()
                    if category:
                        db_ticket.category_id = new_category_id

        self.db.commit()
        return self.get_tickets(user_id)["items"]

    def drag_drop_ticket(self, ticket_id: uuid.UUID, target_category_id: uuid.UUID, target_position: int, user_id: uuid.UUID) -> Optional[Ticket]:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return None

        target_category = self.db.query(Category).filter(
            and_(Category.id == target_category_id, Category.user_id == user_id)
        ).first()
        if not target_category:
            return None

        old_category_id = db_ticket.category_id
        old_position = db_ticket.position

        if old_category_id == target_category_id:
            if old_position == target_position:
                return db_ticket
            
            if old_position < target_position:
                self.db.execute(
                    update(Ticket)
                    .where(
                        and_(
                            Ticket.category_id == target_category_id,
                            Ticket.position > old_position,
                            Ticket.position <= target_position,
                            Ticket.user_id == user_id
                        )
                    )
                    .values(position=Ticket.position - 1)
                )
            else:
                self.db.execute(
                    update(Ticket)
                    .where(
                        and_(
                            Ticket.category_id == target_category_id,
                            Ticket.position >= target_position,
                            Ticket.position < old_position,
                            Ticket.user_id == user_id
                        )
                    )
                    .values(position=Ticket.position + 1)
                )
        else:
            self.db.execute(
                update(Ticket)
                .where(
                    and_(
                        Ticket.category_id == old_category_id,
                        Ticket.position > old_position,
                        Ticket.user_id == user_id
                    )
                )
                .values(position=Ticket.position - 1)
            )
            
            self.db.execute(
                update(Ticket)
                .where(
                    and_(
                        Ticket.category_id == target_category_id,
                        Ticket.position >= target_position,
                        Ticket.user_id == user_id
                    )
                )
                .values(position=Ticket.position + 1)
            )

        db_ticket.category_id = target_category_id
        db_ticket.position = target_position
        
        self.db.commit()
        self.db.refresh(db_ticket)
        return db_ticket
