import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { VehicleActionsApi } from "../../hooks/useVehicleActions";
import { categoryLabel, vehicleName } from "../../lib/format";
import { isPurchasable } from "../../lib/stock";
import { buttonClass } from "../ui/Button";
import { StockTag } from "../ui/StockTag";
import { VehicleImage } from "../ui/VehicleImage";
import type { Featured } from "./FeaturedCarousel";
import { Price } from "./Price";

/**
 * A horizontal strip of vehicles using NATIVE scrolling: touch swipe, trackpad, scrollbar, and the keyboard
 * (focus the strip and use the arrow keys) all work, and vertical page scrolling is never intercepted. The
 * Previous/Next buttons are an extra convenience, and the orange rail shows how far you have travelled.
 */
export function InventoryStrip({ items, actions }: { items: Featured[]; actions: VehicleActionsApi }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max <= 0 ? 100 : Math.max(8, Math.min(100, (el.scrollLeft / max) * 100)));
    setEdge({ start: el.scrollLeft <= 1, end: max <= 0 || el.scrollLeft >= max - 1 });
  }, []);

  useEffect(() => { measure(); window.addEventListener("resize", measure); return () => window.removeEventListener("resize", measure); }, [measure, items.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? el.clientWidth * 0.8;
    el.scrollBy({ left: direction * card, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") { event.preventDefault(); scrollByCard(1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); scrollByCard(-1); }
  };

  return (
    <section aria-label="Featured inventory" className="border-b border-line bg-ink">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-charcoal px-4 py-3 lg:px-10">
        <div className="flex items-center gap-4">
          <span className="t-label font-bold text-signal">[ 02 — Featured ]</span>
          <h2 className="t-sm">Scroll to browse</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="icon-btn disabled:opacity-40" aria-label="Scroll featured vehicles left" disabled={edge.start} onClick={() => scrollByCard(-1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
          <button type="button" className="icon-btn disabled:opacity-40" aria-label="Scroll featured vehicles right" disabled={edge.end} onClick={() => scrollByCard(1)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-line" aria-hidden="true"><div className="h-full bg-signal transition-[width] duration-150" style={{ width: `${progress}%` }} /></div>

      <div
        ref={track} tabIndex={0} role="region" aria-label="Featured vehicles, scrollable. Use the left and right arrow keys."
        onScroll={measure} onKeyDown={onKeyDown}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar focus-visible:outline-offset-[-2px]"
      >
        {items.map(({ vehicle, extras }, i) => {
          const name = vehicleName(vehicle);
          const available = isPurchasable(vehicle.quantity);
          return (
            <article key={vehicle.id} data-card aria-label={name} className="group flex w-[82vw] max-w-[28rem] shrink-0 snap-start flex-col border-r border-line transition-colors hover:bg-elevated focus-within:bg-elevated sm:w-[26rem]">
              <div className="t-data flex items-center justify-between border-b border-line p-3">
                <span className="text-dim">UNIT // {String(i + 1).padStart(2, "0")}</span>
                <StockTag quantity={vehicle.quantity} />
              </div>
              <Link to={`/vehicle/${vehicle.id}`} aria-label={`View manifest: ${name}`} className="relative block h-64 overflow-hidden bg-charcoal">
                <VehicleImage src={vehicle.image_url} alt={name} soldOut={!available} position={extras.imagePosition} />
                {extras.tagline ? <span className="tag absolute left-3 top-3 border-line bg-ink text-dim">{extras.tagline}</span> : null}
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-4 border-t border-line p-5">
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="t-sm min-w-0">{name}</h3>
                    <Price rupees={vehicle.price} soldOut={!available} className="shrink-0 font-bold" />
                  </div>
                  <p className="t-label mt-2 text-dim">{[vehicle.year, extras.headline ?? categoryLabel(vehicle.category)].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line-subtle pt-4">
                  <Link to={`/vehicle/${vehicle.id}`} className={buttonClass("ghost", "sm")}>View manifest</Link>
                  <button
                    type="button" disabled={!available} onClick={(event) => actions.addToCart(vehicle, event.currentTarget.closest("article")?.querySelector("a") ?? null)}
                    className={buttonClass("signal", "sm")} aria-label={available ? `Add ${name} to cart` : `${name} cannot be added: out of stock`}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" /> {available ? "Add to cart" : "Sold out"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
