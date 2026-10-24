import { useState } from "react";
import { EmptyState, ErrorBanner, VehicleCardSkeleton } from "../components/vehicles/states";
import { SearchFilterBar } from "../components/vehicles/SearchFilterBar";
import { VehicleCard } from "../components/vehicles/VehicleCard";
import { useToast } from "../components/ui/Toast";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { usePurchaseVehicle, useVehicles } from "../hooks/useVehicles";
import { apiErrorMessage, apiErrorStatus } from "../lib/errors";
import type { Vehicle, VehicleSearchParams } from "../types";

const GRID = "grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

export default function DashboardPage() {
  useDocumentTitle("Vehicles");
  const [params, setParams] = useState<VehicleSearchParams>({});
  const { data, isPending, isError, error, refetch } = useVehicles(params);
  const purchase = usePurchaseVehicle();
  const toast = useToast();
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const onPurchase = (vehicle: Vehicle) => {
    setBuyingId(vehicle.id);
    purchase.mutate(
      { id: vehicle.id },
      {
        onSuccess: () => toast({ tone: "success", title: `${vehicle.make} ${vehicle.model} purchased`, description: "Your purchase is complete." }),
        onError: (err) =>
          apiErrorStatus(err) === 409
            ? toast({ tone: "error", title: "That car just sold out", description: "Another customer bought the last one. Try another vehicle." })
            : toast({ tone: "error", title: "Purchase failed", description: apiErrorMessage(err) }),
        onSettled: () => setBuyingId(null),
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h1 className="text-4xl font-bold sm:text-5xl">Available vehicles</h1>
        {data ? <p className="whitespace-nowrap pb-1 text-muted" aria-live="polite">{data.length} {data.length === 1 ? "vehicle" : "vehicles"}</p> : null}
      </div>

      <SearchFilterBar onSearch={setParams} onReset={() => setParams({})} />

      {isPending ? (
        <div className={GRID} aria-busy="true" aria-label="Loading vehicles">
          {Array.from({ length: 8 }, (_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorBanner message={apiErrorMessage(error, "Check your connection and try again.")} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState onReset={() => setParams({})} />
      ) : (
        <>
          <ul className={GRID}>
            {data.map((v) => (
              <li key={v.id}>
                <VehicleCard vehicle={v} onPurchase={onPurchase} purchasing={buyingId === v.id} />
              </li>
            ))}
          </ul>
          <p className="text-center text-sm text-muted">Hover a car, or tap it on a touch screen, to bring it into view. Drag to rotate.</p>
        </>
      )}
    </div>
  );
}
