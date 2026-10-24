/**
 * Showroom window: the car is parked at the right edge with only its nose in view. On hover,
 * keyboard focus or tap it slides into view and can be rotated (drag, or the rotate buttons).
 *
 *  - Imports nothing from three.js; the heavy scene is lazy-loaded on first interaction.
 *  - A WebGL canvas exists ONLY while engaged (+ a short exit animation): browsers cap live WebGL
 *    contexts (~16), so a permanent canvas per card would break a 20-car grid.
 *  - No WebGL / scene error -> the parked image simply stays. Respects prefers-reduced-motion.
 *  - Touch: tap toggles ("pinned"); a drag is not mistaken for a tap.
 *  - The toggle is a real <button>, and the rotate buttons are its siblings (never nested).
 */
import { RotateCcw, RotateCw } from "lucide-react";
import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { supportsWebGL } from "../../lib/webgl";
import { SceneErrorBoundary } from "./ErrorBoundary";

const CarCanvas = lazy(() => import("./CarCanvas"));

const EXIT_ANIMATION_MS = 700;
const YAW_STEP = Math.PI / 4;

export interface VehicleCard3DProps {
  /** Accessible name, e.g. "Toyota Camry". */
  label: string;
  /** What is shown while parked (usually <CarSilhouette/>). */
  parked: ReactNode;
  modelUrl?: string;
  color?: string;
  frontFixRad?: number;
  /** Grey-out and disable interaction (out of stock). */
  disabled?: boolean;
  className?: string;
}

/** True while `active`, and for `ms` after it turns false (lets the exit animation play). */
export function useLingering(active: boolean, ms: number): boolean {
  const [lingering, setLingering] = useState(active);
  useEffect(() => {
    if (active) { setLingering(true); return; }
    const id = window.setTimeout(() => setLingering(false), ms);
    return () => window.clearTimeout(id);
  }, [active, ms]);
  return lingering || active;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return; // jsdom / very old browsers
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function VehicleCard3D({ label, parked, modelUrl, color, frontFixRad, disabled = false, className = "" }: VehicleCard3DProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [yaw, setYaw] = useState(0);
  const pointerDownAt = useRef<{ x: number; y: number } | null>(null);

  const engaged = !disabled && !failed && (hovered || focused || pinned);
  const mounted = useLingering(engaged, EXIT_ANIMATION_MS) && supportsWebGL();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!mounted) { setCanvasReady(false); setYaw(0); } // parked image returns; next open starts fresh
  }, [mounted]);

  const togglePinned = () => setPinned((p) => !p);
  const rotate = (direction: 1 | -1) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation(); // do not let this click toggle the card
    setYaw((y) => y + direction * YAW_STEP);
  };

  return (
    <div
      className={`relative aspect-[4/3] w-full select-none overflow-hidden bg-gradient-to-b from-[#F7F9FB] to-[#E3E8EE] ${className}`}
      onPointerEnter={(e) => { if (e.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
      onPointerDown={(e) => { pointerDownAt.current = { x: e.clientX, y: e.clientY }; }}
      onClick={(e) => {
        const start = pointerDownAt.current;
        const dragged = start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6;
        if (!dragged) togglePinned(); // a drag-to-rotate must not count as a tap
      }}
    >
      {/* floor line: the one structural detail that makes the window read as a showroom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[22%] h-px bg-ink/10" aria-hidden="true" />

      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${canvasReady ? "opacity-0" : "opacity-100"}`}
      >
        {parked}
      </div>

      {mounted ? (
        <div className="absolute inset-0">
          <SceneErrorBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <CarCanvas
                engaged={engaged} reducedMotion={reducedMotion} yaw={yaw}
                modelUrl={modelUrl} color={color} frontFixRad={frontFixRad}
                onReady={() => setCanvasReady(true)}
              />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      ) : null}

      {!disabled ? (
        <button
          type="button" aria-pressed={pinned} aria-label={`${label}: 3D view`}
          // pointer-events-none: mouse/touch go to the wrapper (and the canvas for dragging); this button
          // exists for keyboard + screen-reader users, whose Enter/Space still fires its click.
          className="pointer-events-none absolute inset-0 opacity-0 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand focus-visible:ring-offset-0"
        />
      ) : null}

      {engaged ? (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-muted">
            Drag to rotate
          </span>
          <div className="absolute bottom-2 right-3 flex gap-1.5">
            <button type="button" onClick={rotate(-1)} aria-label={`Rotate ${label} left`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-card hover:bg-white">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={rotate(1)} aria-label={`Rotate ${label} right`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-card hover:bg-white">
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
