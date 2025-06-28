import React, { FC, useState, useEffect, useCallback } from "react";
import { Category, Ticket } from "@/types/models";
import CategoryColumn from "./CategoryColumn";
import { dragDropTicket, getTickets, deleteTicket } from "@/service/tickets";
import { reorderCategories } from "@/service/categories";

interface DragDropBoardProps {
  categories: Category[];
  tickets: Ticket[];
  onTicketsUpdate: (tickets: Ticket[]) => void;
  onCategoriesUpdate: (categories: Category[]) => void;
  onAddTicket: (categoryId: string) => void;
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewTicketDetails: (ticket: Ticket) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onDeleteTicket: (ticket: Ticket) => void;
  onError: (error: string) => void;
}

const DragDropBoard: FC<DragDropBoardProps> = ({
  categories,
  tickets,
  onTicketsUpdate,
  onCategoriesUpdate,
  onAddTicket,
  onViewTicket,
  onEditTicket,
  onViewTicketDetails,
  onEditCategory,
  onDeleteCategory,
  onDeleteTicket,
  onError,
}) => {
  const [draggedTicketId, setDraggedTicketId] = useState<string>("");
  const [draggedCategoryId, setDraggedCategoryId] = useState<string>("");
  const [isDropping, setIsDropping] = useState(false);

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (e.dataTransfer) {
        const data = e.dataTransfer.getData("text/plain");
        
        if (data.startsWith("category:")) {
          const categoryId = data.replace("category:", "");
          setDraggedCategoryId(categoryId);
        } else if (data) {
          setDraggedTicketId(data);
        }
      }
    };

    const handleDragEnd = () => {
      setTimeout(() => {
        setDraggedTicketId("");
        setDraggedCategoryId("");
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
      onTicketsUpdate(response.data.items);
    } catch (err: any) {
      console.error("Error moving ticket:", err);
      onError("Failed to move ticket. Please try again.");
    } finally {
      setIsDropping(false);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      onDeleteTicket(ticket);
    }
  };

  const handleCategoryDrop = async (e: React.DragEvent, targetCategoryIndex: number) => {
    e.preventDefault();
    
    if (!draggedCategoryId || isDropping) return;
    
    setIsDropping(true);
    
    try {
      const newCategories = [...categories];
      const draggedIndex = newCategories.findIndex(cat => cat.id === draggedCategoryId);
      
      if (draggedIndex === -1 || draggedIndex === targetCategoryIndex) {
        setIsDropping(false);
        return;
      }
      
      const [draggedCategory] = newCategories.splice(draggedIndex, 1);
      newCategories.splice(targetCategoryIndex, 0, draggedCategory);
      
      const categoryPositions = newCategories.map((category, index) => ({
        id: category.id,
        position: index
      }));
      
      await reorderCategories(categoryPositions);
      
      const updatedCategories = newCategories.map((category, index) => ({
        ...category,
        position: index
      }));
      
      onCategoriesUpdate(updatedCategories);
    } catch (err: any) {
      console.error("Error reordering categories:", err);
      onError("Failed to reorder categories. Please try again.");
    } finally {
      setIsDropping(false);
    }
  };

  const getTicketsForCategory = (categoryId: string): Ticket[] => {
    return tickets
      .filter((ticket) => ticket.category_id === categoryId)
      .sort((a, b) => a.position - b.position);
  };

  const handleBoardDrop = useCallback((e: React.DragEvent) => {
    if (!draggedCategoryId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const categoryWidth = 320 + 24;
    const targetIndex = Math.floor(x / categoryWidth);
    handleCategoryDrop(e, Math.min(targetIndex, categories.length - 1));
  }, [draggedCategoryId, handleCategoryDrop]);

  const handleBoardDragOver = useCallback((e: React.DragEvent) => {
    if (draggedCategoryId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }, [draggedCategoryId]);

  return (
    <div 
      className="flex space-x-6 max-h-[82vh] lg:max-h-[78vh] overflow-x-auto px-6"
      onDragOver={handleBoardDragOver}
      onDrop={handleBoardDrop}
    >
      {categories.map((category, index) => (
        <CategoryColumn
          key={category.id}
          category={category}
          tickets={getTicketsForCategory(category.id)}
          onAddTicket={() => onAddTicket(category.id)}
          onViewTicket={onViewTicket}
          onEditTicket={onEditTicket}
          onViewTicketDetails={onViewTicketDetails}
          onDropTicket={(ticketId, position) => handleDropTicket(category.id, ticketId, position)}
          onDeleteTicket={handleDeleteTicket}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          draggedTicketId={draggedTicketId}
          draggedCategoryId={draggedCategoryId}
          isDragging={draggedCategoryId === category.id}
        />
      ))}
    </div>
  );
};

export default DragDropBoard; 