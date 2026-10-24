import { useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query. Used to render ONE layout (table or cards) instead of both with
 * `hidden`/`md:hidden`, which would double the DOM. `fallback` applies where matchMedia is missing.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const available = typeof window !== "undefined" && typeof window.matchMedia === "function";
  const subscribe = (onChange: () => void) => {
    if (!available) return () => {};
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  };
  return useSyncExternalStore(subscribe, () => (available ? window.matchMedia(query).matches : fallback), () => fallback);
}
