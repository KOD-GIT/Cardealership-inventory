import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { session } from "../api/client";
import App from "../App";
import { NotificationProvider } from "../components/ui/Notifications";
import { AuthProvider } from "../context/AuthContext";
import type { User } from "../types";

interface Options {
  route?: string;
  /** Start signed in as this user (stores a token the same way a real login does). */
  signedInAs?: User;
}

/** Renders with every provider the real app has (query cache, router, auth, notifications). */
export function renderWithProviders(ui: ReactElement, { route = "/", signedInAs }: Options = {}) {
  if (signedInAs) session.save("test-token", signedInAs);
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const user = userEvent.setup();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <NotificationProvider>{ui}</NotificationProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { user, queryClient, ...utils };
}

/** The whole application at a route: the quickest way to test a real user journey. */
export const renderApp = (route = "/", options: Omit<Options, "route"> = {}) =>
  renderWithProviders(<App />, { route, ...options });
