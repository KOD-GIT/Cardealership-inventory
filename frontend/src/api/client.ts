import axios from "axios";
import type { User } from "../types";

const TOKEN_KEY = "showroom.token";
const USER_KEY = "showroom.user";

/** Session storage helpers. Every read/write is guarded: storage can be unavailable (private mode). */
export const session = {
  getToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch { return null; }
  },
  save(token: string, user: User): void {
    try { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* ignore */ }
  },
  clear(): void {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
  },
};

let onUnauthorized: (() => void) | null = null;
/** AuthProvider registers a callback that logs the user out when the API answers 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 on /login just means "wrong password"; only an expired/invalid token should log out.
    const isLoginCall = String(error.config?.url ?? "").includes("/api/auth/login");
    if (error.response?.status === 401 && !isLoginCall) onUnauthorized?.();
    return Promise.reject(error);
  },
);
