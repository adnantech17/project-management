import React, { FC } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
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
}

const CategoryColumn: FC<CategoryColumnProps> = ({
  category,
  tickets,
  onAddTicket,
  onViewTicket,
  onEditTicket,
  onViewTicketDetails,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 min-w-80">
      <div className="flex items-center justify-between mb-4">
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
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onView={onViewTicket}
            onEdit={onEditTicket}
            onViewDetails={onViewTicketDetails}
          />
        ))}

        <Button
          onClick={onAddTicket}
          variant="ghost"
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center space-x-2 bg-transparent hover:bg-gray-100/50"
        >
          <Plus size={16} />
          <span>Add new task</span>
        </Button>
      </div>
    </div>
  );
};

export default CategoryColumn;
