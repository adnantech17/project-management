import api from "@/lib/axios";
import { User } from "@/types/models";
import { UserUpdateForm } from "@/types/forms";

export async function login(username: string, password: string) {
  return api.post("/auth/login", { username, password });
}

export async function register(email: string, username: string, password: string) {
  return api.post("/auth/register", { email, username, password });
}

export async function getMe() {
  return api.get<User>("/auth/me");
}

export async function updateUser(userData: UserUpdateForm) {
  return api.put<User>("/auth/me", userData);
}

export async function logout() {
  return api.post("/auth/logout");
} 

export async function getAllUsers() {
  return api.get<User[]>("/auth/users");
} 