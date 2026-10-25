import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { session } from "../api/client";
import { mockInventoryApi } from "../test/api";
import { admin, customer } from "../test/fixtures";
import { API, server } from "../test/server";
import { renderApp } from "../test/utils";

const homeHeading = () => screen.findByRole("heading", { level: 1, name: "Stock, Not Theatre." });
const loginOk = (user = customer) => http.post(`${API}/api/auth/login`, () => HttpResponse.json({ access_token: "jwt-123", token_type: "bearer", user }));

describe("Login", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("signs in, stores the session and lands on the home page", async () => {
    server.use(http.post(`${API}/api/auth/login`, async ({ request }) => {
      expect(await request.json()).toEqual({ email: "jane@example.com", password: "Str0ngPass!" });
      return HttpResponse.json({ access_token: "jwt-123", token_type: "bearer", user: customer });
    }));
    const { user } = renderApp("/login");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await homeHeading()).toBeInTheDocument();
    expect(session.getToken()).toBe("jwt-123");
    expect(screen.getAllByText("jane@example.com").length).toBeGreaterThan(0);
  });

  it("returns you to the vehicle you were heading for after signing in", async () => {
    server.use(loginOk());
    const { user } = renderApp("/vehicle/5");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" })).toBeInTheDocument();
  });

  it("returns you to your Floor search, query string included", async () => {
    server.use(loginOk());
    const { user } = renderApp("/floor?cat=SUV&sort=price-asc");
    await user.type(await screen.findByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("button", { name: "Remove filter: Category: SUV" })).toBeInTheDocument();
  });

  it("shows one clear message for a wrong email or password (401)", async () => {
    server.use(http.post(`${API}/api/auth/login`, () => HttpResponse.json({ detail: "Invalid credentials" }, { status: 401 })));
    const { user } = renderApp("/login");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email or password is incorrect.");
    expect(session.getToken()).toBeNull();
  });

  it("validates before calling the API", async () => {
    const { user } = renderApp("/login");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
  });

  it("has visible labels and no role switch: the account decides whether someone is an admin", () => {
    renderApp("/login");
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Password")).toBeVisible();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/role|admin/i)).not.toBeInTheDocument();
  });

  it("can reveal and hide the password", async () => {
    const { user } = renderApp("/login");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");
  });

  it("disables the button and shows progress while signing in (no double submit)", async () => {
    let calls = 0;
    server.use(http.post(`${API}/api/auth/login`, async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 150));
      return HttpResponse.json({ access_token: "jwt", token_type: "bearer", user: customer });
    }));
    const { user } = renderApp("/login");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Str0ngPass!");
    await user.dblClick(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDisabled();
    await homeHeading();
    expect(calls).toBe(1);
  });
});

describe("Register", () => {
  beforeEach(() => { mockInventoryApi(); });
  const fillRegister = async (user: ReturnType<typeof renderApp>["user"], password = "Str0ngPass!", confirm = password) => {
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), password);
    await user.type(screen.getByLabelText("Confirm password"), confirm);
    await user.click(screen.getByRole("button", { name: "Create account" }));
  };

  it("creates the account, signs in and opens the home page", async () => {
    server.use(
      http.post(`${API}/api/auth/register`, () => HttpResponse.json(customer, { status: 201 })),
      loginOk(),
    );
    const { user } = renderApp("/register");
    await fillRegister(user);
    expect(await homeHeading()).toBeInTheDocument();
    expect(session.getToken()).toBe("jwt-123");
  });

  it("never lets anyone choose to be an administrator: only email and passwords are sent", async () => {
    let sent: unknown;
    server.use(
      http.post(`${API}/api/auth/register`, async ({ request }) => { sent = await request.json(); return HttpResponse.json(customer, { status: 201 }); }),
      loginOk(),
    );
    const { user } = renderApp("/register");
    expect(screen.queryByLabelText(/role|admin/i)).not.toBeInTheDocument();
    await fillRegister(user);
    await homeHeading();
    expect(sent).toEqual({ email: "jane@example.com", password: "Str0ngPass!" });
  });

  it("enforces the API's rules: 8+ characters and at most 72 bytes", async () => {
    const { user } = renderApp("/register");
    await fillRegister(user, "short");
    expect(await screen.findByText("Use at least 8 characters")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "é".repeat(40)); // 80 bytes
    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(await screen.findByText("Use at most 72 bytes")).toBeInTheDocument();
  });

  it("catches mismatched passwords", async () => {
    const { user } = renderApp("/register");
    await fillRegister(user, "Str0ngPass!", "Different1!");
    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument();
  });

  it("shows the API's duplicate-email (409) error on the email field", async () => {
    server.use(http.post(`${API}/api/auth/register`, () => HttpResponse.json({ detail: "Email already registered" }, { status: 409 })));
    const { user } = renderApp("/register");
    await fillRegister(user);
    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Route guards and navigation", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("sends signed-out visitors from the Floor to sign in", async () => {
    renderApp("/floor");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("lets a signed-out visitor see the home page, with a clear way in", async () => {
    renderApp("/");
    expect(await homeHeading()).toBeInTheDocument();
    expect(screen.getByText("The floor is for signed-in visitors")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Sign in" }).length).toBeGreaterThan(0);
  });

  it("keeps ordinary users out of the ledger and hides its link", async () => {
    renderApp("/ledger", { signedInAs: customer });
    expect(await homeHeading()).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "The Ledger" })).not.toBeInTheDocument();
  });

  it("lets administrators in and shows the Ledger link", async () => {
    renderApp("/ledger", { signedInAs: admin });
    expect(await screen.findByRole("heading", { level: 1, name: "The Ledger" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "The Ledger" }).length).toBeGreaterThan(0);
  });

  it("sends a signed-in user away from the login page", async () => {
    renderApp("/login", { signedInAs: customer });
    expect(await homeHeading()).toBeInTheDocument();
  });

  it("logs out: from a protected page you land on Sign in, and the session is gone", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    await waitFor(() => expect(session.getToken()).toBeNull());
  });

  it("logging out of the public home page leaves you there, now as a visitor", async () => {
    const { user } = renderApp("/", { signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: "Log out" }));
    expect(await screen.findByText("The floor is for signed-in visitors")).toBeInTheDocument();
  });

  it("signs the user out when the API rejects the token (401)", async () => {
    server.use(http.get(`${API}/api/vehicles`, () => HttpResponse.json({ detail: "Not authenticated" }, { status: 401 })));
    renderApp("/floor", { signedInAs: customer });
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows a useful 404 page with a way back", async () => {
    renderApp("/nope");
    expect(await screen.findByRole("heading", { level: 1, name: /Off the map/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enter the floor" })).toBeInTheDocument();
  });

  it("marks the current page in the navigation", async () => {
    renderApp("/floor", { signedInAs: customer });
    const nav = await screen.findByRole("navigation", { name: "Main" });
    expect(nav.querySelector("[aria-current='page']")).toHaveTextContent("The Floor");
  });
});
