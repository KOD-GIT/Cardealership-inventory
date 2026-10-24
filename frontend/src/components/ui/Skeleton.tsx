/** Grey placeholder block; purely decorative so it is hidden from assistive tech. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-line/80 ${className}`} />;
}
