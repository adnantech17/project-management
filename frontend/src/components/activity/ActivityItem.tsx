import React, { FC, memo } from "react";
import { TicketHistory } from "@/types/models";
import { formatDateTime } from "@/utils/date";
import { formatActionDescription, getChangedFields, getActionColor } from "@/utils/activity";
import ActivityIcon from "./ActivityIcon";

interface ActivityItemProps {
  activity: TicketHistory;
  variant?: "compact" | "detailed";
  showTimeline?: boolean;
  onClick?: (activity: TicketHistory) => void;
  className?: string;
}

const ActivityItem: FC<ActivityItemProps> = ({
  activity,
  variant = "compact",
  showTimeline = false,
  onClick,
  className = ""
}) => {
  const isDetailed = variant === "detailed";
  const changes = activity.action_type === "updated" && activity.old_values && activity.new_values
    ? getChangedFields(activity.old_values, activity.new_values)
    : [];

  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-150' : ''} ${className}`}
      onClick={handleClick}
    >
      {showTimeline && (
        <div className={`absolute ${isDetailed ? 'left-4 top-8 w-0.5 h-12' : 'left-3 top-6 w-0.5 h-8'} bg-gray-200`}></div>
      )}
      
      <div className="flex items-start space-x-3">
        <ActivityIcon 
          actionType={activity.action_type}
          size={isDetailed ? 5 : 4}
          variant="circled"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(activity.action_type)}`}>
              {activity.action_type.toUpperCase()}
            </span>
            <span className={`text-${isDetailed ? 'sm' : 'xs'} text-gray-500`}>
              {formatDateTime(activity.created_at)}
            </span>
          </div>
          
          <p className={`text-${isDetailed ? 'sm' : 'xs'} ${isDetailed ? 'text-gray-900 mb-2' : 'text-gray-700'}`}>
            {formatActionDescription(activity)}
            {activity.ticket_title && (
              <span className="text-gray-600"> - {activity.ticket_title}</span>
            )}
          </p>

          {activity.action_type === "updated" && activity.old_values && activity.new_values && (
            <div className="text-xs text-gray-500">
              {changes.length} field(s) changed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ActivityItem);
