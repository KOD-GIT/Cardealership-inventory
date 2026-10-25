/** A flat placeholder block shown while data loads. Decorative: hidden from screen readers. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-elevated ${className}`} />;
}
