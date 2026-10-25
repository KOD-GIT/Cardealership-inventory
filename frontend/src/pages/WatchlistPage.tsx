import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "../components/ui/States";
import { VehicleCell } from "../components/vehicles/VehicleCell";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useExtras, useWatchlist } from "../hooks/useShop";
import { useVehicleActions } from "../hooks/useVehicleActions";
import { useInventory } from "../hooks/useVehicles";

export default function WatchlistPage() {
  useDocumentTitle("Watchlist");
  const watchlist = useWatchlist();
  const inventory = useInventory();
  const { extrasFor } = useExtras();
  const actions = useVehicleActions();

  return (
    <>
      <PageHeader overline={`Watchlist / ${watchlist.vehicles.length} saved`} title="Watchlist" />
      {inventory.isLoading ? (
        <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[30rem] border-b border-r border-line" />)}</div>
      ) : inventory.isError ? (
        <div className="p-4 lg:p-10"><ErrorState message="The watchlist could not be loaded." onRetry={() => inventory.refetch()} /></div>
      ) : watchlist.vehicles.length === 0 ? (
        <div className="p-4 lg:p-10">
          <EmptyState title="Nothing saved yet" action={{ label: "Enter the floor", to: "/floor" }}>Use the heart on any vehicle to keep it here. Removing one gives you a few seconds to undo it.</EmptyState>
        </div>
      ) : (
        <div className="grid grid-cols-1 border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {watchlist.vehicles.map((vehicle) => <VehicleCell key={vehicle.id} vehicle={vehicle} extras={extrasFor(vehicle)} actions={actions} />)}
        </div>
      )}
    </>
  );
}
