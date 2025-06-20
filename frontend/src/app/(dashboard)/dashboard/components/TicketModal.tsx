import React, { FC, FormEvent, useState, useEffect, MouseEvent } from "react";
import Modal from "@/components/Modal";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import TextArea from "@/components/form/TextArea";
import Select from "@/components/form/Select";
import { CreateTicketForm } from "@/types/forms";
import { Category, Ticket } from "@/types/models";
import { Clock, ExternalLink, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateForInput } from "@/utils/date";

interface TicketModalProps {
  ticket?: Ticket | null;
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
  });

  const isReadonly = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  useEffect(() => {
    if (ticket && (isEdit || mode === "view")) {
      setFormData({
        title: ticket.title,
        description: ticket.description || "",
        expiry_date: formatDateForInput(ticket.expiry_date),
        category_id: ticket.category_id,
      });
    } else if (isCreate) {
      setFormData({
        title: "",
        description: "",
        expiry_date: "",
        category_id: categories[0]?.id || "",
      });
    }
  }, [ticket, mode, isEdit, isCreate, categories, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isReadonly) return;

    if (isEdit && ticket && onUpdate) {
      onUpdate(ticket.id, formData);
    } else if (isCreate && onSubmit) {
      onSubmit(formData);
      setFormData({
        title: "",
        description: "",
        expiry_date: "",
        category_id: categories[0]?.id || "",
      });
    }

    onClose();
  };

  const handleViewFullDetails = () => {
    if (!ticket) return;
    onClose();
    router.push(`/dashboard/tickets/${ticket.id}`);
  };

  const handleEditMode = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onModeChange) {
      onModeChange("edit");
    }
  };

  const handleCancelEdit = () => {
    if (ticket && onModeChange) {
      setFormData({
        title: ticket.title,
        description: ticket.description || "",
        expiry_date: formatDateForInput(ticket.expiry_date),
        category_id: ticket.category_id,
      });
      onModeChange("view");
    }
  };

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const getSelectedCategoryName = () => {
    const category = categories.find((cat) => cat.id === formData.category_id);
    return category?.name || "";
  };

  const getSelectedCategoryColor = () => {
    const category = categories.find((cat) => cat.id === formData.category_id);
    return category?.color || "#3B82F6";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpiringSoon =
    ticket?.expiry_date &&
    new Date(ticket.expiry_date) <
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const isOverdue =
    ticket?.expiry_date && new Date(ticket.expiry_date) < new Date();

  const getStatusInfo = () => {
    if (isOverdue) {
      return {
        text: "Overdue",
        color: "text-red-600 bg-red-50 border-red-200",
      };
    }
    if (isExpiringSoon) {
      return {
        text: "Due Soon",
        color: "text-orange-600 bg-orange-50 border-orange-200",
      };
    }
    return {
      text: "On Track",
      color: "text-green-600 bg-green-50 border-green-200",
    };
  };

  const getModalTitle = () => {
    if (isCreate) return "Add New Task";
    if (isEdit) return "Edit Task";
    return "Task Details";
  };

  const statusInfo =
    (mode === "view" || mode === "edit") && ticket ? getStatusInfo() : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={mode === "view" || mode === "edit" ? "max-w-2xl" : "max-w-md"}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
          {statusInfo && (
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
            >
              {statusInfo.text}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title *"
            type="text"
            required={!isReadonly}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter task title..."
            readonly={isReadonly}
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            placeholder="Enter task description..."
            readonly={isReadonly}
          />

          {isReadonly ? (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="flex items-center space-x-2 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getSelectedCategoryColor() }}
                />
                <span className="text-gray-700">
                  {getSelectedCategoryName()}
                </span>
              </div>
            </div>
          ) : (
            <Select
              label="Category"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              options={categoryOptions}
              placeholder="Select a category..."
              readonly={isReadonly}
            />
          )}

          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiry_date}
            onChange={(e) =>
              setFormData({ ...formData, expiry_date: e.target.value })
            }
            readonly={isReadonly}
          />

          {(mode === "view" || mode === "edit") && ticket && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(ticket.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatDateTime(ticket.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            {mode === "view" ? (
              <>
                <Button
                  type="button"
                  onClick={handleEditMode}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleViewFullDetails}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Full Details</span>
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
              </>
            ) : mode === "edit" ? (
              <>
                <Button type="submit" variant="primary">
                  Update Task
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Task
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TicketModal;
