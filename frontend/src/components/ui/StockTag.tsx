import { LOW_STOCK_THRESHOLD, stockStatus } from "../../lib/stock";

/**
 * Availability stamp. Lime is reserved for healthy stock, orange for low stock, and a plain bordered tag with
 * readable text for out of stock. The state is always spelled out in words, never colour alone.
 */
export function StockTag({ quantity, className = "" }: { quantity: number; className?: string }) {
  const status = stockStatus(quantity);
  if (status.level === "out") {
    return <span className={`tag border-line-active text-dim ${className}`}>Out of stock</span>;
  }
  if (status.level === "low") {
    return (
      <span className={`tag border-signal text-signal ${className}`} title={`Low stock: ${LOW_STOCK_THRESHOLD} units or fewer`}>
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-signal" />
        {status.label}
      </span>
    );
  }
  return (
    <span className={`tag border-lime text-lime ${className}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-lime" />
      {status.label}
    </span>
  );
}
