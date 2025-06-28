import React, { FC, Fragment, useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import TicketCard from "@/app/(dashboard)/dashboard/components/TicketCard";
import Button from "@/components/Button";
import { Category, Ticket } from "@/types/models";

interface CategoryColumnProps {
  category: Category;
  tickets: Ticket[];
  onAddTicket: () => void;
  onViewTicket: (ticket: Ticket) => void;
  onEditTicket: (ticket: Ticket) => void;
  onViewTicketDetails: (ticket: Ticket) => void;
  onDropTicket: (ticketId: string, position?: number) => void;
  onDeleteTicket: (ticketId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  draggedTicketId?: string;
  draggedCategoryId?: string;
  isDragging?: boolean;
}

const CategoryColumn: FC<CategoryColumnProps> = ({
  category,
  tickets,
  onAddTicket,
  onViewTicket,
  onEditTicket,
  onViewTicketDetails,
  onDropTicket,
  onDeleteTicket,
  onEditCategory,
  onDeleteCategory,
  draggedTicketId,
  draggedCategoryId,
  isDragging = false,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number>(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTicketDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY;
    const ticketMiddle = rect.top + rect.height / 2;

    console.log(y, ticketMiddle, y < ticketMiddle, index)
    
    if (y < ticketMiddle) {
      setDragOverIndex(index);
    } else {
      setDragOverIndex(index + 1);
    }
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex === -1) {
      setDragOverIndex(tickets.length);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(-1);
    }
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("text/plain");
    
    if (ticketId && dragOverIndex !== -1) {
        const draggedTicketIndex = tickets.findIndex(t => t.id === ticketId);
        const isFromSameColumn = draggedTicketIndex !== -1;
        
        let adjustedDragOverIndex = dragOverIndex;
        
        if (isFromSameColumn && draggedTicketIndex < dragOverIndex) {
            adjustedDragOverIndex = dragOverIndex - 1;
        }
        
        if (!tickets.length) {
            onDropTicket(ticketId, 0);
        } else if (tickets.length === adjustedDragOverIndex) {
            onDropTicket(ticketId, tickets[adjustedDragOverIndex - 1].position + 1);
        } else {
            onDropTicket(ticketId, tickets[adjustedDragOverIndex].position);
        }
    }
    
    setDragOverIndex(-1);
};

  const getTicketStyle = (ticket: Ticket, index: number): React.CSSProperties => {
    if (draggedTicketId === ticket.id) return {};
    
    if (dragOverIndex !== -1) {
      const draggedIndex = tickets.findIndex(t => t.id === draggedTicketId);
      const isFromSameColumn = draggedIndex !== -1;
      
      if (isFromSameColumn) {
        if (draggedIndex < dragOverIndex && index >= draggedIndex + 1 && index < dragOverIndex) {
          return { transform: 'translateY(-76px)', transition: 'transform 250ms ease-out' };
        }
        if (draggedIndex > dragOverIndex && index >= dragOverIndex && index < draggedIndex) {
          return { transform: 'translateY(76px)', transition: 'transform 250ms ease-out' };
        }
      } else {
        if (index >= dragOverIndex) {
          return { transform: 'translateY(76px)', transition: 'transform 250ms ease-out' };
        }
      }
    }
    
    return { transition: 'transform 250ms ease-out' };
  };

  const showDropIndicator = (index: number) => dragOverIndex === index;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", `category:${category.id}`);
    e.dataTransfer.effectAllowed = "move";
    setShowDropdown(false);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    action();
  };

  return (
    <div
      className={`
        bg-gray-50 rounded-lg p-4 min-w-80 min-h-[80vh]
        transition-all duration-200 ease-out
        ${dragOverIndex !== -1 ? "bg-blue-50/50 ring-2 ring-blue-300/50" : ""}
        ${
          isDragging
            ? "opacity-50 scale-95 rotate-1 shadow-xl ring-2 ring-blue-400/50"
            : ""
        }
      `}
      onDragOver={handleColumnDragOver}
      onDragLeave={handleColumnDragLeave}
      onDrop={handleColumnDrop}
    >
      <div 
        className="flex items-center justify-between mb-4 cursor-move"
        draggable
        onDragStart={handleCategoryDragStart}
      >
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h2 className="font-medium text-gray-900">{category.name}</h2>
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
            {tickets.length}
          </span>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button 
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors cursor-pointer"
            onClick={handleDropdownClick}
          >
            <MoreHorizontal size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-36 overflow-hidden">
              <button
                onClick={handleMenuAction(() => onEditCategory(category))}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleMenuAction(() => onDeleteCategory(category))}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 relative">
        {showDropIndicator(0) && (
          <div className="h-1 bg-blue-400 rounded-full mx-2 animate-pulse" />
        )}
        
        {tickets.map((ticket, index) => (
          <Fragment key={ticket.id}>
            <div
              style={getTicketStyle(ticket, index)}
              onDragOver={(e) => handleTicketDragOver(e, index)}
            >
              <TicketCard
                ticket={ticket}
                onView={onViewTicket}
                onEdit={onEditTicket}
                onViewDetails={onViewTicketDetails}
                onDelete={onDeleteTicket}
                isDragging={draggedTicketId === ticket.id}
              />
            </div>
            {showDropIndicator(index + 1) && (
              <div className="h-1 bg-blue-400 rounded-full mx-2 animate-pulse" />
            )}
          </Fragment>
        ))}

        <div className="pt-2">
          <Button
            onClick={onAddTicket}
            variant="ghost"
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-all duration-200 flex items-center justify-center space-x-2 bg-transparent hover:bg-gray-100/50"
          >
            <Plus size={16} />
            <span>Add new task</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CategoryColumn;
