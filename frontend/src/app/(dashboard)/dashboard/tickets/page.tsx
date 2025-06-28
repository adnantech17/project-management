"use client";

import React, { FC, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import { Table } from "@/components/table";
import { Ticket } from "@/types/models";
import { getTicketsPaginated } from "@/service/tickets";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/date";

const AllTicketsPage: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 10;

  const handleRowClick = useCallback((ticket: Ticket) => {
    router.push(`/dashboard/tickets/${ticket.id}`);
  }, [router]);

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900 cursor-pointer hover:text-blue-600">
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: row.original.category?.color || "#6B7280" }}
            />
            <span className="text-gray-900">{row.original.category?.name || "No category"}</span>
          </div>
        ),
      },
      {
        accessorKey: "expiry_date",
        header: "Expiry Date",
        cell: ({ row }) => {
          const expiryDate = row.original.expiry_date;
          if (!expiryDate) return <span className="text-gray-400">No expiry</span>;

          const date = new Date(expiryDate);
          const isOverdue = date < new Date();
          const isExpiringSoon = date < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

          return (
            <div className={`flex items-center space-x-1 ${
              isOverdue ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-600"
            }`}>
              <Calendar size={14} />
              <span>{formatDate(expiryDate)}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-gray-600">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
    ],
    [router]
  );

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await getTicketsPaginated({
        page: currentPage,
        page_size: pageSize,
      });
      
      setTickets(response.data.items);
      setTotalItems(response.data.total);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentPage, pageSize]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
        </div>
      </div>

      <div className="flex-1 p-6 bg-gray-50">
        <Table
          data={tickets}
          columns={columns}
          totalItems={totalItems}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
};

export default AllTicketsPage;
