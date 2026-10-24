import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import App from "../App";
import { customer, makeVehicle, sampleVehicles } from "../test/fixtures";
import { API, server } from "../test/server";
import { renderWithProviders } from "../test/utils";

const open = () => renderWithProviders(<App />, { route: "/", signedInAs: customer });

describe("Dashboard", () => {
  it("shows skeletons while loading, then the vehicles and a count", async () => {
    open();
    expect(screen.getByLabelText("Loading vehicles")).toBeInTheDocument();
    expect(await screen.findByRole("article", { name: "Toyota Camry" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Honda Civic" })).toBeInTheDocument();
    expect(screen.getByText("3 vehicles")).toBeInTheDocument();
    expect(screen.queryByLabelText("Loading vehicles")).not.toBeInTheDocument();
  });

  it("disables Purchase only on the car with zero stock", async () => {
    open();
    await screen.findByRole("article", { name: "Ford F-150" });
    expect(screen.getByRole("button", { name: "Ford F-150 is unavailable" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Purchase Toyota Camry" })).toBeEnabled();
  });

  it("purchases a vehicle, confirms with a toast and refreshes the stock", async () => {
    let quantity = 4;
    server.use(
      http.get(`${API}/api/vehicles`, () => HttpResponse.json([makeVehicle({ quantity })])),
      http.post(`${API}/api/vehicles/1/purchase`, () => { quantity -= 1; return HttpResponse.json(makeVehicle({ quantity })); }),
    );
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Purchase Toyota Camry" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Toyota Camry purchased");
    expect(await screen.findByText("3 in stock")).toBeInTheDocument();
  });

  it("explains a sold-out race (409) in an alert toast", async () => {
    server.use(http.post(`${API}/api/vehicles/1/purchase`, () => HttpResponse.json({ detail: "Out of stock" }, { status: 409 })));
    const { user } = open();
    await user.click(await screen.findByRole("button", { name: "Purchase Toyota Camry" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("That car just sold out");
    expect(alert).toHaveTextContent("Another customer bought the last one.");
  });

  it("searches through /api/vehicles/search with the chosen filters", async () => {
    let seen: URLSearchParams | undefined;
    server.use(http.get(`${API}/api/vehicles/search`, ({ request }) => {
      seen = new URL(request.url).searchParams;
      return HttpResponse.json([sampleVehicles[0]]);
    }));
    const { user } = open();
    await screen.findByRole("article", { name: "Honda Civic" });
    await user.type(screen.getByLabelText("Make"), "Toyota");
    await user.selectOptions(screen.getByLabelText("Category"), "SEDAN");
    await user.type(screen.getByLabelText("Max price"), "30000");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("1 vehicle")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Honda Civic" })).not.toBeInTheDocument();
    expect(Object.fromEntries(seen!)).toEqual({ make: "Toyota", category: "SEDAN", max_price: "30000" });
  });

  it("shows an empty state with a reset that restores the full list", async () => {
    server.use(http.get(`${API}/api/vehicles/search`, () => HttpResponse.json([])));
    const { user } = open();
    await screen.findByRole("article", { name: "Honda Civic" });
    await user.type(screen.getByLabelText("Make"), "Zzz");
    await user.click(screen.getByRole("button", { name: "Search" }));
    const heading = await screen.findByRole("heading", { name: "No vehicles match your search" });

    // the filter bar has a reset too; use the one inside the empty state
    await user.click(within(heading.parentElement as HTMLElement).getByRole("button", { name: "Reset filters" }));
    expect(await screen.findByRole("article", { name: "Honda Civic" })).toBeInTheDocument();
  });

  it("shows an error banner and retries", async () => {
    let fail = true;
    server.use(http.get(`${API}/api/vehicles`, () => (fail ? HttpResponse.json({ detail: "Database unavailable" }, { status: 500 }) : HttpResponse.json(sampleVehicles))));
    const { user } = open();
    const banner = await screen.findByRole("alert");
    expect(within(banner).getByText("Couldn’t load vehicles")).toBeInTheDocument();
    fail = false;
    await user.click(within(banner).getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("article", { name: "Toyota Camry" })).toBeInTheDocument();
  });
});
