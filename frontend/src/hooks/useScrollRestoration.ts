import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const key = (locationKey: string) => `ignition.scroll.${locationKey}`;

const read = (locationKey: string): number | null => {
  try {
    const raw = sessionStorage.getItem(key(locationKey));
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
};
const write = (locationKey: string, y: number) => {
  try { sessionStorage.setItem(key(locationKey), String(Math.round(y))); } catch { /* ignore */ }
};

/**
 * Scroll behaviour for a client-side app:
 *  - going to a NEW page starts at the top;
 *  - Back / Forward returns to exactly where you were (the Floor list, filters and scroll position);
 *  - changing only the query string (typing in the Floor's search) does not jump the page.
 * The list is fetched asynchronously, so restoring keeps trying for a few seconds until the page is tall
 * enough, and gives up the moment the person scrolls themselves.
 */
export function useScrollRestoration(): void {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lastPath = useRef<string | null>(null);

  // remember where we are, per history entry
  useEffect(() => {
    const onScroll = () => write(location.key, window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.key]);

  useLayoutEffect(() => {
    const pathChanged = lastPath.current !== location.pathname;
    lastPath.current = location.pathname;

    if (navigationType === "POP") {
      const saved = read(location.key);
      if (saved === null || saved <= 0) { if (pathChanged) window.scrollTo(0, 0); return; }
      let frame = 0;
      let cancelled = false;
      const startedAt = performance.now();
      const stop = () => { cancelled = true; };
      window.addEventListener("wheel", stop, { once: true, passive: true });
      window.addEventListener("touchstart", stop, { once: true, passive: true });
      window.addEventListener("keydown", stop, { once: true });
      const attempt = () => {
        if (cancelled) return;
        const tallEnough = document.documentElement.scrollHeight >= saved + window.innerHeight - 1;
        if (tallEnough || performance.now() - startedAt > 3000) { window.scrollTo(0, saved); return; }
        frame = requestAnimationFrame(attempt);
      };
      attempt();
      return () => {
        cancelled = true;
        cancelAnimationFrame(frame);
        window.removeEventListener("wheel", stop);
        window.removeEventListener("touchstart", stop);
        window.removeEventListener("keydown", stop);
      };
    }
    if (pathChanged) {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
      else window.scrollTo(0, 0);
    }
  }, [location.key, location.pathname, location.hash, navigationType]);
}
