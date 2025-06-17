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
  created_at: string;
  updated_at: string;
  category?: Category;
}
