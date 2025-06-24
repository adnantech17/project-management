from sqlalchemy.orm import Session
from sqlalchemy import and_, update
from typing import List, Optional, Dict, Any
import uuid
import json

from models.ticket import Ticket
from models.category import Category
from models.ticket_history import TicketHistory
from models.user import User
from schemas.ticket import TicketCreate, TicketUpdate

class TicketService:
    def __init__(self, db: Session):
        self.db = db

    def _create_history_record(self, ticket_id: uuid.UUID, user_id: uuid.UUID, action_type: str, 
                              old_values: Optional[Dict[str, Any]] = None, 
                              new_values: Optional[Dict[str, Any]] = None,
                              from_category_name: Optional[str] = None,
                              to_category_name: Optional[str] = None):
        """Create a history record for ticket changes"""
        history_record = TicketHistory(
            ticket_id=ticket_id,
            user_id=user_id,
            action_type=action_type,
            old_values=old_values,
            new_values=new_values,
            from_category_name=from_category_name,
            to_category_name=to_category_name
        )
        self.db.add(history_record)

    def _get_ticket_values(self, ticket: Ticket) -> Dict[str, Any]:
        """Extract ticket values for history tracking"""
        return {
            "title": ticket.title,
            "description": ticket.description,
            "expiry_date": ticket.expiry_date.isoformat() if ticket.expiry_date else None,
            "position": ticket.position,
            "category_id": str(ticket.category_id),
            "assigned_users": [str(user.id) for user in ticket.assigned_users]
        }

    def _assign_users_to_ticket(self, ticket: Ticket, user_ids: List[uuid.UUID]):
        """Assign multiple users to a ticket"""
        ticket.assigned_users.clear()
        
        if user_ids:
            users = self.db.query(User).filter(User.id.in_(user_ids)).all()
            ticket.assigned_users.extend(users)

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
        self.db.flush() 
        
        self._assign_users_to_ticket(db_ticket, ticket_data.assigned_user_ids)
        
        self.db.commit()
        self.db.refresh(db_ticket)
        
        self._create_history_record(
            ticket_id=db_ticket.id,
            user_id=user_id,
            action_type="created",
            new_values=self._get_ticket_values(db_ticket),
            to_category_name=category.name
        )
        self.db.commit()
        
        return db_ticket

    def get_tickets(self, user_id: uuid.UUID, category_id: Optional[uuid.UUID] = None, page: int = 0, page_size: int = 0) -> dict:
        query = self.db.query(Ticket).filter(Ticket.user_id == user_id)
        
        if category_id:
            query = query.filter(Ticket.category_id == category_id)
            
        query = query.order_by(Ticket.position)
        
        if page_size == 0:
            tickets = query.all()
            return {
                "items": tickets,
                "total": len(tickets),
                "page": 1,
                "page_size": len(tickets) if tickets else 0,
                "total_pages": 1
            }
        
        total = query.count()

        total_pages = (total + page_size - 1) // page_size if total > 0 else 1
        offset = (page - 1) * page_size
        
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

    def get_ticket_with_history(self, ticket_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Ticket]:
        """Get a ticket with its complete history"""
        ticket = self.get_ticket(ticket_id, user_id)

        if ticket:
            history = self.get_ticket_history(ticket_id, user_id)

            ticket.history = history
            
        return ticket

    def update_ticket(self, ticket_id: uuid.UUID, ticket_data: TicketUpdate, user_id: uuid.UUID) -> Optional[Ticket]:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return None

        old_values = self._get_ticket_values(db_ticket)
        old_category = db_ticket.category

        if ticket_data.category_id:
            category = self.db.query(Category).filter(
                and_(Category.id == ticket_data.category_id, Category.user_id == user_id)
            ).first()
            if not category:
                return None

        update_data = ticket_data.model_dump(exclude_unset=True, exclude={'assigned_user_ids'})
        for field, value in update_data.items():
            setattr(db_ticket, field, value)

        if ticket_data.assigned_user_ids is not None:
            self._assign_users_to_ticket(db_ticket, ticket_data.assigned_user_ids)

        self.db.commit()
        self.db.refresh(db_ticket)
        
        new_values = self._get_ticket_values(db_ticket)
        new_category = db_ticket.category
        
        from_category_name = old_category.name if old_category else None
        to_category_name = new_category.name if new_category else None
        action_type = "moved" if old_category and new_category and old_category.id != new_category.id else "updated"
        
        self._create_history_record(
            ticket_id=db_ticket.id,
            user_id=user_id,
            action_type=action_type,
            old_values=old_values,
            new_values=new_values,
            from_category_name=from_category_name if action_type == "moved" else None,
            to_category_name=to_category_name if action_type == "moved" else None
        )
        self.db.commit()
        
        return db_ticket

    def delete_ticket(self, ticket_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return False

        old_values = self._get_ticket_values(db_ticket)
        from_category_name = db_ticket.category.name if db_ticket.category else None
        
        self._create_history_record(
            ticket_id=db_ticket.id,
            user_id=user_id,
            action_type="deleted",
            old_values=old_values,
            from_category_name=from_category_name
        )
        
        self.db.delete(db_ticket)
        self.db.commit()
        return True

    def drag_drop_ticket(self, ticket_id: uuid.UUID, target_category_id: uuid.UUID, target_position: int, user_id: uuid.UUID) -> Optional[Ticket]:
        db_ticket = self.get_ticket(ticket_id, user_id)
        if not db_ticket:
            return None

        target_category = self.db.query(Category).filter(
            and_(Category.id == target_category_id, Category.user_id == user_id)
        ).first()
        if not target_category:
            return None

        old_values = self._get_ticket_values(db_ticket)
        old_category = db_ticket.category
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
        
        new_values = self._get_ticket_values(db_ticket)
        if old_category_id != target_category_id:
            self._create_history_record(
                ticket_id=db_ticket.id,
                user_id=user_id,
                action_type="moved",
                old_values=old_values,
                new_values=new_values,
                from_category_name=old_category.name if old_category else None,
                to_category_name=target_category.name
            )
        elif old_position != target_position:
            self._create_history_record(
                ticket_id=db_ticket.id,
                user_id=user_id,
                action_type="updated",
                old_values=old_values,
                new_values=new_values
            )
        
        self.db.commit()
        return db_ticket

    def get_ticket_history(self, ticket_id: uuid.UUID, user_id: uuid.UUID) -> List[TicketHistory]:
        """Get history records for a specific ticket"""
        ticket = self.get_ticket(ticket_id, user_id)
        if not ticket:
            return []
        
        return self.db.query(TicketHistory).filter(
            TicketHistory.ticket_id == ticket_id
        ).order_by(TicketHistory.created_at.desc()).all()

    def get_all_user_activity_logs(self, user_id: uuid.UUID, page: int = 1, page_size: int = 50) -> List[TicketHistory]:
        """Get all activity logs for a user across all their tickets"""
        from sqlalchemy.orm import joinedload
        
        user_ticket_ids = self.db.query(Ticket.id).filter(Ticket.user_id == user_id).subquery()
        
        offset = (page - 1) * page_size
        
        history_records = self.db.query(TicketHistory).filter(
            TicketHistory.ticket_id.in_(
                self.db.query(user_ticket_ids.c.id)
            )
        ).order_by(TicketHistory.created_at.desc()).offset(offset).limit(page_size).all()
        
        for record in history_records:
            ticket = self.db.query(Ticket).filter(Ticket.id == record.ticket_id).first()
            if ticket:
                record.ticket_title = ticket.title
        
        return history_records
