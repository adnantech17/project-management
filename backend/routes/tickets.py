from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from schemas.ticket import TicketCreate, TicketUpdate, TicketOut, DragDropRequest, TicketWithCategoryAndHistory, PaginatedTicketOut
from schemas.ticket_history import TicketHistoryOut
from core.database import get_db
from core.auth import get_current_user
from services.ticket_service import TicketService
from models.user import User
from utils.logger import log_request

router = APIRouter(prefix="/tickets", tags=["tickets"])

@router.post("/", response_model=TicketOut)
def create_ticket(
    request: Request,
    ticket: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, ticket.model_dump())
    
    ticket_service = TicketService(db)
    created_ticket = ticket_service.create_ticket(ticket, current_user.id)
    
    if not created_ticket:
        raise HTTPException(status_code=400, detail="Invalid category or category not found")
    
    return created_ticket

@router.get("/", response_model=PaginatedTicketOut)
def get_tickets(
    request: Request,
    category_id: Optional[uuid.UUID] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {
        "category_id": str(category_id) if category_id else None,
        "page": page,
        "page_size": page_size
    })
    
    ticket_service = TicketService(db)
    result = ticket_service.get_tickets(category_id, page, page_size)
    
    return result

@router.put("/drag-drop", response_model=TicketOut)
def drag_drop_ticket(
    request: Request,
    drag_data: DragDropRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, drag_data.model_dump())
    
    ticket_service = TicketService(db)
    updated_ticket = ticket_service.drag_drop_ticket(
        uuid.UUID(drag_data.ticket_id),
        uuid.UUID(drag_data.target_category_id),
        drag_data.target_position,
        current_user.id
    )
    
    if not updated_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or invalid category")
    
    return updated_ticket

@router.get("/{ticket_id}", response_model=TicketWithCategoryAndHistory)
def get_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    include_history: bool = Query(True, description="Include ticket history"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"ticket_id": str(ticket_id), "include_history": include_history})
    
    ticket_service = TicketService(db)
    
    if include_history:
        ticket = ticket_service.get_ticket_with_history(ticket_id)
    else:
        ticket = ticket_service.get_ticket(ticket_id)
        ticket.history = []
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket

@router.put("/{ticket_id}", response_model=TicketOut)
def update_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    ticket_update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"ticket_id": str(ticket_id), **ticket_update.model_dump()})
    
    ticket_service = TicketService(db)
    updated_ticket = ticket_service.update_ticket(ticket_id, ticket_update, current_user.id)
    
    if not updated_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or invalid category")
    
    return updated_ticket

@router.delete("/{ticket_id}")
def delete_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"ticket_id": str(ticket_id)})
    
    ticket_service = TicketService(db)
    deleted = ticket_service.delete_ticket(ticket_id, current_user.id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return {"message": "Ticket deleted successfully"}

@router.get("/history/all", response_model=List[TicketHistoryOut])
def get_all_activity_logs(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all activity logs across all tickets"""
    log_request(request, {"page": page, "page_size": page_size})
    
    ticket_service = TicketService(db)
    activity_logs = ticket_service.get_all_activity_logs(page, page_size)
    
    return activity_logs
