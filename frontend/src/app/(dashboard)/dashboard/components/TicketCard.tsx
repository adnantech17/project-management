import React, { FC, useState, useRef, useEffect, memo } from "react";
import { Ticket } from "@/types/models";
import { Calendar, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import ProfileAvatar from "@/components/ProfileAvatar";
import removeMarkdown from 'remove-markdown';
import { formatDate, isTicketOverdue, isTicketExpiringSoon } from "@/utils/date";

interface TicketCardProps {
  ticket: Ticket;
  onView: (ticket: Ticket) => void;
  onEdit: (ticket: Ticket) => void;
  onViewDetails: (ticket: Ticket) => void;
  onDelete: (ticketId: string) => void;
  isDragging?: boolean;
}

const TicketCard: FC<TicketCardProps> = ({
  ticket,
  onView,
  onEdit,
  onViewDetails,
  onDelete,
  isDragging = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isExpiringSoon = isTicketExpiringSoon(ticket.expiry_date);
  const isOverdue = isTicketOverdue(ticket.expiry_date);

  const getTruncatedDescription = (content: string | null | undefined) => {
    if (!content) return null;
    
    const plainText = removeMarkdown(content).trim();
    
    if (plainText.length <= 100) {
      return plainText;
    }
    
    return plainText.substring(0, 100).trim() + '...';
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", ticket.id);
    e.dataTransfer.effectAllowed = "move";
    setShowDropdown(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!showDropdown) onView(ticket);
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

  const truncatedDescription = getTruncatedDescription(ticket.description);

  return (
    <div
      className={`
        bg-white rounded-lg p-4 border border-gray-200 cursor-pointer 
        transition-all duration-200 ease-out
        ${
          isDragging
            ? "opacity-50 scale-95 rotate-1 shadow-xl ring-2 ring-blue-400/50"
            : "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
        }
      `}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {ticket.title}
        </h3>
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors rounded"
            onClick={handleDropdownClick}
          >
            <MoreHorizontal size={16} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-36 overflow-hidden">
              <button
                onClick={handleMenuAction(() => onEdit(ticket))}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit size={14} />
                <span>Edit</span>
              </button>
              <button
                onClick={handleMenuAction(() => onViewDetails(ticket))}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye size={14} />
                <span>View Details</span>
              </button>
              <button
                onClick={handleMenuAction(() => onDelete(ticket.id))}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {truncatedDescription && (
        <div className="text-sm text-gray-600 mb-3 leading-relaxed">
          {truncatedDescription}
        </div>
      )}

      <div className="flex items-center justify-between">
        {ticket.expiry_date && (
          <div
            className={`flex items-center space-x-1 text-xs ${
              isOverdue
                ? "text-red-600"
                : isExpiringSoon
                ? "text-yellow-600"
                : "text-gray-500"
            }`}
          >
            <Calendar size={12} />
            <span>{formatDate(ticket.expiry_date)}</span>
          </div>
        )}

        <div className="flex items-center gap-1 flex-wrap">
          {ticket.assigned_users.slice(0, 4).map((user) => {
            return (
              <ProfileAvatar
                key={user.id}
                username={user.username}
                profile_picture={user.profile_picture}
                size="sm"
                className="border border-white"
              />
            );
          })}
          {ticket.assigned_users.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium">
              +{ticket.assigned_users.length - 4}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(TicketCard);
