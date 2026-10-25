import { Download, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DeleteVehicleDialog } from "../components/admin/DeleteVehicleDialog";
import { MovementsTable } from "../components/admin/MovementsTable";
import { RestockDialog } from "../components/admin/RestockDialog";
import { VehicleFormDialog, type VehicleFormResult } from "../components/admin/VehicleFormDialog";
import { Button } from "../components/ui/Button";
import { useNotify } from "../components/ui/Notifications";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "../components/ui/States";
import { StockTag } from "../components/ui/StockTag";
import { Price } from "../components/vehicles/Price";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useActivity, useExtras } from "../hooks/useShop";
import { useCreateVehicle, useDeleteVehicle, useInventory, useRestockVehicle, useUpdateVehicle } from "../hooks/useVehicles";
import { inventoryMetrics } from "../lib/browse";
import { downloadCsv, toCsv } from "../lib/csv";
import { apiErrorMessage } from "../lib/errors";
import { categoryLabel, formatClock, stockRef, vehicleName } from "../lib/format";
import { formatInr, formatInrCompact } from "../lib/money";
import { LOW_STOCK_THRESHOLD } from "../lib/stock";
import { CATEGORIES, type Vehicle, type VehicleCategory } from "../types";

type StatusFilter = "all" | "in" | "low" | "out";

const monthKey = (iso: string) => iso.slice(0, 7); // "2026-10"

export default function LedgerPage() {
  useDocumentTitle("The Ledger");
  const notify = useNotify();
  const inventory = useInventory();
  const activity = useActivity();
  const extrasApi = useExtras();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const restockVehicle = useRestockVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<VehicleCategory | "">("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  const [restocking, setRestocking] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const vehicles = inventory.vehicles;
  const metrics = useMemo(() => inventoryMetrics(vehicles, LOW_STOCK_THRESHOLD), [vehicles]);
  const lowStock = useMemo(() => vehicles.filter((v) => v.quantity <= LOW_STOCK_THRESHOLD).sort((a, b) => a.quantity - b.quantity || a.id - b.id), [vehicles]);

  const thisMonth = monthKey(new Date().toISOString());
  const monthlyPurchases = useMemo(() => activity.allPurchases.filter((p) => monthKey(p.at) === thisMonth), [activity.allPurchases, thisMonth]);
  const monthlyUnits = monthlyPurchases.reduce((sum, p) => sum + p.lines.reduce((s, l) => s + l.quantity, 0), 0);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (needle && !`${vehicleName(v)} ${stockRef(v.id)}`.toLowerCase().includes(needle)) return false;
      if (category && v.category !== category) return false;
      if (status === "in" && v.quantity <= LOW_STOCK_THRESHOLD) return false;
      if (status === "low" && !(v.quantity > 0 && v.quantity <= LOW_STOCK_THRESHOLD)) return false;
      if (status === "out" && v.quantity > 0) return false;
      return true;
    });
  }, [vehicles, search, category, status]);

  // ---- mutations: each talks to the real API, then records what truly changed ----

  const save = async ({ input, extras }: VehicleFormResult) => {
    try {
      if (editing === "new") {
        const created = await createVehicle.mutateAsync(input);
        extrasApi.update(created.id, extras);
        activity.recordMovement({ vehicleId: created.id, vehicle: vehicleName(created), event: "CREATED", delta: created.quantity, resulting: created.quantity });
        notify({ tone: "success", title: `Added ${vehicleName(created)}`, description: `Stock reference ${stockRef(created.id)}.` });
      } else if (editing) {
        const before = editing;
        const updated = await updateVehicle.mutateAsync({ id: before.id, input });
        extrasApi.update(updated.id, extras);
        activity.recordMovement({ vehicleId: updated.id, vehicle: vehicleName(updated), event: "UPDATED", delta: updated.quantity - before.quantity, resulting: updated.quantity });
        notify({ tone: "success", title: `Saved ${vehicleName(updated)}` });
      }
      setEditing(null);
    } catch (error) {
      throw new Error(apiErrorMessage(error, "The vehicle could not be saved."));
    }
  };

  const restock = async (vehicle: Vehicle, quantity: number) => {
    try {
      const updated = await restockVehicle.mutateAsync({ id: vehicle.id, quantity });
      activity.recordMovement({ vehicleId: vehicle.id, vehicle: vehicleName(vehicle), event: "RESTOCKED", delta: quantity, resulting: updated.quantity });
      notify({ tone: "success", title: `Restocked ${vehicleName(vehicle)}`, description: `+${quantity}, now ${updated.quantity} in stock.` });
    } catch (error) {
      throw new Error(apiErrorMessage(error, "The stock could not be updated."));
    }
  };

  const remove = async (vehicle: Vehicle) => {
    try {
      await deleteVehicle.mutateAsync(vehicle.id);
      extrasApi.forget(vehicle.id);
      activity.recordMovement({ vehicleId: vehicle.id, vehicle: vehicleName(vehicle), event: "DELETED", delta: -vehicle.quantity, resulting: 0 });
      notify({ tone: "success", title: `Deleted ${vehicleName(vehicle)}` });
    } catch (error) {
      throw new Error(apiErrorMessage(error, "The vehicle could not be deleted."));
    }
  };

  const exportLedger = () => {
    const csv = toCsv(
      ["Timestamp (ISO 8601)", "Stock reference", "Vehicle", "Event", "Change (units)", "Stock after", "Actor"],
      activity.movements.map((m) => [m.at, stockRef(m.vehicleId), m.vehicle, m.event, m.delta, m.resulting, m.actor]),
    );
    downloadCsv(`ignition-ledger-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    notify({ tone: "success", title: "Ledger exported", description: `${activity.movements.length} movements saved to a CSV file.` });
  };

  return (
    <>
      <PageHeader overline="Console / ledger" title="The Ledger">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={exportLedger} disabled={activity.movements.length === 0} title={activity.movements.length === 0 ? "No movements recorded yet" : undefined}>
            <Download className="h-4 w-4" aria-hidden="true" /> Export ledger
          </Button>
          <Button variant="ghost" onClick={() => inventory.refetch()} aria-label="Refresh inventory">
            <RefreshCw className={`h-4 w-4 ${inventory.isFetching ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
          </Button>
          <Button variant="signal" onClick={() => setEditing("new")}><Plus className="h-4 w-4" aria-hidden="true" /> Add vehicle</Button>
        </div>
      </PageHeader>

      {inventory.isLoading ? <div className="space-y-px p-4 lg:p-10"><Skeleton className="h-40 w-full" /><Skeleton className="h-72 w-full" /></div> : inventory.isError ? (
        <div className="p-4 lg:p-10"><ErrorState message="The inventory could not be loaded." onRetry={() => inventory.refetch()} /></div>
      ) : (
        <>
          <p className="border-b border-line px-4 py-3 text-sm text-muted lg:px-10">
            Inventory loaded {inventory.dataUpdatedAt ? formatClock(new Date(inventory.dataUpdatedAt).toISOString()) : "just now"}. Stock figures come from the dealership API. Movements and monthly sales below are recorded by this application on this device (demonstration data).
          </p>

          <section aria-label="Key figures" className="grid grid-cols-2 border-b border-line lg:grid-cols-4">
            <Kpi label="Models logged" value={String(metrics.models)} note={`${metrics.inStock} in stock`} />
            <Kpi label="Units in stock" value={String(metrics.units)} note={`Inventory value ${formatInrCompact(metrics.valuePaise)}`} title={formatInr(metrics.valuePaise)} />
            <Kpi label={`Low stock (${LOW_STOCK_THRESHOLD} or fewer)`} value={String(metrics.low + metrics.out)} note={`${metrics.out} out of stock`} accent={metrics.low + metrics.out > 0} />
            <Kpi
              label="Sales this month" last
              value={activity.allPurchases.length === 0 ? "–" : String(monthlyUnits)}
              note={activity.allPurchases.length === 0 ? "No sales recorded on this device yet" : `${monthlyPurchases.length} ${monthlyPurchases.length === 1 ? "purchase" : "purchases"} on this device`}
            />
          </section>

          <section aria-labelledby="low-title" className="border-b border-line p-4 lg:p-10">
            <h2 id="low-title" className="t-md mb-1">Low-stock manifest</h2>
            <p className="t-label mb-4 text-dim">Threshold: {LOW_STOCK_THRESHOLD} units or fewer · {lowStock.length} {lowStock.length === 1 ? "match" : "matches"}</p>
            {lowStock.length === 0 ? <p className="border border-line bg-charcoal p-6 text-dim">Every vehicle has healthy stock.</p> : (
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[40rem] border-collapse text-left">
                  <caption className="sr-only">Vehicles at or below the low-stock threshold</caption>
                  <thead><tr className="t-label border-b border-line bg-charcoal text-muted">
                    <th scope="col" className="p-3 font-medium">Vehicle</th><th scope="col" className="p-3 font-medium">Stock no.</th><th scope="col" className="p-3 font-medium">Class</th>
                    <th scope="col" className="p-3 text-right font-medium">Price</th><th scope="col" className="p-3 font-medium">Depth</th><th scope="col" className="p-3 text-right font-medium">Action</th>
                  </tr></thead>
                  <tbody className="divide-y divide-line">
                    {lowStock.map((v) => (
                      <tr key={v.id} className="hover:bg-charcoal">
                        <td className="p-3 font-semibold">{vehicleName(v)}</td>
                        <td className="t-data p-3 text-dim">{stockRef(v.id)}</td>
                        <td className="p-3 text-dim">{categoryLabel(v.category)}</td>
                        <td className="p-3 text-right"><Price rupees={v.price} /></td>
                        <td className="p-3"><StockTag quantity={v.quantity} /></td>
                        <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => setRestocking(v)} aria-label={`Restock ${vehicleName(v)}`}>Restock</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section aria-labelledby="mov-title" className="border-b border-line p-4 lg:p-10">
            <h2 id="mov-title" className="t-md mb-4">Recent stock movements</h2>
            <MovementsTable movements={activity.movements.slice(-10)} />
          </section>

          <section aria-labelledby="inv-title" className="p-4 lg:p-10">
            <h2 id="inv-title" className="t-md mb-4">Full inventory</h2>
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div><label htmlFor="ledger-search" className="t-label text-dim">Search</label><input id="ledger-search" type="search" className="input mt-1" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or stock number" /></div>
              <div><label htmlFor="ledger-cat" className="t-label text-dim">Category</label>
                <select id="ledger-cat" className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as VehicleCategory | "")}>
                  <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
                </select></div>
              <div><label htmlFor="ledger-status" className="t-label text-dim">Stock status</label>
                <select id="ledger-status" className="input mt-1" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                  <option value="all">All</option><option value="in">Healthy stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
                </select></div>
            </div>
            <p className="t-label mb-3 text-dim" role="status" aria-live="polite">{rows.length} of {vehicles.length} vehicles</p>
            {vehicles.length === 0 ? <EmptyState title="No vehicles yet" action={{ label: "Add vehicle", onClick: () => setEditing("new") }}>The inventory is empty.</EmptyState> : rows.length === 0 ? (
              <p className="border border-line bg-charcoal p-6 text-dim">No vehicle matches those filters.</p>
            ) : (
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[56rem] border-collapse text-left">
                  <caption className="sr-only">All vehicles</caption>
                  <thead><tr className="t-label border-b border-line bg-charcoal text-muted">
                    <th scope="col" className="p-3 font-medium">Stock no.</th><th scope="col" className="p-3 font-medium">Vehicle</th><th scope="col" className="p-3 font-medium">Category</th>
                    <th scope="col" className="p-3 text-right font-medium">Price</th><th scope="col" className="p-3 text-right font-medium">In stock</th><th scope="col" className="p-3 font-medium">Status</th>
                    <th scope="col" className="p-3 font-medium">Home</th><th scope="col" className="p-3 text-right font-medium">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((v) => {
                      const x = extrasApi.extrasFor(v);
                      return (
                        <tr key={v.id} className="hover:bg-charcoal">
                          <td className="t-data p-3 text-dim">{stockRef(v.id)}</td>
                          <td className="p-3 font-semibold"><Link to={`/vehicle/${v.id}`} className="hover:text-signal">{vehicleName(v)}</Link></td>
                          <td className="p-3 text-dim">{categoryLabel(v.category)}</td>
                          <td className="p-3 text-right"><Price rupees={v.price} /></td>
                          <td className="t-data p-3 text-right">{v.quantity}</td>
                          <td className="p-3"><StockTag quantity={v.quantity} /></td>
                          <td className="t-label p-3 text-dim">{[x.featured ? `Featured${x.carouselOrder ? ` #${x.carouselOrder}` : ""}` : null, x.newArrival ? "New" : null].filter(Boolean).join(" · ") || "–"}</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditing(v)} aria-label={`Edit ${vehicleName(v)}`}><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => setRestocking(v)} aria-label={`Restock ${vehicleName(v)}`}>Restock</Button>
                              <Button size="sm" variant="danger" onClick={() => setDeleting(v)} aria-label={`Delete ${vehicleName(v)}`}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <VehicleFormDialog
        open={editing !== null} onClose={() => setEditing(null)} onSubmit={save}
        vehicle={editing && editing !== "new" ? editing : undefined} extras={editing && editing !== "new" ? extrasApi.extrasFor(editing) : undefined}
      />
      <RestockDialog vehicle={restocking} onClose={() => setRestocking(null)} onConfirm={restock} />
      <DeleteVehicleDialog vehicle={deleting} onClose={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}

function Kpi({ label, value, note, accent = false, last = false, title }: { label: string; value: string; note: string; accent?: boolean; last?: boolean; title?: string }) {
  return (
    <div title={title} className={`flex min-h-[10rem] flex-col justify-between border-b border-line p-5 lg:border-b-0 lg:p-8 ${last ? "" : "border-r"} ${accent ? "bg-charcoal" : ""}`}>
      <span className={`t-label ${accent ? "font-bold text-signal" : "text-dim"}`}>{label}</span>
      <span className={`font-display text-5xl font-extrabold tabular-nums tracking-tighter lg:text-6xl ${accent ? "text-signal" : ""}`}>{value}</span>
      <span className="t-label text-muted">{note}</span>
    </div>
  );
}
