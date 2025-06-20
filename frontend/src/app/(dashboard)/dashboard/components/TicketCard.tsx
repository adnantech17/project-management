import React, { FC, useState, useRef, useEffect } from "react";
import { Ticket } from "@/types/models";
import { Calendar, Edit, Eye, MoreHorizontal } from "lucide-react";

interface TicketCardProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onViewDetails: (ticket: Ticket) => void;
}

const TicketCard: FC<TicketCardProps> = ({
  ticket,
  onView,
  onEdit,
  onViewDetails,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isExpiringSoon =
    ticket.expiry_date &&
    new Date(ticket.expiry_date) <
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const isOverdue =
    ticket.expiry_date && new Date(ticket.expiry_date) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    if (!showDropdown) {
      onView(ticket);
    }
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onEdit(ticket);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(false);
    onViewDetails(ticket);
  };

  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {ticket.title}
        </h3>
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={handleDropdownClick}
          >
            <MoreHorizontal size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-36">
              <button
                onClick={handleEdit}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleViewDetails}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye size={14} />
                <span>View Details</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {ticket.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {ticket.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        {ticket.expiry_date && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              isOverdue
                ? "text-red-600"
                : isExpiringSoon
                ? "text-orange-600"
                : "text-gray-500"
            }`}
          >
            <Calendar size={12} />
            <span>{formatDate(ticket.expiry_date)}</span>
          </div>
        )}

        <div className="flex items-center space-x-2 ml-auto">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {ticket.title.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
