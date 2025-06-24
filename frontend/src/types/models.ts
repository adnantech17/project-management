export interface User {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  position: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  expiry_date?: string;
  position: number;
  category_id: string;
  user_id: string;
  assigned_users: User[];
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: "created" | "moved" | "updated" | "deleted";
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  from_category_name?: string;
  to_category_name?: string;
  created_at: string;
  ticket_title?: string;
}
