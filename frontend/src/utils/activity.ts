import { Plus, Move, Edit, Trash2, Clock, LucideIcon } from "lucide-react";
import { TicketHistory } from "@/types/models";

export type ActivityActionType = "created" | "moved" | "updated" | "deleted";

export const getActionIconType = (actionType: ActivityActionType): LucideIcon => {
  switch (actionType) {
    case "created":
      return Plus;
    case "moved":
      return Move;
    case "updated":
      return Edit;
    case "deleted":
      return Trash2;
    default:
      return Clock;
  }
};

export const getActionIconColor = (actionType: ActivityActionType): string => {
  switch (actionType) {
    case "created":
      return "text-green-600";
    case "moved":
      return "text-blue-600";
    case "updated":
      return "text-orange-600";
    case "deleted":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export const getActionColor = (actionType: ActivityActionType): string => {
  switch (actionType) {
    case "created":
      return "bg-green-100 text-green-800";
    case "moved":
      return "bg-blue-100 text-blue-800";
    case "updated":
      return "bg-orange-100 text-orange-800";
    case "deleted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatActionDescription = (historyItem: TicketHistory): string => {
  switch (historyItem.action_type) {
    case "created":
      return `Ticket created${historyItem.to_category_name ? ` in ${historyItem.to_category_name}` : ""}`;
    case "moved":
      return `Moved from ${historyItem.from_category_name} to ${historyItem.to_category_name}`;
    case "updated":
      return "Ticket updated";
    case "deleted":
      return `Ticket deleted${historyItem.from_category_name ? ` from ${historyItem.from_category_name}` : ""}`;
    default:
      return historyItem.action_type;
  }
};

export const getChangedFields = (
  oldValues: Record<string, any>, 
  newValues: Record<string, any>
): Array<{ field: string; oldValue: any; newValue: any }> => {
  const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
  
  if (!oldValues || !newValues) return changes;

  Object.keys(newValues).forEach(key => {
    let hasChanged = false;
    
    if (Array.isArray(oldValues[key]) && Array.isArray(newValues[key])) {
      const oldArray = oldValues[key];
      const newArray = newValues[key];
      
      if (oldArray.length !== newArray.length) {
        hasChanged = true;
      } else {
        const sortedOld = [...oldArray].sort();
        const sortedNew = [...newArray].sort();
        hasChanged = JSON.stringify(sortedOld) !== JSON.stringify(sortedNew);
      }
    } else {
      hasChanged = oldValues[key] !== newValues[key];
    }
    
    if (hasChanged) {
      changes.push({
        field: key,
        oldValue: oldValues[key],
        newValue: newValues[key]
      });
    }
  });

  return changes;
};

export const formatFieldValue = (value: any, field: string): string => {
  if (value === null || value === undefined) return "None";
  if (field === "expiry_date" && value) {
    return new Date(value).toLocaleDateString();
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    return value.join(", ");
  }
  return String(value);
};

export const formatFieldName = (field: string): string => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
