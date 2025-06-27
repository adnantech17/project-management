import React, { FC, FormEvent } from "react";
import { TicketHistory as TicketHistoryType } from "@/types/models";
import { History } from "lucide-react";
import Button from "@/components/Button";
import ActivityItem from "@/components/activity/ActivityItem";

interface TicketHistoryProps {
  history: TicketHistoryType[];
  showFullHistory?: boolean;
  onViewFullHistory?: (e: FormEvent) => void;
  maxItems?: number;
  className?: string;
}

const TicketHistory: FC<TicketHistoryProps> = ({
  history,
  showFullHistory = false,
  onViewFullHistory,
  maxItems = 5,
  className = "",
}) => {
  if (!history || history.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <History className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Activity History</h3>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500 text-sm">
            No activity history available yet.
          </p>
        </div>
      </div>
    );
  }

  const displayedHistory = showFullHistory ? history : history.slice(0, maxItems);
  const hasMoreItems = !showFullHistory && history.length > maxItems;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <History className="h-4 w-4 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">Activity History</h3>
      </div>
      
      <div className={`space-y-4 ${showFullHistory ? 'bg-white rounded-lg border border-gray-200 overflow-hidden' : ''}`}>
        <div className={`space-y-3 ${showFullHistory ? 'p-4 max-h-96 overflow-y-auto' : 'h-full overflow-y-auto'}`}>
          {displayedHistory.map((item, index) => (
            <ActivityItem
              key={item.id}
              activity={item}
              variant={showFullHistory ? "detailed" : "compact"}
              showTimeline={index < displayedHistory.length - 1}
            />
          ))}
        </div>
        
        {hasMoreItems && onViewFullHistory && (
          <div className="text-center pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onViewFullHistory}
              className="text-xs"
            >
              View full history ({history.length} items)
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketHistory;
