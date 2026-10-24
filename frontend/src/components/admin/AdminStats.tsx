import type { Vehicle } from "../../types";
import { stockStatus } from "../../lib/stock";

/** Totals are derived from the vehicle list (the API has no stats endpoint). */
export function AdminStats({ vehicles }: { vehicles: Vehicle[] }) {
  const units = vehicles.reduce((sum, v) => sum + v.quantity, 0);
  const out = vehicles.filter((v) => stockStatus(v.quantity).level === "out").length;
  const items = [
    { label: "Vehicles", value: vehicles.length, tone: "text-ink" },
    { label: "Units in stock", value: units, tone: "text-ink" },
    { label: "Out of stock", value: out, tone: out > 0 ? "text-danger" : "text-ink" },
  ];
  return (
    <dl className="grid grid-cols-3 gap-3 sm:gap-6">
      {items.map((s) => (
        <div key={s.label} className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
          <dt className="text-sm text-muted">{s.label}</dt>
          <dd className={`mt-1 font-display text-4xl font-bold ${s.tone}`}>{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
