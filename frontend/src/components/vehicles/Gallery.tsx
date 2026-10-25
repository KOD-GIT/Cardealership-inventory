import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { type KeyboardEvent, type TouchEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useOverlayBehavior } from "../ui/Modal";
import { VehicleImage } from "../ui/VehicleImage";

interface Props {
  images: string[];
  name: string;
  soldOut?: boolean;
  /** CSS object-position for the main photograph */
  position?: string | null;
}

const SWIPE_PX = 40;
const pad = (n: number) => String(n).padStart(2, "0");

/** Horizontal swipe on touch screens: returns handlers that call prev/next. */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null);
  return {
    onTouchStart: (event: TouchEvent) => { startX.current = event.touches[0]?.clientX ?? null; },
    onTouchEnd: (event: TouchEvent) => {
      if (startX.current === null) return;
      const dx = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current;
      startX.current = null;
      if (Math.abs(dx) >= SWIPE_PX) (dx < 0 ? onNext : onPrev)();
    },
  };
}

/**
 * The vehicle's photographs: large view, thumbnails, previous/next, "01 / 04" counter, arrow keys, swipe and a
 * fullscreen viewer. With a single photograph all the carousel controls disappear. With none, a deliberate
 * placeholder shows instead.
 */
export function Gallery({ images, name, soldOut = false, position }: Props) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const count = images.length;
  const multiple = count > 1;
  const current = Math.min(index, Math.max(count - 1, 0));
  const go = (next: number) => setIndex((next + count) % count);
  const swipe = useSwipe(() => go(current - 1), () => go(current + 1));

  useEffect(() => { setIndex(0); }, [images.join("|")]); // a different vehicle starts at its first photo

  const onKeyDown = (event: KeyboardEvent) => {
    if (!multiple) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); go(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); go(current + 1); }
  };

  return (
    <section aria-label={`${name} photographs`} onKeyDown={onKeyDown}>
      <div id="vehicle-photo" className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-charcoal" {...swipe}>
        <VehicleImage src={images[current]} alt={`${name}: photograph ${current + 1} of ${Math.max(count, 1)}`} soldOut={soldOut} position={current === 0 ? position : null} eager active />
        {count > 0 ? (
          <button type="button" onClick={() => setZoom(true)} aria-label="Open fullscreen viewer" className="icon-btn absolute right-3 top-3 bg-ink">
            <Expand className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
        {multiple ? (
          <>
            <button type="button" onClick={() => go(current - 1)} aria-label="Previous photograph" className="icon-btn absolute left-3 top-1/2 -translate-y-1/2 bg-ink"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => go(current + 1)} aria-label="Next photograph" className="icon-btn absolute right-3 top-1/2 -translate-y-1/2 bg-ink"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
            <p className="t-data absolute bottom-3 left-3 border border-line bg-ink px-2 py-1" aria-live="polite">{pad(current + 1)} / {pad(count)}</p>
          </>
        ) : null}
      </div>

      {multiple ? (
        <ul className="mt-px flex overflow-x-auto border-x border-b border-line no-scrollbar" aria-label="Photograph thumbnails">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button" onClick={() => setIndex(i)} aria-label={`Show photograph ${i + 1} of ${count}`} aria-current={i === current ? "true" : undefined}
                className={`block h-20 w-28 overflow-hidden border-r border-line ${i === current ? "outline outline-2 -outline-offset-2 outline-signal" : "opacity-80 hover:opacity-100"}`}
              >
                <VehicleImage src={src} alt="" soldOut={soldOut} active={i === current} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {zoom ? <Lightbox images={images} startIndex={current} name={name} onClose={() => setZoom(false)} onIndex={setIndex} /> : null}
    </section>
  );
}

function Lightbox({ images, startIndex, name, onClose, onIndex }: { images: string[]; startIndex: number; name: string; onClose: () => void; onIndex: (i: number) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const count = images.length;
  const multiple = count > 1;
  const go = (next: number) => { const wrapped = (next + count) % count; setIndex(wrapped); onIndex(wrapped); };
  const swipe = useSwipe(() => go(index - 1), () => go(index + 1));
  useOverlayBehavior(true, panel, onClose);

  useEffect(() => {
    if (!multiple) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === "ArrowRight") go(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return createPortal(
    <div ref={panel} role="dialog" aria-modal="true" aria-label={`${name} photograph viewer`} tabIndex={-1} className="fixed inset-0 z-[60] flex flex-col bg-ink animate-fade-in" {...swipe}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="t-data">{multiple ? `${pad(index + 1)} / ${pad(count)}` : name}</p>
        <button type="button" onClick={onClose} aria-label="Close viewer" className="icon-btn"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <div className="relative min-h-0 flex-1">
        <img src={images[index]} alt={`${name}: photograph ${index + 1} of ${count}`} className="absolute inset-0 h-full w-full object-contain p-2" />
        {multiple ? (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photograph" className="icon-btn absolute left-3 top-1/2 -translate-y-1/2 bg-ink"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photograph" className="icon-btn absolute right-3 top-1/2 -translate-y-1/2 bg-ink"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          </>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
