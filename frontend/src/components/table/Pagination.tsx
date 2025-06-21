"use client";

import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Button from "@/components/Button";

interface TanStackServerPaginationProps<T> {
  table: Table<T>;
  isLoading?: boolean;
  totalItems: number;
}

const Pagination = <T,>({
  table,
  isLoading = false,
  totalItems
}: TanStackServerPaginationProps<T>) => {
  const { pageIndex, pageSize } = table.getState().pagination;
  const currentPage = pageIndex + 1;
  const totalPages = table.getPageCount();
  
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);
  
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          {totalItems === 0 ? (
            "No results"
          ) : (
            <>Showing {startItem} to {endItem} of {totalItems} results</>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            disabled={isLoading}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.firstPage()}
          disabled={!canPreviousPage || isLoading}
          className="px-2 py-1"
        >
          <ChevronsLeft size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!canPreviousPage || isLoading}
          className="px-2 py-1"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="flex items-center space-x-1 px-3">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!canNextPage || isLoading}
          className="px-2 py-1"
        >
          <ChevronRight size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.lastPage()}
          disabled={!canNextPage || isLoading}
          className="px-2 py-1"
        >
          <ChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;