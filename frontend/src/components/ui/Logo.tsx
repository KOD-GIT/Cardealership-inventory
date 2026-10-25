import { Link } from "react-router-dom";

/** IGNITION wordmark: Syne ExtraBold with the orange signal square. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" aria-label="IGNITION, home" className={`group inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="relative block h-5 w-5 bg-bone">
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 bg-signal transition-transform group-hover:translate-x-0.5" />
      </span>
      <span className="font-display text-xl font-extrabold uppercase leading-none tracking-tighter text-bone">Ignition</span>
    </Link>
  );
}
