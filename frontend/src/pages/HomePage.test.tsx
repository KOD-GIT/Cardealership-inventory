import { screen, within } from "@testing-library/react";
import { mockInventoryApi } from "../test/api";
import { customer } from "../test/fixtures";
import { renderApp } from "../test/utils";

describe("Home", () => {
  beforeEach(() => { mockInventoryApi(); });

  it("shows the oversized split-hero headline and the way onto the floor", async () => {
    renderApp("/", { signedInAs: customer });
    expect(await screen.findByRole("heading", { level: 1, name: "Stock, Not Theatre." })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Enter the floor/ })).toHaveAttribute("href", "/floor");
  });

  it("features several vehicles in a carousel with previous, next and clickable indicators", async () => {
    const { user } = renderApp("/", { signedInAs: customer });
    const carousel = await screen.findByRole("region", { name: "Featured vehicles" });
    expect(within(carousel).getByRole("heading", { name: "Audi R8 Coupé V10" })).toBeInTheDocument(); // carousel order 1
    await user.click(within(carousel).getByRole("button", { name: "Next featured vehicle" }));
    expect(within(carousel).getByRole("heading", { name: "BMW 330Li M Sport" })).toBeInTheDocument();
    await user.click(within(carousel).getByRole("button", { name: /Show featured vehicle 1: Audi/ }));
    expect(within(carousel).getByRole("heading", { name: "Audi R8 Coupé V10" })).toBeInTheDocument();
    expect(within(carousel).getByRole("link", { name: /Explore vehicle/ })).toHaveAttribute("href", "/vehicle/6");
    await user.click(within(carousel).getByRole("button", { name: "Previous featured vehicle" }));
    expect(within(carousel).getByRole("heading", { name: "BMW 330Li M Sport" })).toBeInTheDocument(); // wraps round
  });

  it("lets you pause and resume the automatic slideshow", async () => {
    const { user } = renderApp("/", { signedInAs: customer });
    const carousel = await screen.findByRole("region", { name: "Featured vehicles" });
    const pause = within(carousel).getByRole("button", { name: "Pause automatic slideshow" });
    await user.click(pause);
    expect(within(carousel).getByRole("button", { name: "Play automatic slideshow" })).toHaveAttribute("aria-pressed", "true");
  });

  it("does not autoplay, and offers no pause control, when the person prefers reduced motion", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    renderApp("/", { signedInAs: customer });
    const carousel = await screen.findByRole("region", { name: "Featured vehicles" });
    expect(within(carousel).queryByRole("button", { name: /automatic slideshow/ })).not.toBeInTheDocument();
    // manual controls still work
    expect(within(carousel).getByRole("button", { name: "Next featured vehicle" })).toBeEnabled();
    // @ts-expect-error restore the jsdom default (no matchMedia)
    delete window.matchMedia;
  });

  it("has a native horizontal strip you can scroll with the keyboard, plus visible controls", async () => {
    renderApp("/", { signedInAs: customer });
    const strip = await screen.findByRole("region", { name: /Featured vehicles, scrollable/ });
    expect(strip).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: "Scroll featured vehicles right" })).toBeInTheDocument();
    expect(within(strip).getAllByRole("article")).toHaveLength(6);
  });

  it("calculates the inventory figures from the shared data, not from screenshots", async () => {
    renderApp("/", { signedInAs: customer });
    const figures = await screen.findByRole("region", { name: "Inventory at a glance" });
    const value = (label: RegExp) => within(figures).getByText(label).nextElementSibling?.textContent;
    expect(value(/Models on the floor/)).toBe("6");
    expect(value(/Units in stock/)).toBe("16");
    expect(value(/Low stock/)).toBe("2");
    expect(value(/Out of stock/)).toBe("1");
  });

  it("remembers recently viewed vehicles (newest first) and can clear them", async () => {
    const { user } = renderApp("/vehicle/5", { signedInAs: customer });
    await screen.findByRole("heading", { level: 1, name: "BMW 330Li M Sport" });
    await user.click(screen.getByRole("link", { name: "IGNITION, home" }));
    const recent = await screen.findByRole("region", { name: "Recently viewed" });
    expect(within(recent).getByRole("article", { name: "BMW 330Li M Sport" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear history" }));
    expect(screen.queryByText("Recently viewed")).not.toBeInTheDocument();
  });

  it("a signed-out visitor sees no inventory data, only a way in", async () => {
    renderApp("/");
    expect(await screen.findByText("The floor is for signed-in visitors")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Featured vehicles" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Inventory at a glance" })).not.toBeInTheDocument();
  });
});
