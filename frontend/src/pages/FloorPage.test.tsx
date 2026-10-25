import { screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { mockInventoryApi } from "../test/api";
import { customer, manyVehicles } from "../test/fixtures";
import { API, server } from "../test/server";
import { renderApp } from "../test/utils";

const cells = () => screen.getAllByRole("article").map((cell) => cell.getAttribute("aria-label"));

describe("The Floor", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("shows every vehicle as a cell with stock reference, category, price and availability", async () => {
    renderApp("/floor", { signedInAs: customer });
    const swift = await screen.findByRole("article", { name: "Maruti Suzuki Swift ZXi" });
    expect(within(swift).getByText("STOCK 0001")).toBeInTheDocument();
    expect(within(swift).getByText("Hatchback")).toBeInTheDocument();
    expect(within(swift).getByText("₹8,15,000")).toBeInTheDocument();
    expect(within(swift).getByText("6 in stock")).toBeInTheDocument();
    expect(cells()).toHaveLength(6);
  });

  it("formats big prices with Indian digit grouping", async () => {
    renderApp("/floor", { signedInAs: customer });
    const audi = await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    expect(within(audi).getByText("₹2,40,00,000")).toBeInTheDocument();
  });

  it("lists the newest arrival first by default (arrival time, not model year)", async () => {
    renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    expect(cells().slice(0, 3)).toEqual(["Audi R8 Coupé V10", "BMW 330Li M Sport", "Mahindra Thar LX"]);
  });

  it("searches make and model, shows a removable chip and an accurate count", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    await user.type(screen.getByLabelText("Search make or model"), "bmw");
    expect(cells()).toEqual(["BMW 330Li M Sport"]);
    expect(screen.getByRole("status")).toHaveTextContent("1 vehicle of 6");
    await user.click(screen.getByRole("button", { name: "Remove filter: Search: bmw" }));
    expect(cells()).toHaveLength(6);
  });

  it("filters by category tab, with counts", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    expect(screen.getByRole("button", { name: "[ All (6) ]" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "[ SUV (3) ]" }));
    expect(cells().sort()).toEqual(["Hyundai Creta SX", "Mahindra Thar LX", "Toyota Fortuner 4x4"]);
  });

  it("filters by an inclusive price range and explains an invalid amount", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    await user.type(screen.getByLabelText("Min price (₹)"), "8,15,000");
    await user.type(screen.getByLabelText("Max price (₹)"), "16,20,000");
    expect(cells().sort()).toEqual(["Hyundai Creta SX", "Maruti Suzuki Swift ZXi"]);
    await user.clear(screen.getByLabelText("Min price (₹)"));
    await user.type(screen.getByLabelText("Min price (₹)"), "abc");
    expect(await screen.findByText(/Enter a number such as/)).toBeInTheDocument();
  });

  it("warns when the minimum is above the maximum", async () => {
    const { user } = renderApp("/floor?min=5000000&max=1000000", { signedInAs: customer });
    expect(await screen.findByText("Minimum is above maximum")).toBeInTheDocument();
    expect(user).toBeDefined();
  });

  it("can show only vehicles in stock", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    await user.click(screen.getByRole("button", { name: "In stock only" }));
    expect(cells()).not.toContain("Mahindra Thar LX");
    expect(cells()).toHaveLength(5);
  });

  it("sorts by price, high to low", async () => {
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Audi R8 Coupé V10" });
    await user.selectOptions(screen.getByLabelText("Sort by"), "price-desc");
    expect(cells()[0]).toBe("Audi R8 Coupé V10");
    await user.selectOptions(screen.getByLabelText("Sort by"), "price-asc");
    expect(cells()[0]).toBe("Maruti Suzuki Swift ZXi");
  });

  it("restores filters, sort and page from the URL (back button, refresh, shared link)", async () => {
    renderApp("/floor?cat=SUV&sort=price-asc", { signedInAs: customer });
    await screen.findByRole("article", { name: "Hyundai Creta SX" });
    expect(cells()).toEqual(["Hyundai Creta SX", "Mahindra Thar LX", "Toyota Fortuner 4x4"]);
    expect(screen.getByRole("button", { name: "Remove filter: Category: SUV" })).toBeInTheDocument();
  });

  it("clears every filter at once and explains an empty result", async () => {
    const { user } = renderApp("/floor?q=ferrari", { signedInAs: customer });
    expect(await screen.findByText("No vehicle matches")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Clear filters" })[0]);
    expect(await screen.findAllByRole("article")).toHaveLength(6);
  });

  it("keeps an out-of-stock vehicle inspectable but not purchasable or addable", async () => {
    renderApp("/floor", { signedInAs: customer });
    const thar = await screen.findByRole("article", { name: "Mahindra Thar LX" });
    expect(within(thar).getByText("Out of stock")).toBeInTheDocument();
    expect(within(thar).getByRole("link", { name: "View manifest" })).toBeEnabled();
    expect(within(thar).getByRole("button", { name: "Mahindra Thar LX is out of stock" })).toBeDisabled();
    expect(within(thar).getByRole("button", { name: /cannot be added: out of stock/ })).toBeDisabled();
  });

  it("marks low stock in words (threshold of two units)", async () => {
    renderApp("/floor", { signedInAs: customer });
    const fortuner = await screen.findByRole("article", { name: "Toyota Fortuner 4x4" });
    expect(within(fortuner).getByText("Only 1 left")).toBeInTheDocument();
    expect(within(await screen.findByRole("article", { name: "BMW 330Li M Sport" })).getByText("Only 2 left")).toBeInTheDocument();
  });

  it("shows an error with a retry when the vehicles cannot be loaded", async () => {
    server.use(http.get(`${API}/api/vehicles`, () => HttpResponse.json({ detail: "boom" }, { status: 500 })));
    renderApp("/floor", { signedInAs: customer });
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be loaded");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});

describe("The Floor, pagination", () => {
  beforeEach(() => { mockInventoryApi(manyVehicles(14)); });

  it("shows ten per page with an accurate range and moves between pages", async () => {
    const { user } = renderApp("/floor?sort=name", { signedInAs: customer });
    await screen.findAllByRole("article");
    expect(cells()).toHaveLength(10);
    expect(screen.getByText("Showing 1–10 of 14")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Page 2" }));
    expect(cells()).toHaveLength(4);
    expect(screen.getByText("Showing 11–14 of 14")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  });

  it("filters the WHOLE collection before paging, so no page is half empty", async () => {
    const { user } = renderApp("/floor?sort=name", { signedInAs: customer });
    await screen.findAllByRole("article");
    await user.type(screen.getByLabelText("Search make or model"), "model 1");
    expect(cells()).toHaveLength(5); // Model 10 to 14, found on what would have been page 2
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument();
  });

  it("goes back to page one when the filters change", async () => {
    const { user } = renderApp("/floor?sort=name&page=2", { signedInAs: customer });
    await screen.findAllByRole("article");
    expect(cells()).toHaveLength(4);
    await user.click(screen.getByRole("button", { name: "In stock only" }));
    expect(screen.getByText("Showing 1–10 of 14")).toBeInTheDocument();
  });
});
