import { RotateCw, SearchX, TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button";
import { Skeleton } from "../ui/Skeleton";

/** Same silhouette as VehicleCard so the grid does not jump when data arrives. */
export function VehicleCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-card" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between"><Skeleton className="h-4 w-20" /><Skeleton className="h-6 w-24 rounded-full" /></div>
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <div className="flex justify-between border-t border-line pt-3"><Skeleton className="h-4 w-10" /><Skeleton className="h-8 w-28" /></div>
        <Skeleton className="h-11 w-full" />
      </div>
    </div>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line bg-white px-6 py-16 text-center shadow-card">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-2xl font-bold">No vehicles match your search</h2>
      <p className="mt-1 text-muted">Try removing a filter or searching for a different make.</p>
      <Button className="mt-6" onClick={onReset}>
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Reset filters
      </Button>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start justify-between gap-4 rounded-xl border border-danger/30 bg-danger-tint p-5 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
        <div>
          <p className="font-display text-xl font-bold text-danger">Couldn&rsquo;t load vehicles</p>
          <p className="text-sm text-ink">{message}</p>
        </div>
      </div>
      <Button variant="secondary" onClick={onRetry}>
        <RotateCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
