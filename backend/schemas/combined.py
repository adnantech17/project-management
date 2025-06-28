from pydantic import BaseModel
from typing import List

from .category import CategoryOut
from .ticket import TicketOut
from .ticket_history import TicketHistoryOut

class CategoryWithTickets(CategoryOut):
    tickets: List[TicketOut] = []

class TicketWithCategory(TicketOut):
    category: CategoryOut

class TicketWithCategoryAndHistory(TicketWithCategory):
    history: List[TicketHistoryOut] = []

class PaginatedTicketOut(BaseModel):
    items: List[TicketWithCategory]
    total: int
    page: int
    page_size: int
    total_pages: int 