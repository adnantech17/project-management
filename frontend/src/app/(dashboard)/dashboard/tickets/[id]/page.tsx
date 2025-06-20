"use client";

import React, { FC, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket, Category } from "@/types/models";
import { getTicket, updateTicket } from "@/service/tickets";
import { getCategories } from "@/service/categories";
import Button from "@/components/Button";
import Input from "@/components/form/Input";
import TextArea from "@/components/form/TextArea";
import {
  ArrowLeft,
  Clock,
  Edit,
  User,
  History,
  AlertCircle,
  CheckCircle,
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
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<CreateTicketForm>({
    title: "",
    description: "",
    expiry_date: "",
    category_id: "",
  });

  const ticketId = params.id as string;

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
      });
    }
  }, [ticket]);

  const loadTicketData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [ticketResponse, categoriesResponse] = await Promise.all([
        getTicket(ticketId),
        getCategories(),
      ]);

      const ticketData = ticketResponse.data;
      const categoriesData = categoriesResponse.data;

      setTicket(ticketData);
      setCategories(categoriesData);
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
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleUpdateTicket = async () => {
    if (!ticket) return;

    try {
      const response = await updateTicket(ticket.id, formData);
      setTicket(response.data);
      setIsEditMode(false);
      setError("");
    } catch (err: any) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket. Please try again.");
    }
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
      month: "long",
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
        icon: AlertCircle,
      };
    }
    if (isExpiringSoon) {
      return {
        text: "Due Soon",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        icon: AlertCircle,
      };
    }
    return {
      text: "On Track",
      color: "text-green-600 bg-green-50 border-green-200",
      icon: CheckCircle,
    };
  };

  const getSelectedCategory = () => {
    return categories.find((cat) => cat.id === formData.category_id);
  };

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

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const selectedCategory = getSelectedCategory();

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
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 mr-4">
                    <Input
                      label="Title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      readonly={!isEditMode}
                      className={
                        !isEditMode
                          ? "text-2xl font-bold border-none bg-transparent px-0 py-0"
                          : "text-2xl font-bold"
                      }
                    />
                  </div>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
                  >
                    <StatusIcon size={16} className="mr-2" />
                    {statusInfo.text}
                  </div>
                </div>

                <TextArea
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter task description..."
                  readonly={!isEditMode}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    {isEditMode ? (
                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedCategory?.color }}
                        />
                        <span className="text-gray-700">
                          {selectedCategory?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Expiry Date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                    readonly={!isEditMode}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Created
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDateTime(ticket.created_at)}
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
                        <p className="text-sm font-medium text-gray-500">
                          Last Updated
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {formatDateTime(ticket.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Assigned Users
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">
                      User assignment feature coming soon...
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <History className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      Activity History
                    </h2>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-500 text-sm">
                      Activity history feature coming soon...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
