import { screen, waitFor, within } from "@testing-library/react";
import { mockInventoryApi } from "../test/api";
import { customer } from "../test/fixtures";
import { renderApp } from "../test/utils";

const SWIFT = "Maruti Suzuki Swift ZXi";
const CRETA = "Hyundai Creta SX";
const FORTUNER = "Toyota Fortuner 4x4";

const cart = () => screen.getByRole("button", { name: /^Open cart/ });

describe("Cart", () => {
  it("adds a vehicle, updates the badge, and does NOT touch the stock", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    expect(cart()).toHaveAccessibleName("Open cart, 1 unit");
    expect(cart()).toHaveTextContent("[ Cart : 1 ]");
    expect(api.vehicles.find((v) => v.id === 1)?.quantity).toBe(6); // nothing reserved or reduced
    expect(api.calls.purchase).toEqual([]);
  });

  it("repeated additions update the same line, up to the stock", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: FORTUNER });
    const add = screen.getByRole("button", { name: `Add ${FORTUNER} to cart` });
    await user.click(add);
    await user.click(add); // only 1 in stock
    expect(cart()).toHaveTextContent("[ Cart : 1 ]");
    expect(await screen.findByText("Only 1 in stock, so your cart holds 1.")).toBeInTheDocument();
  });

  it("keeps the cart across a page reload (saved on this device, per person)", async () => {
    mockInventoryApi();
    const first = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await first.user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    first.unmount();
    renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    expect(cart()).toHaveTextContent("[ Cart : 1 ]");
  });

  it("opens as a drawer with the lines and a correct subtotal", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    await user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await user.click(cart());
    const drawer = screen.getByRole("dialog", { name: "Cart [ 2 ]" });
    expect(within(drawer).getByText(SWIFT)).toBeInTheDocument();
    expect(within(drawer).getByText(CRETA)).toBeInTheDocument();
    expect(within(drawer).getByText("₹24,35,000")).toBeInTheDocument(); // 8,15,000 + 16,20,000
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /^Cart/ })).not.toBeInTheDocument();
  });

  it("shows a friendly empty state", async () => {
    mockInventoryApi();
    renderApp("/cart", { signedInAs: customer });
    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continue browsing" })).toHaveAttribute("href", "/floor");
  });

  it("limits quantity to the stock: the increase button disables at the maximum", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "BMW 330Li M Sport" }); // 2 in stock
    await user.click(screen.getByRole("button", { name: "Add BMW 330Li M Sport to cart" }));
    await user.click(cart());
    const drawer = screen.getByRole("dialog", { name: /^Cart/ });
    await user.click(within(drawer).getByRole("button", { name: "Increase quantity of BMW 330Li M Sport" }));
    expect(within(drawer).getByRole("button", { name: "Increase quantity of BMW 330Li M Sport" })).toBeDisabled();
    expect(within(drawer).getByText("₹1,24,00,000")).toBeInTheDocument(); // 2 x 62,00,000, exact
    expect(within(drawer).getByText("Maximum available")).toBeInTheDocument();
  });
});

describe("Cart page", () => {
  const fill = async () => {
    const view = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await view.user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    await view.user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    await view.user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await view.user.click(cart());
    await view.user.click(screen.getByRole("link", { name: "Review purchase" }));
    return view;
  };

  it("adjusts quantities within stock and totals them exactly", async () => {
    mockInventoryApi();
    const { user } = await fill();
    await screen.findByRole("heading", { name: "Your cart" });
    const swiftLine = screen.getByRole("link", { name: SWIFT }).closest("li") as HTMLElement;
    expect(within(swiftLine).getByText("₹16,30,000")).toBeInTheDocument(); // 2 x 8,15,000
    await user.click(within(swiftLine).getByRole("button", { name: `Decrease quantity of ${SWIFT}` }));
    expect(within(swiftLine).getByText("₹8,15,000", { selector: "p" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Order summary")).getByText("₹24,35,000")).toBeInTheDocument();
  });

  it("removes a line with an Undo that restores it where it was", async () => {
    mockInventoryApi();
    const { user } = await fill();
    await screen.findByRole("heading", { name: "Your cart" });
    await user.click(screen.getByRole("button", { name: `Remove ${SWIFT} from cart` }));
    expect(screen.queryByRole("link", { name: SWIFT })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    const lines = within(screen.getByRole("list", { name: "Cart lines" })).getAllByRole("listitem");
    expect(within(lines[0]).getByText(SWIFT)).toBeInTheDocument(); // back in the first position
    expect(within(lines[0]).getByText("2", { selector: "output" })).toBeInTheDocument(); // with its old quantity
  });

  it("will not restore a removed line over one that was added again", async () => {
    mockInventoryApi();
    const { user } = await fill();
    await screen.findByRole("heading", { name: "Your cart" });
    await user.click(screen.getByRole("button", { name: `Remove ${CRETA} from cart` }));
    await user.click(screen.getByRole("link", { name: "Continue browsing" }));
    await screen.findByRole("article", { name: CRETA });
    await user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByText("Already in your cart")).toBeInTheDocument();
    expect(cart()).toHaveTextContent("[ Cart : 3 ]"); // 2 Swift + 1 Creta, not 4
  });
});

describe("Purchasing", () => {
  it("cart purchase: confirms, reduces the stock, records history and empties the cart", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    await user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await user.click(cart());
    await user.click(screen.getByRole("link", { name: "Review purchase" }));
    await user.click(await screen.findByRole("button", { name: "Review purchase" }));
    const dialog = screen.getByRole("dialog", { name: "Review purchase" });
    expect(within(dialog).getByText(/No payment details are collected/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Confirm purchase of 2 units" }));

    expect(await screen.findByRole("dialog", { name: "Purchase complete" })).toBeInTheDocument();
    expect(api.calls.purchase).toEqual([{ id: 1, quantity: 1 }, { id: 2, quantity: 1 }]);
    expect(api.vehicles.find((v) => v.id === 1)?.quantity).toBe(5);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(cart()).toHaveTextContent("[ Cart : 0 ]");

    await user.click(screen.getByRole("link", { name: "Purchases" }));
    const history = await screen.findByRole("list");
    expect(within(history).getByText(/IGN-/)).toBeInTheDocument();
    expect(within(history).getByText("₹24,35,000")).toBeInTheDocument();
  });

  it("'Purchase now' buys exactly one unit and leaves the cart alone", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await user.click(screen.getByRole("button", { name: `Purchase ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Purchase now" });
    await user.click(within(dialog).getByRole("button", { name: "Confirm purchase of 1 unit" }));
    expect(await screen.findByRole("dialog", { name: "Purchase complete" })).toBeInTheDocument();
    expect(api.calls.purchase).toEqual([{ id: 1, quantity: 1 }]);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(cart()).toHaveTextContent("[ Cart : 1 ]"); // the Creta is still waiting in the cart
    expect(await screen.findByText("5 in stock")).toBeInTheDocument(); // the floor shows the new stock
  });

  it("buys nothing and keeps the cart when the stock changed in the meantime", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    api.vehicles.find((v) => v.id === 1)!.quantity = 0; // someone else bought the last ones
    await user.click(screen.getByRole("button", { name: `Purchase ${SWIFT}` }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /Confirm purchase/ }));
    const dialog = await screen.findByRole("dialog", { name: "Stock has changed" });
    expect(within(dialog).getByText("Out of stock.")).toBeInTheDocument();
    expect(within(dialog).getByText(/Nothing was purchased and your cart is unchanged/)).toBeInTheDocument();
    expect(api.calls.purchase).toEqual([]);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(cart()).toHaveTextContent("[ Cart : 1 ]");
  });

  it("reports a partial failure honestly: bought lines leave the cart, failed lines stay", async () => {
    const api = mockInventoryApi();
    api.failPurchaseFor.add(2); // the Creta purchase will be refused by the server
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Add ${SWIFT} to cart` }));
    await user.click(screen.getByRole("button", { name: `Add ${CRETA} to cart` }));
    await user.click(cart());
    await user.click(screen.getByRole("link", { name: "Review purchase" }));
    await user.click(await screen.findByRole("button", { name: "Review purchase" }));
    await user.click(screen.getByRole("button", { name: "Confirm purchase of 2 units" }));

    const dialog = await screen.findByRole("dialog", { name: "Purchase partly completed" });
    expect(within(within(dialog).getByLabelText("Purchased")).getByText(SWIFT)).toBeInTheDocument();
    expect(within(within(dialog).getByLabelText("Not purchased")).getByText(CRETA)).toBeInTheDocument();
    expect(within(dialog).getByText(/not one transaction/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(cart()).toHaveTextContent("[ Cart : 1 ]"); // only the failed Creta remains
  });

  it("cannot be submitted twice, even by a fast double click", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Purchase ${SWIFT}` }));
    await user.dblClick(within(screen.getByRole("dialog")).getByRole("button", { name: "Confirm purchase of 1 unit" }));
    await screen.findByRole("dialog", { name: "Purchase complete" });
    expect(api.calls.purchase).toHaveLength(1);
    expect(api.vehicles.find((v) => v.id === 1)?.quantity).toBe(5);
  });

  it("does not offer 'Purchase' for an out-of-stock vehicle at all", async () => {
    mockInventoryApi();
    renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: "Mahindra Thar LX" });
    expect(screen.getByRole("button", { name: "Mahindra Thar LX is out of stock" })).toBeDisabled();
  });
});

describe("Purchase history", () => {
  it("starts empty with a clear 'demonstration data' label", async () => {
    mockInventoryApi();
    renderApp("/history", { signedInAs: customer });
    expect(await screen.findByText("No purchases yet")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent(/Demonstration data/);
  });

  it("keeps the price paid even if the vehicle is later deleted (snapshot)", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Purchase ${SWIFT}` }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: /Confirm purchase/ }));
    await screen.findByRole("dialog", { name: "Purchase complete" });
    await user.click(screen.getByRole("button", { name: "Done" }));
    api.vehicles = api.vehicles.filter((v) => v.id !== 1); // an admin deletes it
    await user.click(screen.getByRole("link", { name: "Purchases" }));
    await user.click(await screen.findByRole("button", { name: /IGN-/ }));
    expect(screen.getByText(SWIFT)).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByText("₹8,15,000").length).toBeGreaterThan(0);
  });
});

describe("Watchlist", () => {
  it("saves from the floor, lists on the Watchlist page, and removes with Undo", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Save ${SWIFT} to watchlist` }));
    expect(screen.getByRole("button", { name: `Remove ${SWIFT} from watchlist` })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("link", { name: /^Watchlist/ }));
    expect(await screen.findByRole("article", { name: SWIFT })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: `Remove ${SWIFT} from watchlist` }));
    expect(screen.queryByRole("article", { name: SWIFT })).not.toBeInTheDocument();
    expect(screen.getByText("Nothing saved yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByRole("article", { name: SWIFT })).toBeInTheDocument();
  });

  it("stays in step across screens: the heart on the vehicle page matches the Watchlist", async () => {
    mockInventoryApi();
    const { user } = renderApp("/vehicle/1", { signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: "Save to watchlist" }));
    expect(screen.getByRole("button", { name: "Saved to watchlist" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("link", { name: /^Watchlist/ }));
    expect(await screen.findByRole("article", { name: SWIFT })).toBeInTheDocument();
  });

  it("drops a vehicle an administrator deleted", async () => {
    const api = mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    await user.click(screen.getByRole("button", { name: `Save ${SWIFT} to watchlist` }));
    api.vehicles = api.vehicles.filter((v) => v.id !== 1);
    await user.click(screen.getByRole("link", { name: /^Watchlist/ }));
    await waitFor(() => expect(screen.getByText("Nothing saved yet")).toBeInTheDocument());
  });
});

describe("Compare", () => {
  it("compares up to three vehicles and refuses a fourth", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: SWIFT });
    for (const name of [SWIFT, CRETA, FORTUNER]) await user.click(screen.getByRole("button", { name: `Compare ${name}` }));
    await user.click(screen.getByRole("button", { name: "Compare BMW 330Li M Sport" }));
    expect(await screen.findByText("Compare is full")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Comparison selection" })).toHaveTextContent("Compare (3/3)");
  });

  it("shows price, category, availability and the specs that exist, and can show differences only", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: CRETA });
    await user.click(screen.getByRole("button", { name: `Compare ${CRETA}` }));
    await user.click(screen.getByRole("button", { name: "Compare Mahindra Thar LX" }));
    await user.click(within(screen.getByRole("region", { name: "Comparison selection" })).getByRole("link", { name: /Compare 2 vehicles/ }));

    const table = await screen.findByRole("table", { name: "Vehicle comparison" });
    expect(within(table).getByRole("rowheader", { name: "Category" })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: "Availability" })).toBeInTheDocument();
    await user.click(screen.getByLabelText("Show differences only"));
    expect(within(table).queryByRole("rowheader", { name: "Category" })).not.toBeInTheDocument(); // both are SUVs
    expect(within(table).getByRole("rowheader", { name: "Price" })).toBeInTheDocument();
    // identity and action rows stay put
    expect(within(table).getAllByRole("link", { name: "View details" })).toHaveLength(2);
  });

  it("removes one selection, clears the rest and offers a way back", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor", { signedInAs: customer });
    await screen.findByRole("article", { name: CRETA });
    await user.click(screen.getByRole("button", { name: `Compare ${CRETA}` }));
    await user.click(screen.getByRole("button", { name: `Compare ${SWIFT}` }));
    await user.click(within(screen.getByRole("region", { name: "Comparison selection" })).getByRole("link", { name: /Compare 2 vehicles/ }));
    await screen.findByRole("table", { name: "Vehicle comparison" });
    await user.click(screen.getByRole("button", { name: `Remove ${CRETA} from comparison` }));
    expect(screen.getByText(/Add at least one more vehicle/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(screen.getByText("Nothing to compare yet")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to the floor" }));
    expect(await screen.findByRole("article", { name: SWIFT })).toBeInTheDocument();
  });
});

describe("Quick view", () => {
  it("opens a drawer with the details and actions, and closing it keeps the floor as it was", async () => {
    mockInventoryApi();
    const { user } = renderApp("/floor?cat=SUV", { signedInAs: customer });
    await screen.findByRole("article", { name: CRETA });
    await user.click(screen.getByRole("button", { name: `Quick view: ${CRETA}` }));
    const drawer = screen.getByRole("dialog", { name: CRETA });
    expect(within(drawer).getByRole("button", { name: "Add to cart" })).toBeEnabled();
    expect(within(drawer).getByRole("link", { name: "View full manifest" })).toHaveAttribute("href", "/vehicle/2");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: CRETA })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove filter: Category: SUV" })).toBeInTheDocument(); // filters intact
  });
});
