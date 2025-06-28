import { isTicketExpiringSoon, isTicketOverdue } from "@/utils/date";
import { AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { FC, memo } from "react";
import { formatDate } from "@/utils/date";

interface StatusInfoProps {
  expiryDate?: string;
  className?: string;
  showDate?: boolean;
}

const StatusInfo: FC<StatusInfoProps> = ({
  expiryDate,
  className = "",
  showDate = false,
}) => {
  if (!expiryDate) return null;

  const isOverdue = isTicketOverdue(expiryDate);
  const isExpiringSoon = isTicketExpiringSoon(expiryDate);

  let statusConfig;

  if (isOverdue) {
    statusConfig = {
      text: "Overdue",
      color: "text-red-600 bg-red-50 border-red-200",
      icon: AlertCircle,
    };
  } else if (isExpiringSoon) {
    statusConfig = {
      text: "Due Soon",
      color: "text-yellow-500 bg-orange-50 border-orange-200",
      icon: AlertCircle,
    };
  } else {
    statusConfig = {
      text: "On Track",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: CheckCircle,
    };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`space-y-1 ${className}`}>
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}
      >
        <StatusIcon size={16} className="mr-2" />
        {statusConfig.text}
      </div>
      
      {showDate && expiryDate && (
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{formatDate(expiryDate)}</span>
        </div>
      )}
    </div>
  );
};

export default memo(StatusInfo);
