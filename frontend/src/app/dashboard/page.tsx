"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  MoreHorizontal,
  Calendar,
  MessageCircle,
  Bell,
} from "lucide-react";
import { CreateTicketForm, CreateCategoryForm } from "@/types/forms";
import { Category, Ticket } from "@/types/models";
import TicketModal from "@/app/dashboard/components/TicketModal";
import CategoryModal from "@/app/dashboard/components/CategoryModal";
import CategoryColumn from "@/app/dashboard/components/CategoryColumn";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getCategories, createCategory } from "@/service/categories";
import { getTickets, createTicket } from "@/service/tickets";

const DashboardPage: React.FC = () => {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategoryForTicket, setSelectedCategoryForTicket] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [categoriesResponse, ticketsResponse] = await Promise.all([
        getCategories(),
        getTickets()
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
    setIsTicketModalOpen(true);
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

  const getTicketsForCategory = (categoryId: string): Ticket[] => {
    return tickets.filter((ticket) => ticket.category_id === categoryId);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                To-Do Board
              </h1>
              {user && (
                <span className="text-sm text-gray-600">
                  Welcome, {user.username}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
              </button>

              <Button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </Button>

              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.username?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus size={16} />
                <span>Add Category</span>
              </Button>

              <Button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50">
                <Filter size={16} />
                <span>Filter & Sort</span>
              </Button>

              <Button
                onClick={() => handleAddTicket()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
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

        <main className="flex-1 p-6 bg-gray-50">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No categories yet. Create your first category to get started!</p>
              <Button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Category
              </Button>
            </div>
          ) : (
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {categories.map((category) => (
                <CategoryColumn
                  key={category.id}
                  category={category}
                  tickets={getTicketsForCategory(category.id)}
                  onAddTicket={() => handleAddTicket(category.id)}
                />
              ))}
            </div>
          )}
        </main>

        <TicketModal
          isOpen={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedCategoryForTicket("");
          }}
          categories={categories}
          onSubmit={handleCreateTicket}
        />

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSubmit={handleCreateCategory}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
