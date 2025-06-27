"use client";

import React, { FC, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket, Category, TicketHistory as TicketHistoryType, User } from "@/types/models";
import { getTicket, updateTicket } from "@/service/tickets";
import { getCategories } from "@/service/categories";
import { getAllUsers } from "@/service/auth";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import RichTextEditor from "@/components/form/RichTextEditor";
import UserAssignment from "@/components/form/UserAssignment";
import TicketHistory from "@/components/TicketHistory";
import StatusInfo from "@/app/(dashboard)/dashboard/components/StatusInfo";
import TicketInfo from "@/app/(dashboard)/dashboard/components/TicketInfo";
import CategoryDisplay from "@/app/(dashboard)/dashboard/components/CategoryDisplay";
import { useDraft } from "@/context/DraftContext";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CreateTicketForm } from "@/types/forms";
import { formatDateForInput } from "@/utils/date";

const TicketDetailPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<(Ticket & { history?: TicketHistoryType[] }) | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    expiry_date: "",
    category_id: "",
    assigned_user_ids: [],
  });

  const ticketId = params.id as string;

  const { getDescription, updateDescription, clearDraft, isDraft } = useDraft();
  const currentDescription = getDescription(ticketId || "", ticket?.description || "");
  const showDraftLabel = ticketId && ticket ? isDraft(ticketId, ticket.description || "") : false;

  useEffect(() => {
    if (user && ticketId) {
      loadTicketData();
    }
  }, [user, ticketId]);

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || "",
        expiry_date: formatDateForInput(ticket.expiry_date),
        category_id: ticket.category_id,
        assigned_user_ids: ticket.assigned_users.map((user) => user.id),
      });
    }
  }, [ticket]);

  const loadTicketData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [ticketResponse, categoriesResponse, usersResponse] = await Promise.all([
        getTicket(ticketId, true), // Get ticket with history
        getCategories(),
        getAllUsers(),
      ]);

      const ticketData = ticketResponse.data;
      const categoriesData = categoriesResponse.data;
      const usersData = usersResponse.data;

      setTicket(ticketData);
      setCategories(categoriesData);
      setUsers(usersData);
    } catch (err: any) {
      console.error("Error loading ticket:", err);
      setError("Failed to load ticket details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleToggleEdit = () => {
    if (isEditMode) {
      if (ticket) {
        setFormData({
          title: ticket.title,
          description: ticket.description || "",
          expiry_date: formatDateForInput(ticket.expiry_date),
          category_id: ticket.category_id,
          assigned_user_ids: ticket.assigned_users.map((user) => user.id),
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    try {
      const response = await updateTicket(ticket.id, {...formData, description: currentDescription});
      setTicket(response.data);
      setIsEditMode(false);
      setError("");
      clearDraft(ticket.id);
    } catch (err: any) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket. Please try again.");
    }
  };

  const handleFormChange = (field: keyof CreateTicketForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Ticket not found"}</p>
          <Button onClick={handleBack} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Button>
          <div className="flex items-center space-x-2">
            {isEditMode ? (
              <>
                <Button
                  onClick={handleUpdateTicket}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </Button>
                <Button
                  onClick={handleToggleEdit}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </Button>
              </>
            ) : (
              <Button
                onClick={handleToggleEdit}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-6">
                {showDraftLabel && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-yellow-800">This form has unsaved changes!</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 mr-4">
                    <Input
                      label="Title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      readonly={!isEditMode}
                      required={true}
                      className={
                        !isEditMode
                          ? "text-2xl font-bold border-none bg-transparent px-0 py-0"
                          : "text-2xl font-bold"
                      }
                    />
                  </div>
                  <StatusInfo expiryDate={ticket.expiry_date} />
                </div>

                <RichTextEditor
                  label="Description"
                  value={currentDescription}
                  onChange={(value) => {
                    setFormData(prev => ({ ...prev, description: value }));
                    if (ticketId && ticket) {
                      updateDescription(ticketId, value, ticket.description || "");
                    }
                  }}
                  placeholder="Enter task description..."
                  readonly={!isEditMode}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CategoryDisplay
                    category={selectedCategory}
                    categories={categories}
                    selectedCategoryId={formData.category_id}
                    onCategoryChange={(categoryId) => handleFormChange('category_id', categoryId)}
                    isEditMode={isEditMode}
                    required={true}
                  />

                  <Input
                    label="Expiry Date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleFormChange('expiry_date', e.target.value)}
                    readonly={!isEditMode}
                  />
                </div>

                <TicketInfo
                  createdAt={ticket.created_at}
                  updatedAt={ticket.updated_at}
                  className="pt-6 border-t"
                />

                <div className="border-t pt-6">
                  <UserAssignment
                    label="Assigned Users"
                    users={users}
                    selectedUserIds={formData.assigned_user_ids}
                    onChange={(userIds: string[]) => 
                      handleFormChange('assigned_user_ids', userIds)
                    }
                    readonly={!isEditMode}
                  />
                </div>

                {ticket.history && (
                  <div className="border-t pt-6 mt-6">
                    <TicketHistory
                      history={ticket.history}
                      showFullHistory={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
