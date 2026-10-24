import { stockStatus } from "../../lib/stock";
import { Badge, type BadgeTone } from "../ui/Badge";

const TONE: Record<"in" | "low" | "out", BadgeTone> = { in: "success", low: "warning", out: "danger" };

export function StockBadge({ quantity }: { quantity: number }) {
  const { level, label } = stockStatus(quantity);
  return <Badge tone={TONE[level]} dot>{label}</Badge>;
}
