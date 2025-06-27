import React, { FC, FormEvent, useState, useEffect } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import RichTextEditor from "@/components/form/RichTextEditor";
import Select from "@/components/form/Select";
import UserAssignment from "@/components/form/UserAssignment";
import TicketHistory from "@/components/TicketHistory";
import { useDraft } from "@/context/DraftContext";
import { CreateTicketForm } from "@/types/forms";
import {
  Category,
  Ticket,
  TicketHistory as TicketHistoryType,
  User,
} from "@/types/models";
import { Clock, ExternalLink, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateForInput } from "@/utils/date";
import { getTicket } from "@/service/tickets";
import { getAllUsers } from "@/service/auth";
import StatusInfo from "./StatusInfo";

import TicketInfo from "./TicketInfo";

interface TicketModalProps {
  ticket?: (Ticket & { history?: TicketHistoryType[] }) | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit?: (data: CreateTicketForm) => void;
  onUpdate?: (ticketId: string, data: CreateTicketForm) => void;
  mode: "create" | "edit" | "view";
  onModeChange?: (mode: "create" | "edit" | "view") => void;
}

const TicketModal: FC<TicketModalProps> = ({
  ticket,
  isOpen,
  onClose,
  categories,
  onSubmit,
  onUpdate,
  mode,
  onModeChange,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    expiry_date: "",
    category_id: categories[0]?.id || "",
    assigned_user_ids: [],
  });
  const [ticketWithHistory, setTicketWithHistory] = useState<(Ticket & { history?: TicketHistoryType[] }) | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const isReadonly = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const { getDescription, updateDescription, clearDraft, isDraft } = useDraft();
  const currentDescription = getDescription(ticket?.id || "", (ticketWithHistory || ticket)?.description || "");
  const showDraftLabel = ticket?.id ? isDraft(ticket.id, (ticketWithHistory || ticket)?.description || "") : false;

  useEffect(() => {
    if (isOpen) {
      getAllUsers().then(response => setUsers(response.data)).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (ticket && (mode === "view" || mode === "edit") && isOpen) {
      getTicket(ticket.id, true)
        .then(response => setTicketWithHistory(response.data))
        .catch(() => setTicketWithHistory(ticket));
    } else {
      setTicketWithHistory(null);
    }
  }, [ticket, mode, isOpen]);

  useEffect(() => {
    const currentTicket = ticketWithHistory || ticket;
    
    if (currentTicket && (isEdit || mode === "view")) {
      setFormData({
        title: currentTicket.title,
        description: currentTicket.description || "",
        expiry_date: formatDateForInput(currentTicket.expiry_date),
        category_id: currentTicket.category_id,
        assigned_user_ids: currentTicket.assigned_users?.map(u => u.id) || [],
      });
    } else if (isCreate) {
      setFormData({
        title: "",
        description: "",
        expiry_date: "",
        category_id: categories[0]?.id || "",
        assigned_user_ids: [],
      });
    }
  }, [ticketWithHistory, ticket, mode, categories, isEdit, isCreate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReadonly) return;

    if (isEdit && ticket && onUpdate) {
      onUpdate(ticket.id, {...formData, description: currentDescription});
      clearDraft(ticket.id);
    } else if (isCreate && onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleViewFullDetails = (e: FormEvent) => {
    e.preventDefault();
    if (ticket) {
      onClose();
      router.push(`/dashboard/tickets/${ticket.id}`);
    }
  };

  const handleEditMode = (e: FormEvent) => {
    e.preventDefault();
    onModeChange?.("edit");
  };

  const handleCancelEdit = () => {
    const currentTicket = ticketWithHistory || ticket;
    if (currentTicket) {
      setFormData(prev => ({ 
        ...prev, 
        description: currentTicket.description || "" 
      }));
    }
    onModeChange?.("view");
  };

  const handleFormChange = (field: keyof CreateTicketForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categoryOptions = categories.map(cat => ({ label: cat.name, value: cat.id }));
  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const currentTicket = ticketWithHistory || ticket;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isCreate ? "Add New Task" : isEdit ? "Edit Task" : "Task Details"}
          </h2>
          {currentTicket && <StatusInfo expiryDate={currentTicket.expiry_date} />}
        </div>

        {showDraftLabel && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <span className="text-sm font-medium text-yellow-800">This form has unsaved changes!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Input
                label="Title *"
                type="text"
                required={!isReadonly}
                value={formData.title}
                onChange={e => handleFormChange('title', e.target.value)}
                placeholder="Enter task title..."
                readonly={isReadonly}
              />

              <RichTextEditor
                label="Description"
                value={currentDescription}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, description: value }));
                  if (ticket?.id) {
                    updateDescription(ticket.id, value, (ticketWithHistory || ticket)?.description || "");
                  }
                }}
                placeholder="Enter task description..."
                readonly={isReadonly}
              />

              {isReadonly ? (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <div className="flex items-center space-x-2 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCategory?.color || "#3B82F6" }} />
                    <span className="text-gray-700">{selectedCategory?.name || ""}</span>
                  </div>
                </div>
              ) : (
                <Select
                  label="Category"
                  value={formData.category_id}
                  onChange={e => handleFormChange('category_id', e.target.value)}
                  options={categoryOptions}
                  placeholder="Select a category..."
                />
              )}

              <UserAssignment
                label="Assigned Users"
                users={users}
                selectedUserIds={formData.assigned_user_ids}
                onChange={userIds => handleFormChange('assigned_user_ids', userIds)}
                readonly={isReadonly}
              />

              <Input
                label="Expiry Date"
                type="date"
                value={formData.expiry_date}
                onChange={e => handleFormChange('expiry_date', e.target.value)}
                readonly={isReadonly}
              />
            </div>

            <div className="space-y-6">
              {(mode === "view" || mode === "edit") && currentTicket && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Task Information</h3>
                  <TicketInfo
                    createdAt={currentTicket.created_at}
                    updatedAt={currentTicket.updated_at}
                  />
                </div>
              )}

              {ticketWithHistory?.history && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Activity History</h3>
                  <TicketHistory 
                    history={ticketWithHistory.history} 
                    onViewFullHistory={handleViewFullDetails} 
                    className="pt-0" 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            {mode === "view" ? (
              <>
                <Button type="button" onClick={handleEditMode} variant="primary" className="flex items-center space-x-2">
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
                <Button type="button" onClick={handleViewFullDetails} variant="outline" className="flex items-center space-x-2">
                  <ExternalLink size={16} />
                  <span>Full Details</span>
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>Close</Button>
              </>
            ) : mode === "edit" ? (
              <>
                <Button type="submit" variant="primary">Update Task</Button>
                <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">Add Task</Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TicketModal;
