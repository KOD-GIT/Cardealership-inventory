import type { TokenResponse, User } from "../types";
import { api } from "./client";

export async function registerRequest(email: string, password: string): Promise<User> {
  const { data } = await api.post<User>("/api/auth/register", { email, password });
  return data;
}

export async function loginRequest(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/api/auth/login", { email, password });
  return data;
}
