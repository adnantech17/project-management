import React from "react";
import { TicketHistory } from "@/types/models";
import { ArrowRight } from "lucide-react";
import { formatDateTime } from "@/utils/date";
import { formatActionDescription, getChangedFields, formatFieldValue, formatFieldName, getActionColor } from "@/utils/activity";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import ActivityIcon from "@/components/activity/ActivityIcon";

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityLog: TicketHistory | null;
}

const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activityLog,
}) => {
  if (!activityLog) return null;

  const changes =
    activityLog.action_type === "updated" &&
    activityLog.old_values &&
    activityLog.new_values
      ? getChangedFields(activityLog.old_values, activityLog.new_values)
      : [];

  const renderValueComparison = (field: string, oldValue: any, newValue: any) => {
    return (
      <div key={field} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">{formatFieldName(field)}</h4>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">Before</div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <span className="text-red-800 font-mono text-sm">
                {formatFieldValue(oldValue, field)}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm text-gray-500 mb-2">After</div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <span className="text-green-800 font-mono text-sm">
                {formatFieldValue(newValue, field)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-6">
          <ActivityIcon actionType={activityLog.action_type} size={5} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Activity Details
            </h2>
            {activityLog.ticket_title && (
              <p className="text-sm font-medium text-gray-700">
                {activityLog.ticket_title}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {formatDateTime(activityLog.created_at)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getActionColor(activityLog.action_type)}`}>
              {activityLog.action_type.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700">
            {formatActionDescription(activityLog)}
          </p>
        </div>

        {changes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Changes Made</h3>
            <div className="space-y-4">
              {changes.map((change) => 
                renderValueComparison(change.field, change.oldValue, change.newValue)
              )}
            </div>
          </div>
        )}

        {activityLog.action_type === "moved" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Movement Details
            </h3>
            <div className="flex items-center space-x-3 text-blue-800">
              <span className="font-medium">
                {activityLog.from_category_name}
              </span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">
                {activityLog.to_category_name}
              </span>
            </div>
          </div>
        )}

        {changes.length === 0 && activityLog.action_type !== "moved" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-600">
              No detailed changes to display for this activity.
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityDetailsModal;
