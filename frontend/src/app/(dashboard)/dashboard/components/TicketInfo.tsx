import { formatDateTime } from "@/utils/date";
import { Clock } from "lucide-react";
import { FC } from "react";

interface TicketInfoProps {
  createdAt: string;
  updatedAt: string;
  className?: string;
}

const TicketInfo: FC<TicketInfoProps> = ({
  createdAt,
  updatedAt,
  className = "",
}) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
  >
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Created</p>
          <p className="text-sm text-gray-900 mt-1">
            {formatDateTime(createdAt)}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Last Updated</p>
          <p className="text-sm text-gray-900 mt-1">
            {formatDateTime(updatedAt)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default TicketInfo;
