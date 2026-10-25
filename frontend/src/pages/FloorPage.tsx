import { RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Pagination } from "../components/ui/Pagination";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "../components/ui/States";
import { FloorFilters } from "../components/vehicles/FloorFilters";
import { VehicleCell } from "../components/vehicles/VehicleCell";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useExtras } from "../hooks/useShop";
import { useVehicleActions } from "../hooks/useVehicleActions";
import { useInventory } from "../hooks/useVehicles";
import {
  type BrowseState, categoryCounts, DEFAULT_BROWSE, filterVehicles, inventoryMetrics, paginate, parseBrowse, serializeBrowse, sortVehicles,
} from "../lib/browse";
import { formatClock } from "../lib/format";
import { formatInrCompact } from "../lib/money";
import { LOW_STOCK_THRESHOLD } from "../lib/stock";

/** Where the vehicle pages send "Back to the floor": the exact filters, sort and page you left. */
export const LAST_FLOOR_KEY = "ignition.lastFloor";

export default function FloorPage() {
  useDocumentTitle("The Floor");
  const [params, setParams] = useSearchParams();
  const inventory = useInventory();
  const { extrasFor } = useExtras();
  const actions = useVehicleActions();

  const state = useMemo(() => parseBrowse(params), [params]);

  useEffect(() => {
    try { sessionStorage.setItem(LAST_FLOOR_KEY, params.toString()); } catch { /* storage unavailable */ }
  }, [params]);

  const update = (patch: Partial<BrowseState>) => {
    const next = { ...state, ...patch };
    if (!("page" in patch)) next.page = 1; // any filter or sort change starts again from page 1
    setParams(serializeBrowse(next), { replace: true });
  };
  const clearFilters = () => setParams(serializeBrowse({ ...DEFAULT_BROWSE, sort: state.sort }), { replace: true });

  // Filter and sort the WHOLE collection first, then take one page of it.
  const filtered = useMemo(() => filterVehicles(inventory.vehicles, state), [inventory.vehicles, state]);
  const sorted = useMemo(() => sortVehicles(filtered, state.sort), [filtered, state.sort]);
  const page = useMemo(() => paginate(sorted, state.page), [sorted, state.page]);
  const counts = useMemo(() => categoryCounts(inventory.vehicles), [inventory.vehicles]);
  const metrics = useMemo(() => inventoryMetrics(inventory.vehicles, LOW_STOCK_THRESHOLD), [inventory.vehicles]);

  return (
    <>
      <PageHeader
        overline={`Inventory ledger / ${inventory.isSuccess ? `${metrics.models} registered models` : "loading"}`}
        title="The Floor"
      >
        <dl className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
          <Stat label="Units in stock" value={inventory.isSuccess ? String(metrics.units) : "…"} />
          <Stat label="Total valuation" value={inventory.isSuccess ? formatInrCompact(metrics.valuePaise) : "…"} />
          <div className="col-span-2 flex items-center justify-between gap-3 bg-charcoal p-4 sm:col-span-1">
            <div>
              <dt className="t-label text-dim">Last loaded</dt>
              <dd className="t-data">{inventory.dataUpdatedAt ? formatClock(new Date(inventory.dataUpdatedAt).toISOString()) : "--:--"}</dd>
            </div>
            <button type="button" className="icon-btn" aria-label="Refresh the floor" onClick={() => inventory.refetch()}>
              <RefreshCw className={`h-4 w-4 ${inventory.isFetching ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </dl>
      </PageHeader>

      <FloorFilters state={state} counts={counts} totalAll={inventory.vehicles.length} resultCount={sorted.length} onChange={update} onClear={clearFilters} />

      {inventory.isLoading ? (
        <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" aria-busy="true" aria-label="Loading vehicles">
          {Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-[30rem] border-b border-r border-line" />)}
        </div>
      ) : inventory.isError ? (
        <div className="p-4 lg:p-10"><ErrorState message="The vehicles could not be loaded. Check the connection and try again." onRetry={() => inventory.refetch()} /></div>
      ) : inventory.vehicles.length === 0 ? (
        <div className="p-4 lg:p-10"><EmptyState title="The floor is empty">There are no vehicles in the inventory yet.</EmptyState></div>
      ) : sorted.length === 0 ? (
        <div className="p-4 lg:p-10"><EmptyState title="No vehicle matches" action={{ label: "Clear filters", onClick: clearFilters }}>Nothing on the floor fits those filters. Loosen the price range or remove a filter.</EmptyState></div>
      ) : (
        <>
          <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {page.items.map((vehicle, i) => (
              <VehicleCell key={vehicle.id} vehicle={vehicle} extras={extrasFor(vehicle)} actions={actions} eagerImage={i < 5} />
            ))}
          </div>
          <Pagination page={page} onChange={(next) => update({ page: next })} />
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-charcoal p-4">
      <dt className="t-label text-dim">{label}</dt>
      <dd className="t-data text-lg font-bold">{value}</dd>
    </div>
  );
}
