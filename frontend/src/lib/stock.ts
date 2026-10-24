/** Units at or below this count are shown as "Only N left" (decision D15 in PROJECT_PLAN.md). */
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
