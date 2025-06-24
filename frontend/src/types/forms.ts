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

export interface UserUpdateForm {
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

export interface CreateTicketForm {
  title: string;
  description?: string;
  expiry_date?: string;
  category_id: string;
  assigned_user_ids: string[];
}

export interface EditTicketForm {
  title?: string;
  description?: string;
  expiry_date?: string;
  category_id?: string;
  assigned_user_ids?: string[];
}

export interface CreateCategoryForm {
  name: string;
  color: string;
}
