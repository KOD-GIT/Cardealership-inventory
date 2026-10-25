/** Units at or below this count are "low stock" (a business rule shared by the API docs, the UI and the ledger). */
export const LOW_STOCK_THRESHOLD = 2;

export type StockLevel = "out" | "low" | "in";

export interface StockStatus {
  level: StockLevel;
  label: string;
}

export function stockStatus(quantity: number): StockStatus {
  if (quantity <= 0) return { level: "out", label: "Out of stock" };
  if (quantity <= LOW_STOCK_THRESHOLD) return { level: "low", label: `Only ${quantity} left` };
  return { level: "in", label: `${quantity} in stock` };
}

/** Out-of-stock vehicles stay inspectable but cannot be purchased or added to the cart. */
export const isPurchasable = (quantity: number): boolean => quantity > 0;
export const isLowStock = (quantity: number): boolean => quantity > 0 && quantity <= LOW_STOCK_THRESHOLD;
