import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { AdminStats } from "../components/admin/AdminStats";
import { AdminVehicleTable } from "../components/admin/AdminVehicleTable";
import { DeleteVehicleModal } from "../components/admin/DeleteVehicleModal";
import { RestockModal } from "../components/admin/RestockModal";
import { VehicleFormModal } from "../components/admin/VehicleFormModal";
import { Button } from "../components/ui/Button";
import { SelectField, TextField } from "../components/ui/Field";
import { Skeleton } from "../components/ui/Skeleton";
import { ErrorBanner } from "../components/vehicles/states";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useVehicles } from "../hooks/useVehicles";
import { apiErrorMessage } from "../lib/errors";
import { categoryLabel } from "../lib/format";
import { stockStatus } from "../lib/stock";
import { CATEGORIES, type Vehicle, type VehicleCategory } from "../types";

type Modal = { kind: "create" } | { kind: "edit" | "restock" | "delete"; vehicle: Vehicle } | null;
type StockFilter = "all" | "in" | "low" | "out";

export default function AdminPage() {
  useDocumentTitle("Manage inventory");
  const { data, isPending, isError, error, refetch } = useVehicles();
  const [modal, setModal] = useState<Modal>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VehicleCategory | "">("");
  const [stock, setStock] = useState<StockFilter>("all");
  const close = () => setModal(null);

  // Admin filters run on the already-loaded list: no extra API calls.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(
      (v) =>
        (!q || `${v.make} ${v.model}`.toLowerCase().includes(q)) &&
        (!category || v.category === category) &&
        (stock === "all" || stockStatus(v.quantity).level === stock),
    );
  }, [data, query, category, stock]);

  const filtering = query !== "" || category !== "" || stock !== "all";
  const clearFilters = () => { setQuery(""); setCategory(""); setStock("all"); };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold sm:text-5xl">Manage inventory</h1>
        <Button onClick={() => setModal({ kind: "create" })}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add vehicle
        </Button>
      </div>

      {data ? <AdminStats vehicles={data} /> : null}

      <form role="search" aria-label="Filter inventory" onSubmit={(e) => e.preventDefault()}
        className="grid gap-4 rounded-xl border border-line bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
        <TextField label="Search make or model" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value as VehicleCategory | "")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </SelectField>
        <SelectField label="Stock" value={stock} onChange={(e) => setStock(e.target.value as StockFilter)}>
          <option value="all">All</option>
          <option value="in">In stock</option>
          <option value="low">Low stock</option>
          <option value="out">Out of stock</option>
        </SelectField>
        <Button variant="secondary" onClick={clearFilters} disabled={!filtering}>Clear filters</Button>
      </form>

      {isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading inventory">
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : isError ? (
        <ErrorBanner message={apiErrorMessage(error, "Check your connection and try again.")} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <div className="rounded-xl border border-line bg-white px-6 py-14 text-center shadow-card">
          <h2 className="text-2xl font-bold">No vehicles yet</h2>
          <p className="mt-1 text-muted">Add the first vehicle to open the showroom.</p>
          <Button className="mt-5" onClick={() => setModal({ kind: "create" })}>Add vehicle</Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-line bg-white px-6 py-14 text-center shadow-card">
          <h2 className="text-2xl font-bold">No vehicles match these filters</h2>
          <Button variant="secondary" className="mt-5" onClick={clearFilters}>Clear filters</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted" aria-live="polite">Showing {visible.length} of {data.length} vehicles</p>
          <AdminVehicleTable
            vehicles={visible}
            onRestock={(vehicle) => setModal({ kind: "restock", vehicle })}
            onEdit={(vehicle) => setModal({ kind: "edit", vehicle })}
            onDelete={(vehicle) => setModal({ kind: "delete", vehicle })}
          />
        </>
      )}

      {modal?.kind === "create" ? <VehicleFormModal onClose={close} /> : null}
      {modal?.kind === "edit" ? <VehicleFormModal key={modal.vehicle.id} vehicle={modal.vehicle} onClose={close} /> : null}
      {modal?.kind === "restock" ? <RestockModal key={modal.vehicle.id} vehicle={modal.vehicle} onClose={close} /> : null}
      {modal?.kind === "delete" ? <DeleteVehicleModal key={modal.vehicle.id} vehicle={modal.vehicle} onClose={close} /> : null}
    </div>
  );
}
