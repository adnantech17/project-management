import api from "@/lib/axios";

export async function login(username: string, password: string) {
  return api.post("/auth/login", { username, password });
}

export async function register(email: string, username: string, password: string) {
  return api.post("/auth/register", { email, username, password });
}

export async function getMe() {
  return api.get<{ username: string; email: string }>("/auth/me");
}

export async function logout() {
  return api.post("/auth/logout");
} 