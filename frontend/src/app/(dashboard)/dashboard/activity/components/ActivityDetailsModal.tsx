import React, { FC } from "react";
import { TicketHistory } from "@/types/models";
import { ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
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

const ActivityDetailsModal: FC<ActivityDetailsModalProps> = ({
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

  const getAllFields = () => {
    if (!activityLog.old_values && !activityLog.new_values) return [];
    
    const oldFields = Object.keys(activityLog.old_values || {});
    const newFields = Object.keys(activityLog.new_values || {});
    const allFields = [...new Set([...oldFields, ...newFields])];
    
    return allFields;
  };

  const hasFieldChanged = (field: string) => {
    const oldValue = activityLog.old_values?.[field];
    const newValue = activityLog.new_values?.[field];
    return JSON.stringify(oldValue) !== JSON.stringify(newValue);
  };

  const formatPositionChange = (oldPosition: number, newPosition: number) => {
    if (oldPosition === newPosition) return "No change";
    
    if (newPosition < oldPosition) {
      return (
        <div className="flex items-center space-x-1 text-emerald-700 text-xs">
          <ArrowUp className="w-3 h-3" />
          <span>Moved up</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-orange-700 text-xs">
          <ArrowDown className="w-3 h-3" />
          <span>Moved down</span>
        </div>
      );
    }
  };

  const renderCompactValue = (field: string, value: any, isOld: boolean) => {
    const hasChanged = hasFieldChanged(field);
    
    if (field === 'position' && hasChanged) {
      if (isOld) {
        return <span className="text-xs text-slate-400">-</span>;
      } else {
        const oldPosition = activityLog.old_values?.position;
        const newPosition = activityLog.new_values?.position;
        if (typeof oldPosition === 'number' && typeof newPosition === 'number') {
          return formatPositionChange(oldPosition, newPosition);
        }
      }
    }

    const textClasses = hasChanged 
      ? (isOld ? "text-rose-700" : "text-emerald-700")
      : "text-slate-600";

    return (
      <span className={`text-xs ${textClasses}`}>
        {formatFieldValue(value, field)}
      </span>
    );
  };

  const allFields = getAllFields();

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <ActivityIcon actionType={activityLog.action_type} size={4} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Activity Details</h2>
              {activityLog.ticket_title && (
                <p className="text-sm text-slate-600">{activityLog.ticket_title}</p>
              )}
              <p className="text-xs text-slate-500">{formatDateTime(activityLog.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getActionColor(activityLog.action_type)}`}>
              {activityLog.action_type.toUpperCase()}
            </span>
          </div>
          
          <div className="bg-slate-50 rounded p-3">
            <p className="text-sm text-slate-700">{formatActionDescription(activityLog)}</p>
          </div>

          {allFields.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 text-xs font-medium text-slate-500 border-b pb-2">
                <div>Field</div>
                <div>Before</div>
                <div>After</div>
              </div>
              
              {allFields.map((field) => (
                <div key={field} className="grid grid-cols-3 gap-3 py-2 border-b border-slate-100 last:border-b-0">
                  <div className="text-sm font-medium text-slate-700 flex items-center">
                    {formatFieldName(field)}
                    {hasFieldChanged(field) && (
                      <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <div className="border-r border-slate-200 pr-3">
                    {renderCompactValue(field, activityLog.old_values?.[field], true)}
                  </div>
                  <div className="pl-3">
                    {renderCompactValue(field, activityLog.new_values?.[field], false)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activityLog.action_type === "moved" && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Movement</h4>
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <span className="bg-white px-2 py-1 rounded text-xs border">
                  {activityLog.from_category_name}
                </span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-white px-2 py-1 rounded text-xs border">
                  {activityLog.to_category_name}
                </span>
              </div>
            </div>
          )}

          {allFields.length === 0 && activityLog.action_type !== "moved" && (
            <div className="bg-slate-50 rounded p-4 text-center">
              <p className="text-sm text-slate-600">No detailed changes to display.</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-200 flex justify-end">
          <Button onClick={onClose} variant="secondary" className="px-4 py-2 text-sm">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ActivityDetailsModal;
