import api from "@/lib/axios";
import { Category } from "@/types/models";
import { CreateCategoryForm } from "@/types/forms";

export async function getCategories() {
  return api.get<Category[]>("/categories");
}

export async function getCategory(categoryId: string) {
  return api.get<Category>(`/categories/${categoryId}`);
}

export async function createCategory(data: CreateCategoryForm) {
  return api.post<Category>("/categories", data);
}

export async function updateCategory(categoryId: string, data: Partial<CreateCategoryForm>) {
  return api.put<Category>(`/categories/${categoryId}`, data);
}

export async function deleteCategory(categoryId: string) {
  return api.delete(`/categories/${categoryId}`);
}
