"use client";

import React, { useState, useEffect, FC } from "react";
import { Filter, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { CreateTicketForm, CreateCategoryForm } from "@/types/forms";
import { Category, Ticket, User } from "@/types/models";
import TicketModal from "@/app/(dashboard)/dashboard/components/TicketModal";
import CategoryModal from "@/app/(dashboard)/dashboard/components/CategoryModal";
import DragDropBoard from "@/app/(dashboard)/dashboard/components/DragDropBoard";
import FilterBar from "@/components/FilterBar";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/service/categories";
import { getTickets, createTicket, updateTicket, deleteTicket } from "@/service/tickets";
import { getAllUsers } from "@/service/auth";
import ConfirmDialog from "@/components/ConfirmDialog";

const DashboardPage: FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketModalMode, setTicketModalMode] = useState<
    "create" | "edit" | "view"
  >("create");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedCategoryForTicket, setSelectedCategoryForTicket] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false,
  });
  
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);

  const [search, setSearch] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [onlyMyIssues, setOnlyMyIssues] = useState<boolean>(false);
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      applyFilters();
    }
  }, [search, selectedUserIds, onlyMyIssues, allTickets, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [categoriesResponse, ticketsResponse, usersResponse] = await Promise.all([
        getCategories(),
        getTickets(),
        getAllUsers(),
      ]);

      setCategories(categoriesResponse.data);
      setAllTickets(ticketsResponse.data.items);
      setUsers(usersResponse.data);
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTickets];

    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm) ||
        (ticket.description && ticket.description.toLowerCase().includes(searchTerm))
      );
    }

    if (selectedUserIds.length > 0) {
      filtered = filtered.filter(ticket => 
        ticket.assigned_users && 
        ticket.assigned_users.some(user => selectedUserIds.includes(user.id))
      );
    }

    if (onlyMyIssues && user) {
      filtered = filtered.filter(ticket => 
        ticket.assigned_users && 
        ticket.assigned_users.some(assignedUser => assignedUser.username === user.username)
      );
    }

    setTickets(filtered);
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
      const newTicket = response.data;
      setAllTickets([...allTickets, newTicket]);
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
      const updatedTicket = response.data;
      
      const updatedAllTickets = allTickets.map((ticket) =>
        ticket.id === ticketId ? updatedTicket : ticket
      );

      setAllTickets(updatedAllTickets);
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

  const handleUpdateCategory = async (categoryId: string, data: CreateCategoryForm) => {
    try {
      const response = await updateCategory(categoryId, data);
      const updatedCategories = categories.map((category) =>
        category.id === categoryId ? response.data : category
      );
      setCategories(updatedCategories);
      setError("");
    } catch (err: any) {
      console.error("Error updating category:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryModalMode("edit");
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteCategory(category.id),
      isLoading: false,
    });
  };

  const confirmDeleteCategory = async (categoryId: string) => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteCategory(categoryId);
      const updatedCategories = categories.filter((category) => category.id !== categoryId);
      setCategories(updatedCategories);
      setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
      setError("");
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      
      if (err.response?.status === 400) {
        setError(err.response.data.detail || "Cannot delete category with existing tickets.");
      } else {
        setError("Failed to delete category. Please try again.");
      }
    }
  };

  const handleCategoriesUpdate = (updatedCategories: Category[]) => {
    setCategories(updatedCategories);
    setError("");
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Ticket",
      message: `Are you sure you want to delete "${ticket.title}"? This action cannot be undone.`,
      onConfirm: () => confirmDeleteTicket(ticket.id),
      isLoading: false,
    });
  };

  const confirmDeleteTicket = async (ticketId: string) => {
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteTicket(ticketId);
      const response = await getTickets();
      
      handleTicketsUpdate(response.data.items);
      setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
      setError("");
    } catch (err: any) {
      console.error("Error deleting ticket:", err);
      
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
      setError("Failed to delete ticket. Please try again.");
    }
  };

  const handleTicketsUpdate = (updatedTickets: Ticket[]) => {
    setAllTickets(updatedTickets);
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

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
    setCategoryModalMode("create");
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryModalMode("create");
    setIsCategoryModalOpen(true);
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
      <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Filter size={16} />
            <span>Filters</span>
            {isFiltersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleAddCategory}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Category</span>
            </Button>

            <Button
              onClick={() => handleAddTicket()}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>

        <div className={`
          ${isFiltersOpen ? 'block' : 'hidden'} lg:block
          ${isFiltersOpen ? 'mb-4' : ''}
        `}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              selectedUserIds={selectedUserIds}
              onUserIdsChange={setSelectedUserIds}
              onlyMyIssues={onlyMyIssues}
              onOnlyMyIssuesChange={setOnlyMyIssues}
              users={users}
              className="flex-1"
            />
            
            <div className="hidden lg:flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={handleAddCategory}
                variant="outline"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus size={16} />
                <span>Add Category</span>
              </Button>

              <Button
                onClick={() => handleAddTicket()}
                variant="primary"
                className="flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus size={16} />
                <span>Add New Task</span>
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 overflow-auto">
        {categories.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 mb-4">
              No categories yet. Create your first category to get started!
            </p>
            <Button
              onClick={handleAddCategory}
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
            onCategoriesUpdate={handleCategoriesUpdate}
            onAddTicket={handleAddTicket}
            onViewTicket={handleViewTicket}
            onEditTicket={handleEditTicket}
            onViewTicketDetails={handleViewTicketDetails}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onDeleteTicket={handleDeleteTicket}
            onError={handleError}
          />
        )}
      </div>

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
        onClose={handleCloseCategoryModal}
        onSubmit={handleCreateCategory}
        onUpdate={handleUpdateCategory}
        category={selectedCategory}
        mode={categoryModalMode}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isLoading={confirmDialog.isLoading}
        variant="danger"
        confirmText="Delete"
      />
    </div>
  );
};

export default DashboardPage;
