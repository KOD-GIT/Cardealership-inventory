import { formatRupees } from "../../lib/money";

/** A price in JetBrains Mono with tabular figures. Struck through (but still readable) when the vehicle is sold out. */
export function Price({ rupees, soldOut = false, className = "" }: { rupees: number; soldOut?: boolean; className?: string }) {
  return (
    <span className={`t-data tnum ${soldOut ? "text-dim line-through decoration-1" : ""} ${className}`}>
      {formatRupees(rupees)}
    </span>
  );
}
