import React, { FC } from "react";
import { Ticket } from "@/types/models";
import { Calendar, MessageCircle, MoreHorizontal } from "lucide-react";

const TicketCard: FC<{ ticket: Ticket }> = ({ ticket }) => {

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

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 text-sm leading-5 flex-1 mr-2">
          {ticket.title}
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={16} />
        </button>
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
