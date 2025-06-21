from fastapi import APIRouter, Depends, HTTPException, Request, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from schemas.ticket import TicketCreate, TicketUpdate, TicketOut, TicketWithCategory
from database import SessionLocal
from services.ticket_service import TicketService
from utils.jwt import decode_access_token
from models.user import User
from utils.logger import log_request

router = APIRouter(prefix="/tickets", tags=["tickets"])

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

@router.get("/", response_model=List[TicketOut])
def get_tickets(
    request: Request,
    category_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"category_id": str(category_id) if category_id else None})
    
    ticket_service = TicketService(db)
    tickets = ticket_service.get_tickets(current_user.id, category_id)
    
    return tickets

@router.get("/{ticket_id}", response_model=TicketWithCategory)
def get_ticket(
    request: Request,
    ticket_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"ticket_id": str(ticket_id)})
    
    ticket_service = TicketService(db)
    ticket = ticket_service.get_ticket(ticket_id, current_user.id)
    
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

@router.put("/reorder", response_model=List[TicketOut])
def reorder_tickets(
    request: Request,
    ticket_positions: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_request(request, {"positions": ticket_positions})
    
    ticket_service = TicketService(db)
    updated_tickets = ticket_service.reorder_tickets(current_user.id, ticket_positions)
    
    return updated_tickets
 