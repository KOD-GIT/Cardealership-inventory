import { screen, within } from "@testing-library/react";
import { mockInventoryApi } from "../test/api";
import { admin, customer } from "../test/fixtures";
import { renderApp } from "../test/utils";
import { LAST_FLOOR_KEY } from "./FloorPage";

describe("Vehicle manifest", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("shows identity, price, stock and the actions", async () => {
    renderApp("/vehicle/5", { signedInAs: customer });
    expect(await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" })).toBeInTheDocument();
    expect(screen.getByText(/STOCK 0005/)).toBeInTheDocument();
    expect(screen.getAllByText("₹62,00,000").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Only 2 left").length).toBeGreaterThan(0);
    for (const name of ["Add to cart", "Purchase now", "Save to watchlist", "Compare", "Share"]) {
      expect(screen.getByRole("button", { name: new RegExp(name) })).toBeEnabled();
    }
  });

  it("has breadcrumbs, and Back to the floor returns to the filters you left", async () => {
    sessionStorage.setItem(LAST_FLOOR_KEY, "cat=SEDAN&sort=price-asc");
    renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    expect(screen.getByRole("link", { name: /Back to the floor/ })).toHaveAttribute("href", "/floor?cat=SEDAN&sort=price-asc");
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByRole("link", { name: "Sedan" })).toHaveAttribute("href", "/floor?cat=SEDAN");
    expect(crumbs.getByText("BMW 330Li M Sport")).toHaveAttribute("aria-current", "page");
  });

  it("shows the specification tab, with 'Not provided' for what is missing and no invented claims", async () => {
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await user.click(await screen.findByRole("tab", { name: "Specifications" }));
    const panel = within(screen.getByRole("tabpanel"));
    expect(panel.getByText("Wheelbase")).toBeInTheDocument();
    expect(panel.getByText("2,961 mm")).toBeInTheDocument();
    expect(panel.getByText("VIN").nextElementSibling).toHaveTextContent("Not provided");
    expect(panel.getByText("Model year").nextElementSibling).toHaveTextContent("Not provided");
    expect(document.body.textContent).not.toMatch(/certified|accident|inspected|dyno/i);
  });

  it("says 'Not provided' for every spec of a model the catalogue does not describe", async () => {
    const { user } = renderApp("/vehicle/1", { signedInAs: customer });
    await user.click(await screen.findByRole("tab", { name: "Specifications" }));
    expect(within(screen.getByRole("tabpanel")).getByText("Specifications").nextElementSibling).toHaveTextContent("Not provided");
  });

  it("only offers the stock-movements tab to administrators", async () => {
    const first = renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    expect(screen.queryByRole("tab", { name: "Stock movements" })).not.toBeInTheDocument();
    first.unmount();
    localStorage.clear();
    const second = renderApp("/vehicle/5", { signedInAs: admin });
    await second.user.click(await screen.findByRole("tab", { name: "Stock movements" }));
    expect(screen.getByText(/No movements for this vehicle have been recorded/)).toBeInTheDocument();
  });

  it("explains an out-of-stock vehicle and disables buying it", async () => {
    renderApp("/vehicle/4", { signedInAs: customer });
    expect(await screen.findByRole("heading", { level: 1, name: "Mahindra Thar LX" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Purchase now" })).toBeDisabled();
    expect(screen.getByText(/out of stock\. You can still read everything/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Save to watchlist/ })).toBeEnabled();
  });

  it("handles a missing, deleted or malformed vehicle link gracefully", async () => {
    for (const route of ["/vehicle/9999", "/vehicle/abc", "/vehicle/-1"]) {
      const view = renderApp(route, { signedInAs: customer });
      expect(await screen.findByText("Vehicle not found")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Back to the floor" })).toBeInTheDocument();
      view.unmount();
    }
  });

  it("sends a signed-out visitor to sign in, remembering the vehicle", async () => {
    renderApp("/vehicle/5");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });
});

describe("Vehicle gallery", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("steps through photographs with the buttons, thumbnails and arrow keys, keeping a count", async () => {
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    expect(screen.getByText("01 / 06")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next photograph" }));
    expect(screen.getByText("02 / 06")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show photograph 5 of 6" }));
    expect(screen.getByText("05 / 06")).toBeInTheDocument();
    screen.getByRole("button", { name: "Next photograph" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("06 / 06")).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("01 / 06")).toBeInTheDocument();
  });

  it("opens a fullscreen viewer that closes with Escape and returns focus", async () => {
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    const open = screen.getByRole("button", { name: "Open fullscreen viewer" });
    await user.click(open);
    const viewer = screen.getByRole("dialog", { name: /photograph viewer/ });
    await user.click(within(viewer).getByRole("button", { name: "Next photograph" }));
    expect(within(viewer).getByText("02 / 06")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /photograph viewer/ })).not.toBeInTheDocument();
    expect(open).toHaveFocus();
  });

  it("hides the carousel controls for a single photograph", async () => {
    renderApp("/vehicle/1", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "Maruti Suzuki Swift ZXi" });
    expect(screen.queryByRole("button", { name: "Next photograph" })).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Photograph thumbnails" })).not.toBeInTheDocument();
    expect(screen.queryByText(/\/ 01/)).not.toBeInTheDocument();
  });

  it("only ever shows photographs of that vehicle", async () => {
    renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    const sources = screen.getAllByRole("img").map((img) => img.getAttribute("src") ?? "");
    expect(sources.filter(Boolean).every((src) => src.includes("bmw-330li"))).toBe(true);
  });

  it("shows a deliberate fallback when a photograph fails to load, without hiding the page", async () => {
    mockInventoryApi();
    const { container } = renderApp("/vehicle/1", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "Maruti Suzuki Swift ZXi" });
    const image = container.querySelector("#vehicle-photo img") as HTMLImageElement;
    image.dispatchEvent(new Event("error"));
    expect(await screen.findByText("Photograph not available")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add to cart" })).toBeEnabled();
  });
});

describe("Share", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("copies the direct link using the stable vehicle id, and says so only after it worked", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: /Share/ }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/vehicle/5`);
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("does NOT claim success when copying fails, and offers a selectable link instead", async () => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) }, configurable: true });
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await user.click(await screen.findByRole("button", { name: /Share/ }));
    expect(screen.queryByText("Link copied")).not.toBeInTheDocument();
    const field = await screen.findByLabelText(/Copying was blocked/);
    expect(field).toHaveValue(`${window.location.origin}/vehicle/5`);
    expect(field).toHaveAttribute("readonly");
  });
});
