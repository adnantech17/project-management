"use client";

import React, { useState, useEffect, FC } from "react";
import { Plus, Filter } from "lucide-react";
import { CreateTicketForm, CreateCategoryForm } from "@/types/forms";
import { Category, Ticket } from "@/types/models";
import TicketModal from "@/app/(dashboard)/dashboard/components/TicketModal";
import CategoryModal from "@/app/(dashboard)/dashboard/components/CategoryModal";
import DragDropBoard from "@/app/(dashboard)/dashboard/components/DragDropBoard";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getCategories, createCategory } from "@/service/categories";
import { getTickets, createTicket, updateTicket } from "@/service/tickets";

const DashboardPage: FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketModalMode, setTicketModalMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedCategoryForTicket, setSelectedCategoryForTicket] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [categoriesResponse, ticketsResponse] = await Promise.all([
        getCategories(),
        getTickets(),
      ]);

      setCategories(categoriesResponse.data);
      setTickets(ticketsResponse.data);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTicket = (categoryId: string = "") => {
    setSelectedCategoryForTicket(categoryId);
    setSelectedTicket(null);
    setTicketModalMode("create");
    setIsTicketModalOpen(true);
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketModalMode("view");
    setIsTicketModalOpen(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketModalMode("edit");
    setIsTicketModalOpen(true);
  };

  const handleViewTicketDetails = (ticket: Ticket) => {
    router.push(`/dashboard/tickets/${ticket.id}`);
  };

  const handleCreateTicket = async (data: CreateTicketForm) => {
    try {
      const ticketData = {
        ...data,
        category_id: selectedCategoryForTicket || data.category_id,
      };

      const response = await createTicket(ticketData);
      setTickets([...tickets, response.data]);
      setError("");
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setError("Failed to create ticket. Please try again.");
    }
  };

  const handleUpdateTicket = async (
    ticketId: string,
    data: CreateTicketForm
  ) => {
    try {
      const response = await updateTicket(ticketId, data);
      
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId ? response.data : ticket
        )
      );
      setError("");
    } catch (err: any) {
      console.error("Error updating ticket:", err);
      setError("Failed to update ticket. Please try again.");
    }
  };

  const handleCreateCategory = async (data: CreateCategoryForm) => {
    try {
      const response = await createCategory(data);
      setCategories([...categories, response.data]);
      setError("");
    } catch (err: any) {
      console.error("Error creating category:", err);
      setError("Failed to create category. Please try again.");
    }
  };

  const handleTicketsUpdate = (updatedTickets: Ticket[]) => {
    setTickets(updatedTickets);
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
    setSelectedCategoryForTicket("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Category</span>
            </Button>

            <Button variant="outline" className="flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter & Sort</span>
            </Button>

            <Button
              onClick={() => handleAddTicket()}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add New Task</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      <main className="flex-1 p-6 bg-gray-50 overflow-auto">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              No categories yet. Create your first category to get started!
            </p>
            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              variant="primary"
            >
              Create Category
            </Button>
          </div>
        ) : (
          <DragDropBoard
            categories={categories}
            tickets={tickets}
            onTicketsUpdate={handleTicketsUpdate}
            onAddTicket={handleAddTicket}
            onViewTicket={handleViewTicket}
            onEditTicket={handleEditTicket}
            onViewTicketDetails={handleViewTicketDetails}
            onError={handleError}
          />
        )}
      </main>

      <TicketModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={handleCloseTicketModal}
        categories={categories}
        onSubmit={handleCreateTicket}
        onUpdate={handleUpdateTicket}
        mode={ticketModalMode}
        onModeChange={setTicketModalMode}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />
    </div>
  );
};

export default DashboardPage;
