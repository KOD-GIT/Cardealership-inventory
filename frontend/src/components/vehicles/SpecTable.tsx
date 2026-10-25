import type { CatalogueExtras } from "../../data/catalogue";
import { categoryLabel, stockRef } from "../../lib/format";
import { formatRupees } from "../../lib/money";
import { NOT_PROVIDED } from "../../lib/compare";
import { LOW_STOCK_THRESHOLD } from "../../lib/stock";
import type { Vehicle } from "../../types";

/**
 * Readable specification table. The first block is facts the inventory itself knows. The second block is the
 * "specification as supplied" for the model (see data/catalogue.ts). Anything missing says "Not provided"
 * instead of being invented, and nothing here claims an inspection, certification or verification.
 */
export function SpecTable({ vehicle, extras }: { vehicle: Vehicle; extras: CatalogueExtras }) {
  const inventory: [string, string][] = [
    ["Stock reference", stockRef(vehicle.id)],
    ["Category", categoryLabel(vehicle.category)],
    ["Model year", vehicle.year === null ? NOT_PROVIDED : String(vehicle.year)],
    ["Price", formatRupees(vehicle.price)],
    ["Units in stock", String(vehicle.quantity)],
    ["Low-stock threshold", `${LOW_STOCK_THRESHOLD} units`],
    ["VIN", NOT_PROVIDED],
  ];
  const supplied = Object.entries(extras.specs);

  return (
    <div className="grid gap-px border border-line bg-line md:grid-cols-2">
      <Group title="Inventory record" rows={inventory} />
      <Group
        title="Specification as supplied"
        rows={supplied.length > 0 ? supplied : [["Specifications", NOT_PROVIDED]]}
        note={supplied.length > 0 ? "Figures come from the listing material for this model and have not been independently verified." : undefined}
      />
    </div>
  );
}

function Group({ title, rows, note }: { title: string; rows: [string, string][]; note?: string }) {
  return (
    <section className="bg-ink">
      <h3 className="t-label border-b border-line bg-charcoal px-4 py-3 text-dim">{title}</h3>
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 px-4 py-3">
            <dt className="text-dim">{label}</dt>
            <dd className={`t-data text-right ${value === NOT_PROVIDED ? "text-muted" : ""}`}>{value}</dd>
          </div>
        ))}
      </dl>
      {note ? <p className="border-t border-line px-4 py-3 text-sm text-muted">{note}</p> : null}
    </section>
  );
}
