export interface LoginFormInputs {
  username: string;
  password: string;
  keepLoggedIn: boolean;
}

export interface RegisterFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface CreateTicketForm {
  title: string;
  description?: string;
  expiry_date?: string;
  category_id: string;
}

export interface CreateCategoryForm {
  name: string;
  color: string;
}
