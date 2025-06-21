import React, { FC, useState, useEffect } from "react";
import { Category, Ticket } from "@/types/models";
import CategoryColumn from "./CategoryColumn";
import { updateTicket } from "@/service/tickets";

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

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      const ticketId = (e.dataTransfer as DataTransfer).getData("text/plain");
      setDraggedTicketId(ticketId);
    };

    const handleDragEnd = () => {
      setDraggedTicketId("");
    };

    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("dragend", handleDragEnd);

    return () => {
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  const handleDropTicket = async (ticketId: string, newCategoryId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket || ticket.category_id === newCategoryId) return;

    const updatedTicketData = {
      title: ticket.title,
      description: ticket.description,
      expiry_date: ticket.expiry_date,
      category_id: newCategoryId,
    };

    try {
      const response = await updateTicket(ticketId, updatedTicketData);      
      const updatedTickets = tickets.map((t) =>
        t.id === ticketId ? response.data : t
      );

      onTicketsUpdate(updatedTickets);
    } catch (err: any) {
      console.error("Error moving ticket:", err);
      onError("Failed to move ticket. Please try again.");
    }
  };

  const getTicketsForCategory = (categoryId: string): Ticket[] => {
    return tickets.filter((ticket) => ticket.category_id === categoryId);
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
          onDropTicket={handleDropTicket}
          draggedTicketId={draggedTicketId}
        />
      ))}
    </div>
  );
};

export default DragDropBoard; 