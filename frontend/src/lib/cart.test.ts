import { makeVehicle } from "../test/fixtures";
import { addToCart, type CartItem, cartLines, cartTotals, removeFromCart, restoreToCart, setQuantity } from "./cart";

const item = (vehicleId: number, quantity = 1): CartItem => ({ vehicleId, quantity });

describe("addToCart", () => {
  it("adds a new line", () => {
    expect(addToCart([], 1, 5).items).toEqual([item(1)]);
  });
  it("repeated additions update the existing line instead of duplicating it", () => {
    const once = addToCart([], 1, 5).items;
    const twice = addToCart(once, 1, 5);
    expect(twice.items).toEqual([item(1, 2)]);
    expect(twice.quantity).toBe(2);
  });
  it("never exceeds the stock, and says it was capped", () => {
    const result = addToCart([item(1, 2)], 1, 2);
    expect(result.items).toEqual([item(1, 2)]);
    expect(result.capped).toBe(true);
  });
  it("refuses an out-of-stock vehicle and changes nothing", () => {
    const start = [item(2)];
    const result = addToCart(start, 1, 0);
    expect(result).toMatchObject({ blocked: true, quantity: 0 });
    expect(result.items).toBe(start);
  });
});

describe("setQuantity / removeFromCart", () => {
  it("clamps to between 1 and the stock", () => {
    expect(setQuantity([item(1, 2)], 1, 99, 4)).toEqual([item(1, 4)]);
    expect(setQuantity([item(1, 2)], 1, 0, 4)).toEqual([item(1, 1)]);
    expect(setQuantity([item(1, 2)], 1, 2.9, 4)).toEqual([item(1, 2)]);
  });
  it("remembers what it removed and where", () => {
    const result = removeFromCart([item(1), item(2, 3), item(3)], 2);
    expect(result.items).toEqual([item(1), item(3)]);
    expect(result.removed).toEqual({ item: item(2, 3), index: 1 });
    expect(removeFromCart([item(1)], 9).removed).toBeNull();
  });
});

describe("restoreToCart (Undo)", () => {
  const removed = { item: item(2, 3), index: 1 };
  it("restores the old quantity in its old position when stock allows", () => {
    const result = restoreToCart([item(1), item(3)], removed, 5);
    expect(result.items).toEqual([item(1), item(2, 3), item(3)]);
    expect(result.outcome).toBe("restored");
  });
  it("restores only what stock allows, and explains the adjustment", () => {
    const result = restoreToCart([], removed, 2);
    expect(result.items).toEqual([item(2, 2)]);
    expect(result.outcome).toBe("adjusted");
    expect(result.note).toBe("Restored 2 of 3: only 2 in stock.");
  });
  it("never duplicates or overwrites a line that was added again", () => {
    const start = [item(2, 1)];
    const result = restoreToCart(start, removed, 5);
    expect(result.items).toBe(start);
    expect(result.outcome).toBe("already-present");
  });
  it("explains when the vehicle is gone or sold out", () => {
    expect(restoreToCart([], removed, null)).toMatchObject({ outcome: "unavailable", items: [] });
    expect(restoreToCart([], removed, null).note).toMatch(/no longer in the inventory/);
    expect(restoreToCart([], removed, 0).note).toMatch(/out of stock/);
  });
});

describe("cartLines and totals", () => {
  const vehicles = [makeVehicle({ id: 1, price: 1000, quantity: 5 }), makeVehicle({ id: 2, price: 250.5, quantity: 1 }), makeVehicle({ id: 3, price: 10, quantity: 0 })];
  const lines = cartLines([item(1, 2), item(2, 3), item(3, 1), item(99, 1)], vehicles);

  it("flags each line honestly", () => {
    expect(lines.map((line) => line.status)).toEqual(["ok", "reduced", "unavailable", "missing"]);
  });
  it("limits a line to today's stock", () => {
    expect(lines[1]).toMatchObject({ quantity: 1, maxQuantity: 1 });
  });
  it("totals only what can be bought, in exact paise", () => {
    expect(cartTotals(lines)).toEqual({ subtotalPaise: 2 * 100000 + 25050, units: 3, buyableLines: 2, problemLines: 2 });
  });
});
