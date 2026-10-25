import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CatalogueExtras } from "../../data/catalogue";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { categoryLabel, stockRef, vehicleName } from "../../lib/format";
import { isPurchasable } from "../../lib/stock";
import type { Vehicle } from "../../types";
import { buttonClass } from "../ui/Button";
import { StockTag } from "../ui/StockTag";
import { VehicleImage } from "../ui/VehicleImage";
import { Price } from "./Price";

export interface Featured { vehicle: Vehicle; extras: CatalogueExtras }

const AUTOPLAY_MS = 7000;

/**
 * The hero's featured-vehicle plate. Several vehicles can be featured: previous/next, clickable indicators and an
 * "Explore vehicle" link. The plate keeps the same size for every slide (no layout jump). Autoplay pauses when
 * you hover, focus inside it or press Pause, and does not run at all if you prefer reduced motion.
 */
export function FeaturedCarousel({ items }: { items: Featured[] }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const count = items.length;
  const current = Math.min(index, Math.max(count - 1, 0));
  const autoplay = count > 1 && !reduced && !userPaused && !interacting;

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, count, current]);

  if (count === 0) return null;
  const { vehicle, extras } = items[current];
  const name = vehicleName(vehicle);
  const available = isPurchasable(vehicle.quantity);
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <section
      aria-roledescription="carousel" aria-label="Featured vehicles"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInteracting(false); }}
      className="group flex h-full flex-col bg-charcoal"
    >
      <div className="t-data flex items-center justify-between gap-3 border-b border-line p-4">
        <span className="text-dim">FIG. {String(current + 1).padStart(2, "0")} — {name.toUpperCase()}</span>
        <StockTag quantity={vehicle.quantity} />
      </div>

      <div className="relative min-h-[22rem] flex-1 overflow-hidden bg-ink" aria-live={autoplay ? "off" : "polite"} aria-atomic="true">
        <div role="group" aria-roledescription="slide" aria-label={`${current + 1} of ${count}`} className="absolute inset-0">
          <VehicleImage src={vehicle.image_url} alt={name} soldOut={!available} position={extras.imagePosition} eager />
        </div>
        <span className="t-data absolute left-4 top-4 hidden border border-line bg-ink px-2 py-1 text-dim sm:block">STOCK {stockRef(vehicle.id)} · {categoryLabel(vehicle.category)}</span>
        {extras.tagline ? <span className="tag absolute bottom-4 right-4 border-line-active bg-ink text-bone">{extras.tagline}</span> : null}
      </div>

      <div className="flex flex-col gap-4 border-t border-line bg-ink p-5 lg:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="t-md min-w-0 truncate">{name}</h2>
          <Price rupees={vehicle.price} soldOut={!available} className="!text-xl font-bold text-signal" />
        </div>
        <p className="t-label min-h-[1rem] text-dim">{[vehicle.year, extras.headline].filter(Boolean).join(" · ") || categoryLabel(vehicle.category)}</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={`/vehicle/${vehicle.id}`} className={buttonClass("signal")}>Explore vehicle <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          {count > 1 ? (
            <div className="flex items-center gap-2">
              <button type="button" className="icon-btn" aria-label="Previous featured vehicle" onClick={() => go(current - 1)}><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button>
              <ol className="flex items-center" aria-label="Choose featured vehicle">
                {items.map((item, i) => (
                  <li key={item.vehicle.id}>
                    <button
                      type="button" onClick={() => setIndex(i)} aria-label={`Show featured vehicle ${i + 1}: ${vehicleName(item.vehicle)}`} aria-current={i === current ? "true" : undefined}
                      className="flex h-11 w-7 items-center justify-center"
                    >
                      <span className={`block h-1.5 transition-all ${i === current ? "w-6 bg-signal" : "w-3 bg-line-active"}`} />
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" className="icon-btn" aria-label="Next featured vehicle" onClick={() => go(current + 1)}><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
              {!reduced ? (
                <button type="button" className="icon-btn" aria-pressed={userPaused} aria-label={userPaused ? "Play automatic slideshow" : "Pause automatic slideshow"} onClick={() => setUserPaused((p) => !p)}>
                  {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
