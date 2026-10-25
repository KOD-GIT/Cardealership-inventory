import { ShoppingBag, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonClass } from "../components/ui/Button";
import { CheckboxField } from "../components/ui/Field";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "../components/ui/States";
import { VehicleImage } from "../components/ui/VehicleImage";
import { Price } from "../components/vehicles/Price";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart, useCompare, useExtras } from "../hooks/useShop";
import { useInventory } from "../hooks/useVehicles";
import { buildCompareRows, MAX_COMPARE, NOT_PROVIDED } from "../lib/compare";
import { vehicleName } from "../lib/format";
import { isPurchasable } from "../lib/stock";

export default function ComparePage() {
  useDocumentTitle("Compare");
  const compare = useCompare();
  const inventory = useInventory();
  const cart = useCart();
  const { extrasFor } = useExtras();
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const rows = useMemo(() => buildCompareRows(compare.vehicles, extrasFor), [compare.vehicles, extrasFor]);
  const shown = differencesOnly ? rows.filter((row) => row.differs) : rows;
  const count = compare.vehicles.length;

  return (
    <>
      <PageHeader overline={`Compare / ${count} of ${MAX_COMPARE}`} title="Compare">
        {count > 0 ? <Button variant="ghost" onClick={compare.clear}>Clear all</Button> : null}
      </PageHeader>

      <div className="p-4 lg:p-10">
        {inventory.isLoading ? <Skeleton className="h-96 w-full" /> : inventory.isError ? (
          <ErrorState message="The vehicles could not be loaded." onRetry={() => inventory.refetch()} />
        ) : count === 0 ? (
          <EmptyState title="Nothing to compare yet" action={{ label: "Back to the floor", to: "/floor" }}>Use the scale icon on up to three vehicles, then come back here to see them side by side.</EmptyState>
        ) : (
          <div className="space-y-6">
            {count < 2 ? <p role="status" className="border border-line bg-charcoal p-4 text-dim">Add at least one more vehicle to compare. <Link to="/floor" className="text-signal underline underline-offset-4">Back to the floor</Link></p> : null}
            <CheckboxField label="Show differences only" hint="Hides rows where every vehicle has the same value." checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} />

            {/* Wide on small screens: scrolls inside this box, never the page. The label column stays in view. */}
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <caption className="sr-only">Vehicle comparison</caption>
                <thead>
                  <tr className="align-top">
                    <th scope="col" className="sticky left-0 z-10 w-36 border-b border-r border-line bg-charcoal p-3"><span className="t-label text-dim">Vehicle</span></th>
                    {compare.vehicles.map((vehicle) => (
                      <th key={vehicle.id} scope="col" className="min-w-[14rem] border-b border-r border-line bg-ink p-4 font-normal last:border-r-0">
                        <div className="mb-3 aspect-[4/3] overflow-hidden bg-charcoal"><VehicleImage src={vehicle.image_url} alt={vehicleName(vehicle)} soldOut={!isPurchasable(vehicle.quantity)} /></div>
                        <div className="flex items-start justify-between gap-2">
                          <Link to={`/vehicle/${vehicle.id}`} className="t-sm hover:text-signal">{vehicleName(vehicle)}</Link>
                          <button type="button" className="icon-btn !h-9 !w-9 shrink-0" onClick={() => compare.remove(vehicle.id)} aria-label={`Remove ${vehicleName(vehicle)} from comparison`}><X className="h-4 w-4" aria-hidden="true" /></button>
                        </div>
                        <Price rupees={vehicle.price} soldOut={!isPurchasable(vehicle.quantity)} className="mt-1 block font-bold" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="t-data">
                  {shown.length === 0 ? (
                    <tr><td colSpan={count + 1} className="p-6 text-dim">These vehicles have identical values in every row. Turn off “Show differences only” to see them.</td></tr>
                  ) : shown.map((row) => (
                    <tr key={row.label} className="border-b border-line hover:bg-charcoal">
                      <th scope="row" className="sticky left-0 z-10 border-r border-line bg-charcoal p-3 text-left font-medium text-dim">{row.label}</th>
                      {row.values.map((value, i) => (
                        <td key={compare.vehicles[i].id} className={`border-r border-line p-3 last:border-r-0 ${value === NOT_PROVIDED ? "text-muted" : ""} ${row.differs ? "text-bone" : "text-dim"}`}>{value}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 z-10 border-r border-line bg-charcoal p-3 text-left font-medium text-dim">Actions</th>
                    {compare.vehicles.map((vehicle) => (
                      <td key={vehicle.id} className="space-y-2 border-r border-line p-3 last:border-r-0">
                        <Link to={`/vehicle/${vehicle.id}`} className={buttonClass("ghost", "sm", "w-full")}>View details</Link>
                        <Button variant="signal" size="sm" className="w-full" disabled={!isPurchasable(vehicle.quantity)} onClick={() => cart.add(vehicle)}>
                          <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> {isPurchasable(vehicle.quantity) ? "Add to cart" : "Out of stock"}
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
