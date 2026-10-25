import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, PageHeader } from "../components/ui/States";
import type { PurchaseRecord } from "../data/stores";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useActivity } from "../hooks/useShop";
import { useInventory } from "../hooks/useVehicles";
import { formatDateTime } from "../lib/format";
import { formatInr } from "../lib/money";

export default function HistoryPage() {
  useDocumentTitle("Purchase history");
  const { myPurchases } = useActivity();
  const { byId } = useInventory();

  return (
    <>
      <PageHeader overline={`Purchases / ${myPurchases.length}`} title="Purchase history" />
      <div className="space-y-6 p-4 lg:p-10">
        <p role="note" className="border border-line bg-charcoal p-4 text-sm text-dim">
          <strong className="text-bone">Demonstration data.</strong> These purchases were recorded by this application on this device only. They are
          snapshots: later price changes, edits or deletion of a vehicle never alter them.
        </p>
        {myPurchases.length === 0 ? (
          <EmptyState title="No purchases yet" action={{ label: "Enter the floor", to: "/floor" }}>Vehicles you purchase from this device will be listed here with the price you paid.</EmptyState>
        ) : (
          <ul aria-label="Purchases" className="border border-line">
            {myPurchases.map((record) => <Entry key={record.id} record={record} exists={(id) => byId.has(id)} />)}
          </ul>
        )}
      </div>
    </>
  );
}

function Entry({ record, exists }: { record: PurchaseRecord; exists: (vehicleId: number) => boolean }) {
  const [open, setOpen] = useState(false);
  const units = record.lines.reduce((sum, line) => sum + line.quantity, 0);
  const panelId = `purchase-${record.id}`;
  return (
    <li className="border-b border-line last:border-b-0">
      <h2>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}
          className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 p-4 text-left hover:bg-charcoal">
          <span className="min-w-0">
            <span className="t-data block font-bold">{record.reference}</span>
            <span className="t-label text-dim">{formatDateTime(record.at)} · {units} {units === 1 ? "unit" : "units"} · {record.lines.map((line) => line.name).join(", ")}</span>
          </span>
          <span className="flex shrink-0 items-center gap-3"><span className="t-data text-lg font-bold">{formatInr(record.totalPaise)}</span><ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" /></span>
        </button>
      </h2>
      {open ? (
        <div id={panelId} className="border-t border-line bg-charcoal">
          <table className="w-full text-left">
            <caption className="sr-only">Lines of purchase {record.reference}</caption>
            <thead><tr className="t-label text-muted"><th scope="col" className="p-3 font-medium">Vehicle</th><th scope="col" className="p-3 text-right font-medium">Qty</th><th scope="col" className="p-3 text-right font-medium">Price each</th><th scope="col" className="p-3 text-right font-medium">Line total</th></tr></thead>
            <tbody className="t-data divide-y divide-line">
              {record.lines.map((line) => (
                <tr key={line.vehicleId}>
                  <td className="p-3">{exists(line.vehicleId) ? <Link to={`/vehicle/${line.vehicleId}`} className="hover:text-signal">{line.name}</Link> : <span title="No longer in the inventory">{line.name}</span>}</td>
                  <td className="p-3 text-right">{line.quantity}</td>
                  <td className="p-3 text-right">{formatInr(line.unitPaise)}</td>
                  <td className="p-3 text-right font-bold">{formatInr(line.unitPaise * line.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </li>
  );
}
