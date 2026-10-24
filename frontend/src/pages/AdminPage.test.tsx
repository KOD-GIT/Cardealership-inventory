import { screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import App from "../App";
import { admin, makeVehicle, sampleVehicles } from "../test/fixtures";
import { API, server } from "../test/server";
import { renderWithProviders } from "../test/utils";

const open = () => renderWithProviders(<App />, { route: "/admin", signedInAs: admin });
// Wide screens get a table (jsdom has no matchMedia, so tests use the wide layout by default).
const tableRow = (name: string) => screen.getByRole("row", { name: new RegExp(name) });

describe("Admin page", () => {
  it("shows totals derived from the list and one row per vehicle", async () => {
    open();
    await screen.findByRole("heading", { name: "Manage inventory" });
    const stats = await screen.findByText("Units in stock");
    expect(stats.nextElementSibling).toHaveTextContent("5"); // 4 + 1 + 0
    expect(screen.getByText("Out of stock", { selector: "dt" }).nextElementSibling).toHaveTextContent("1");
    expect(tableRow("Toyota")).toBeInTheDocument();
    expect(within(tableRow("Honda")).getByText("Only 1 left")).toBeInTheDocument();
    expect(within(tableRow("Ford")).getByText("$41,250.50")).toBeInTheDocument();
  });

  it("gives every icon button an accessible name", async () => {
    open();
    const row = await waitFor(() => tableRow("Toyota"));
    expect(within(row).getByRole("button", { name: "Restock Toyota Camry" })).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Edit Toyota Camry" })).toBeInTheDocument();
    expect(within(row).getByRole("button", { name: "Delete Toyota Camry" })).toBeInTheDocument();
  });

  it("filters the list by text, category and stock level without calling the API", async () => {
    const { user } = open();
    await waitFor(() => tableRow("Toyota"));
    await user.type(screen.getByLabelText("Search make or model"), "civ");
    expect(screen.queryByRole("row", { name: /Toyota/ })).not.toBeInTheDocument();
    expect(tableRow("Honda")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);

    await user.selectOptions(screen.getByLabelText("Stock"), "out");
    expect(tableRow("Ford")).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /Honda/ })).not.toBeInTheDocument();
  });

  it("adds a vehicle: validates, posts the right body, confirms and refreshes", async () => {
    let created: unknown;
    let list = [...sampleVehicles];
    server.use(
      http.get(`${API}/api/vehicles`, () => HttpResponse.json(list)),
      http.post(`${API}/api/vehicles`, async ({ request }) => {
        created = await request.json();
        const vehicle = makeVehicle({ id: 9, ...(created as object) });
        list = [...list, vehicle];
        return HttpResponse.json(vehicle, { status: 201 });
      }),
    );
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Add vehicle" }));
    const dialog = screen.getByRole("dialog", { name: "Add vehicle" });

    // validation first: price 0 is rejected with the message from the design
    await user.type(within(dialog).getByLabelText("Make"), "Mazda");
    await user.type(within(dialog).getByLabelText("Model"), "MX-5");
    await user.type(within(dialog).getByLabelText("Price"), "0");
    await user.type(within(dialog).getByLabelText("Quantity in stock"), "3");
    await user.click(within(dialog).getByRole("button", { name: "Save vehicle" }));
    expect(await within(dialog).findByText("Price must be greater than 0")).toBeInTheDocument();
    expect(created).toBeUndefined();

    await user.clear(within(dialog).getByLabelText("Price"));
    await user.type(within(dialog).getByLabelText("Price"), "31990.50");
    await user.selectOptions(within(dialog).getByLabelText("Category"), "CONVERTIBLE");
    await user.click(within(dialog).getByRole("button", { name: "Save vehicle" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(created).toEqual({ make: "Mazda", model: "MX-5", category: "CONVERTIBLE", price: 31990.5, quantity: 3, year: null, image_url: null });
    expect(await screen.findByText("Vehicle added")).toBeInTheDocument();
    expect(await waitFor(() => tableRow("Mazda"))).toBeInTheDocument();
  });

  it("edits a vehicle with the current values pre-filled", async () => {
    let body: Record<string, unknown> | undefined;
    server.use(http.put(`${API}/api/vehicles/1`, async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(makeVehicle(body));
    }));
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Edit Toyota Camry" }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    expect(within(dialog).getByLabelText("Make")).toHaveValue("Toyota");
    expect(within(dialog).getByLabelText("Price")).toHaveValue(27999.99);
    await user.clear(within(dialog).getByLabelText("Price"));
    await user.type(within(dialog).getByLabelText("Price"), "26999");
    await user.click(within(dialog).getByRole("button", { name: "Save vehicle" }));
    await waitFor(() => expect(body?.price).toBe(26999));
    expect(await screen.findByText("Vehicle updated")).toBeInTheDocument();
  });

  it("restocks: shows the new total and posts the quantity", async () => {
    let body: unknown;
    server.use(http.post(`${API}/api/vehicles/3/restock`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(makeVehicle({ id: 3, make: "Ford", model: "F-150", quantity: 8 }));
    }));
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Restock Ford F-150" }));
    const dialog = screen.getByRole("dialog", { name: "Restock Ford F-150" });
    expect(within(dialog).getByText("5 units")).toBeInTheDocument(); // 0 + default 5
    await user.click(within(dialog).getByRole("button", { name: "Increase units" }));
    await user.click(within(dialog).getByRole("button", { name: "Increase units" }));
    await user.click(within(dialog).getByRole("button", { name: "Increase units" }));
    expect(within(dialog).getByText("8 units")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Restock" }));
    await waitFor(() => expect(body).toEqual({ quantity: 8 }));
    expect(await screen.findByText("Restocked Ford F-150")).toBeInTheDocument();
  });

  it("refuses to restock with an invalid number", async () => {
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Restock Toyota Camry" }));
    const dialog = screen.getByRole("dialog");
    await user.clear(within(dialog).getByLabelText("Units to add"));
    await user.type(within(dialog).getByLabelText("Units to add"), "0");
    expect(within(dialog).getByRole("button", { name: "Restock" })).toBeDisabled();
    expect(within(dialog).getByRole("alert")).toHaveTextContent("Enter a whole number, 1 or more.");
  });

  it("asks before deleting, defaults to Cancel, and deletes on confirm", async () => {
    let deleted = false;
    server.use(http.delete(`${API}/api/vehicles/2`, () => { deleted = true; return new HttpResponse(null, { status: 204 }); }));
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Delete Honda Civic" }));
    const dialog = screen.getByRole("dialog", { name: "Delete Honda Civic?" });
    expect(within(dialog).getByText("This cannot be undone. Purchase history is kept.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus(); // safe default
    expect(deleted).toBe(false);
    await user.click(within(dialog).getByRole("button", { name: "Delete vehicle" }));
    await waitFor(() => expect(deleted).toBe(true));
    expect(await screen.findByText("Vehicle deleted")).toBeInTheDocument();
  });

  it("shows the server's message when an admin action is refused (403)", async () => {
    server.use(http.delete(`${API}/api/vehicles/2`, () => HttpResponse.json({ detail: "Admin only" }, { status: 403 })));
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Delete Honda Civic" }));
    await user.click(screen.getByRole("button", { name: "Delete vehicle" }));
    expect(await within(screen.getByRole("dialog")).findByRole("alert")).toHaveTextContent("Admin only");
  });

  it("invites the first vehicle when the inventory is empty", async () => {
    server.use(http.get(`${API}/api/vehicles`, () => HttpResponse.json([])));
    open();
    expect(await screen.findByRole("heading", { name: "No vehicles yet" })).toBeInTheDocument();
  });
});

describe("Admin page on a phone", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("switches to stacked cards that keep the same actions", async () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, media: query, addEventListener: () => {}, removeEventListener: () => {},
    }));
    open();
    await screen.findByRole("heading", { name: "Manage inventory" });
    expect(await screen.findByRole("button", { name: "Delete Honda Civic" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
