import { isLowStock, isPurchasable, LOW_STOCK_THRESHOLD, stockStatus } from "./stock";

describe("stock rules", () => {
  it("uses a low-stock threshold of two units", () => expect(LOW_STOCK_THRESHOLD).toBe(2));
  it("is out of stock at 0", () => expect(stockStatus(0)).toEqual({ level: "out", label: "Out of stock" }));
  it("is low up to the threshold, with the exact count", () => {
    expect(stockStatus(1)).toEqual({ level: "low", label: "Only 1 left" });
    expect(stockStatus(2).level).toBe("low");
  });
  it("is in stock above the threshold", () => expect(stockStatus(3)).toEqual({ level: "in", label: "3 in stock" }));
  it("only vehicles with stock can be purchased", () => {
    expect(isPurchasable(0)).toBe(false);
    expect(isPurchasable(1)).toBe(true);
    expect(isLowStock(0)).toBe(false);
    expect(isLowStock(2)).toBe(true);
    expect(isLowStock(3)).toBe(false);
  });
});
