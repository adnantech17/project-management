import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .user import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    expiry_date = Column(DateTime(timezone=True))
    position = Column(Integer, nullable=False, default=0)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="tickets")
    category = relationship("Category", back_populates="tickets")
    history = relationship("TicketHistory", back_populates="ticket", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Ticket(id={self.id}, title='{self.title}', category_id={self.category_id}, user_id={self.user_id})>" 
    