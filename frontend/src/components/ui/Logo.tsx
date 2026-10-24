/** Showroom mark (rounded square with a "C" cut-out and a green dot) + wordmark. */
/** `compact` hides the wordmark below the sm breakpoint (the mark alone is enough on a phone). */
export function Logo({ className = "", light = false, compact = false }: { className?: string; light?: boolean; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? "#FFFFFF" : "#0E6B66"} />
        <path d="M21 10.5a7.5 7.5 0 1 0 0 11" fill="none" stroke={light ? "#0E6B66" : "#FFFFFF"} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="21.5" cy="16" r="2.4" fill="#1F7A4D" />
      </svg>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-ink"} ${compact ? "hidden sm:inline" : ""}`}>Showroom</span>
    </span>
  );
}
