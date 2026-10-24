import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { session } from "../api/client";
import App from "../App";
import { admin, customer } from "../test/fixtures";
import { API, server } from "../test/server";
import { renderWithProviders } from "../test/utils";

describe("Login", () => {
  it("signs in, stores the session and lands on the dashboard", async () => {
    server.use(http.post(`${API}/api/auth/login`, async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      expect(body).toEqual({ email: "jane@example.com", password: "Str0ngPass!" });
      return HttpResponse.json({ access_token: "jwt-123", token_type: "bearer", user: customer });
    }));
    const { user } = renderWithProviders(<App />, { route: "/login" });

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("heading", { name: "Available vehicles" })).toBeInTheDocument();
    expect(session.getToken()).toBe("jwt-123");
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("shows one clear message for a wrong email or password (401)", async () => {
    server.use(http.post(`${API}/api/auth/login`, () => HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })));
    const { user } = renderWithProviders(<App />, { route: "/login" });
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(session.getToken()).toBeNull();
  });

  it("validates before calling the API", async () => {
    const { user } = renderWithProviders(<App />, { route: "/login" });
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
  });

  it("has no role switch: the account decides whether someone is an admin", () => {
    renderWithProviders(<App />, { route: "/login" });
    expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
  });

  it("can reveal the password", async () => {
    const { user } = renderWithProviders(<App />, { route: "/login" });
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
  });
});

describe("Register", () => {
  it("creates the account, signs in and opens the dashboard", async () => {
    server.use(
      http.post(`${API}/api/auth/register`, () => HttpResponse.json(customer, { status: 201 })),
      http.post(`${API}/api/auth/login`, () => HttpResponse.json({ access_token: "jwt-new", token_type: "bearer", user: customer })),
    );
    const { user } = renderWithProviders(<App />, { route: "/register" });
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.type(screen.getByLabelText("Confirm password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByRole("heading", { name: "Available vehicles" })).toBeInTheDocument();
    expect(session.getToken()).toBe("jwt-new");
  });

  it("only asks for what the API requires: 8+ characters", async () => {
    const { user } = renderWithProviders(<App />, { route: "/register" });
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.type(screen.getByLabelText("Confirm password"), "short");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Use at least 8 characters")).toBeInTheDocument();
  });

  it("catches mismatched passwords", async () => {
    const { user } = renderWithProviders(<App />, { route: "/register" });
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.type(screen.getByLabelText("Confirm password"), "Different1!");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
  });

  it("shows the API's duplicate-email (409) error on the email field", async () => {
    server.use(http.post(`${API}/api/auth/register`, () => HttpResponse.json({ detail: "Email already registered" }, { status: 409 })));
    const { user } = renderWithProviders(<App />, { route: "/register" });
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.type(screen.getByLabelText("Confirm password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Route guards", () => {
  it("sends signed-out visitors to the login page", async () => {
    renderWithProviders(<App />, { route: "/" });
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("keeps ordinary users out of the admin page", async () => {
    renderWithProviders(<App />, { route: "/admin", signedInAs: customer });
    expect(await screen.findByRole("heading", { name: "Available vehicles" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Manage inventory" })).not.toBeInTheDocument();
  });

  it("lets admins in and shows the admin link", async () => {
    renderWithProviders(<App />, { route: "/admin", signedInAs: admin });
    expect(await screen.findByRole("heading", { name: "Manage inventory" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage inventory" })).toBeInTheDocument();
  });

  it("sends a signed-in user away from the login page", async () => {
    renderWithProviders(<App />, { route: "/login", signedInAs: customer });
    expect(await screen.findByRole("heading", { name: "Available vehicles" })).toBeInTheDocument();
  });

  it("logs out and returns to the login page", async () => {
    const { user } = renderWithProviders(<App />, { route: "/", signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await waitFor(() => expect(session.getToken()).toBeNull());
  });

  it("signs the user out when the API rejects the token (401)", async () => {
    server.use(http.get(`${API}/api/vehicles`, () => HttpResponse.json({ detail: "Token expired" }, { status: 401 })));
    renderWithProviders(<App />, { route: "/", signedInAs: customer });
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows a friendly 404 page", async () => {
    renderWithProviders(<App />, { route: "/nope" });
    expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument();
  });
});
