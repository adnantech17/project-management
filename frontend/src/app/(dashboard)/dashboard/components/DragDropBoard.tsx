import React, { FC, useState, useEffect } from "react";
import { Category, Ticket } from "@/types/models";
import CategoryColumn from "./CategoryColumn";
import { dragDropTicket, getTickets } from "@/service/tickets";

interface DragDropBoardProps {
  categories: Category[];
  tickets: Ticket[];
  onTicketsUpdate: (tickets: Ticket[]) => void;
  onAddTicket: (categoryId: string) => void;
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewTicketDetails: (ticket: Ticket) => void;
  onError: (error: string) => void;
}

const DragDropBoard: FC<DragDropBoardProps> = ({
  categories,
  tickets,
  onTicketsUpdate,
  onAddTicket,
  onViewTicket,
  onEditTicket,
  onViewTicketDetails,
  onError,
}) => {
  const [draggedTicketId, setDraggedTicketId] = useState<string>("");
  const [isDropping, setIsDropping] = useState(false);

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        const ticketId = e.dataTransfer.getData("text/plain");

        if (ticketId) {
          setDraggedTicketId(ticketId);
        }
      }
    };

    const handleDragEnd = () => {
      setTimeout(() => {
        setDraggedTicketId("");
        setIsDropping(false);
      }, 100);
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const handleDropTicket = async (categoryId: string, ticketId: string, dropPosition?: number) => {
    console.log(categoryId, ticketId, dropPosition);
    if (isDropping) return;
    
    setIsDropping(true);
    
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      setIsDropping(false);
      return;
    }

    const categoryTickets = getTicketsForCategory(categoryId);
    const targetPosition = dropPosition !== undefined ? dropPosition : categoryTickets.length;

    if (ticket.category_id === categoryId && ticket.position === targetPosition) {
      setIsDropping(false);
      return;
    }

    try {
      await dragDropTicket(ticketId, categoryId, targetPosition);
      
      const response = await getTickets();
      onTicketsUpdate(response.data);
    } catch (err: any) {
      console.error("Error moving ticket:", err);
      onError("Failed to move ticket. Please try again.");
    } finally {
      setIsDropping(false);
    }
  };

  const getTicketsForCategory = (categoryId: string): Ticket[] => {
    return tickets
      .filter((ticket) => ticket.category_id === categoryId)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {categories.map((category) => (
        <CategoryColumn
          key={category.id}
          category={category}
          tickets={getTicketsForCategory(category.id)}
          onAddTicket={() => onAddTicket(category.id)}
          onViewTicket={onViewTicket}
          onEditTicket={onEditTicket}
          onViewTicketDetails={onViewTicketDetails}
          onDropTicket={(ticketId, position) => handleDropTicket(category.id, ticketId, position)}
          draggedTicketId={draggedTicketId}
        />
      ))}
    </div>
  );
};

export default DragDropBoard; 