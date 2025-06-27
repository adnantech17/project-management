import { AlertCircle, CheckCircle } from "lucide-react";
import { FC } from "react";

interface StatusInfoProps {
  expiryDate?: string;
  className?: string;
}

const StatusInfo: FC<StatusInfoProps> = ({
  expiryDate,
  className = "",
}) => {
  if (!expiryDate) return null;

  const now = new Date();
  const expiry = new Date(expiryDate);
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const isOverdue = expiry < now;
  const isExpiringSoon = expiry < threeDaysFromNow;

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
      color: "text-orange-600 bg-orange-50 border-orange-200",
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
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color} ${className}`}
    >
      <StatusIcon size={16} className="mr-2" />
      {statusConfig.text}
    </div>
  );
};

export default StatusInfo;
