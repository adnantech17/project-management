import api from "@/lib/axios";
import { Ticket, TicketHistory } from "@/types/models";
import { CreateTicketForm } from "@/types/forms";

export interface GetTicketsParams {
  search?: string;
  assignedUserIds?: string[];
  onlyMyIssues?: boolean;
  page?: number;
  pageSize?: number;
}

export const getTickets = async (params: GetTicketsParams = {}) => {
  return api.get('/tickets/', { params });
};

export const getTicketsPaginated = async (params: GetTicketsParams = {}) => {
  const response = await getTickets(params);
  return response;
};

export async function getTicket(ticketId: string, includeHistory: boolean = true) {
  return api.get<Ticket & { history?: TicketHistory[] }>(`/tickets/${ticketId}?include_history=${includeHistory}`);
}

export async function createTicket(data: CreateTicketForm) {
  return api.post<Ticket>("/tickets/", data);
}

export async function updateTicket(ticketId: string, data: Partial<CreateTicketForm>) {
  return api.put<Ticket>(`/tickets/${ticketId}/`, data);
}

export async function deleteTicket(ticketId: string) {
  return api.delete(`/tickets/${ticketId}`);
}

export async function dragDropTicket(ticketId: string, targetCategoryId: string, targetPosition: number) {
  return api.put<Ticket>("/tickets/drag-drop/", {
    ticket_id: ticketId,
    target_category_id: targetCategoryId,
    target_position: targetPosition
  });
}

export async function getAllActivityLogs(page: number = 1, pageSize: number = 50, onlyByMe: boolean = false) {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    only_by_me: onlyByMe.toString()
  });
  return api.get<TicketHistory[]>(`/tickets/history/all?${params}`);
}
