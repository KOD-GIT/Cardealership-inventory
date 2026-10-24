import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, registerRequest } from "../api/auth";
import { session, setUnauthorizedHandler } from "../api/client";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Creates the account, then signs in so the person lands straight on the dashboard. */
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => (session.getToken() ? session.getUser() : null));

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user: loggedIn } = await loginRequest(email, password);
    session.save(access_token, loggedIn);
    setUser(loggedIn);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await registerRequest(email, password);
      await login(email, password);
    },
    [login],
  );

  // An expired/invalid token anywhere in the app signs the user out; route guards then redirect.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo<AuthState>(
    () => ({ user, isAdmin: user?.role === "ADMIN", login, register, logout }),
    [user, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
