import api from "@/lib/axios";
import { Ticket, TicketHistory } from "@/types/models";
import { CreateTicketForm } from "@/types/forms";

export async function getTickets(categoryId?: string, page?: number, pageSize?: number) {
  const params: any = {};
  if (categoryId) {
    params.category_id = categoryId;
  }

  if (page) {
    params.page = page;
  }

  if (pageSize) {
    params.page_size = pageSize;
  }
  
  return api.get<{
    items: Ticket[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }>("/tickets", { params });
}

export async function getTicketsPaginated(page: number = 1, pageSize: number = 10, categoryId?: string) {
  return getTickets(categoryId, page, pageSize);
}

export async function getTicket(ticketId: string, includeHistory: boolean = true) {
  return api.get<Ticket & { history?: TicketHistory[] }>(`/tickets/${ticketId}?include_history=${includeHistory}`);
}

export async function createTicket(data: CreateTicketForm) {
  return api.post<Ticket>("/tickets", data);
}

export async function updateTicket(ticketId: string, data: Partial<CreateTicketForm>) {
  return api.put<Ticket>(`/tickets/${ticketId}`, data);
}

export async function deleteTicket(ticketId: string) {
  return api.delete(`/tickets/${ticketId}`);
}

export async function reorderTickets(positions: Array<{ id: string; position: number; category_id?: string }>) {
  return api.put<Ticket[]>("/tickets/reorder", positions);
}

export async function dragDropTicket(ticketId: string, targetCategoryId: string, targetPosition: number) {
  return api.put<Ticket>("/tickets/drag-drop", {
    ticket_id: ticketId,
    target_category_id: targetCategoryId,
    target_position: targetPosition
  });
}

export async function getAllActivityLogs(page: number = 1, pageSize: number = 50) {
  return api.get<TicketHistory[]>(`/tickets/history/all?page=${page}&page_size=${pageSize}`);
}
