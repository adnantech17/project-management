import api from "@/lib/axios";
import { Ticket } from "@/types/models";
import { CreateTicketForm } from "@/types/forms";

export async function getTickets(categoryId?: string) {
  const params = categoryId ? { category_id: categoryId } : {};
  return api.get<Ticket[]>("/tickets", { params });
}

export async function getTicket(ticketId: string) {
  return api.get<Ticket>(`/tickets/${ticketId}`);
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