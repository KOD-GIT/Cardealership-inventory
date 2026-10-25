import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { buttonClass } from "../components/ui/Button";
import { Marquee, Star } from "../components/ui/Marquee";
import { ErrorState } from "../components/ui/States";
import { Skeleton } from "../components/ui/Skeleton";
import { VehicleImage } from "../components/ui/VehicleImage";
import { VehicleCell } from "../components/vehicles/VehicleCell";
import { FeaturedCarousel, type Featured } from "../components/vehicles/FeaturedCarousel";
import { InventoryStrip } from "../components/vehicles/InventoryStrip";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useExtras, useRecentlyViewed } from "../hooks/useShop";
import { useVehicleActions } from "../hooks/useVehicleActions";
import { useInventory } from "../hooks/useVehicles";
import { inventoryMetrics } from "../lib/browse";
import { LOW_STOCK_THRESHOLD } from "../lib/stock";

const STRIP_LIMIT = 10;

export default function HomePage() {
  useDocumentTitle("Stock, not theatre");
  const { user, isAdmin } = useAuth();
  const inventory = useInventory();
  const { extrasFor } = useExtras();
  const actions = useVehicleActions();
  const recent = useRecentlyViewed();

  const featured = useMemo<Featured[]>(() => {
    const withExtras = inventory.vehicles.map((vehicle) => ({ vehicle, extras: extrasFor(vehicle) }));
    return withExtras
      .filter((item) => item.extras.featured)
      .sort((a, b) => (a.extras.carouselOrder ?? Infinity) - (b.extras.carouselOrder ?? Infinity) || a.vehicle.id - b.vehicle.id);
  }, [inventory.vehicles, extrasFor]);

  // The strip shows the featured vehicles first, then the rest, newest arrivals first.
  const strip = useMemo<Featured[]>(() => {
    const featuredIds = new Set(featured.map((item) => item.vehicle.id));
    const rest = inventory.vehicles
      .filter((vehicle) => !featuredIds.has(vehicle.id))
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || b.id - a.id)
      .map((vehicle) => ({ vehicle, extras: extrasFor(vehicle) }));
    return [...featured, ...rest].slice(0, STRIP_LIMIT);
  }, [featured, inventory.vehicles, extrasFor]);

  const metrics = useMemo(() => inventoryMetrics(inventory.vehicles, LOW_STOCK_THRESHOLD), [inventory.vehicles]);
  const ready = Boolean(user) && inventory.isSuccess;

  return (
    <>
      {/* 01 · SPLIT HERO */}
      <section aria-labelledby="hero-title" className="grid border-b border-line lg:min-h-[calc(100vh-4rem)] lg:grid-cols-12">
        <div className="flex flex-col justify-between gap-12 border-b border-line p-4 py-10 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-10">
          <div>
            <p className="t-label mb-8 flex flex-wrap items-center gap-2 text-dim">
              <span aria-hidden="true" className="h-2 w-2 bg-signal" />
              The floor
              {ready ? <span className="text-muted">/ {metrics.models} models · {metrics.units} units</span> : null}
            </p>
            <h1 id="hero-title" className="t-display mb-8 select-none">
              <span className="block">Stock,</span>{" "}
              <span className="t-outline block">Not</span>{" "}
              <span className="block">Theatre.</span>
            </h1>
            <p className="max-w-xl text-lg leading-7 text-dim">
              A car dealership inventory with no checkout pantomime. Browse the floor, drop what you like in the cart, and watch the
              stock count move by one.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Link to="/floor" className={buttonClass("signal", "md", "!px-8 hover:translate-x-1")}>Enter the floor <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            {!user ? <Link to="/login" className={buttonClass("ghost")}>Sign in</Link> : null}
            {user && isAdmin ? <Link to="/ledger" className={buttonClass("ghost")}>Read the ledger</Link> : null}
            {user && !isAdmin ? <Link to="/watchlist" className={buttonClass("ghost")}>Your watchlist</Link> : null}
          </div>
        </div>

        <div className="min-h-[34rem] bg-charcoal lg:col-span-5">
          {!user ? <GuestPlate /> : inventory.isLoading ? <Skeleton className="h-full min-h-[34rem] w-full" /> : inventory.isError ? (
            <div className="p-6"><ErrorState message="The inventory could not be loaded." onRetry={() => inventory.refetch()} /></div>
          ) : featured.length > 0 ? <FeaturedCarousel items={featured} /> : (
            <div className="flex h-full min-h-[34rem] items-center p-8"><p className="t-md text-dim">No vehicles are featured right now. Enter the floor to see everything.</p></div>
          )}
        </div>
      </section>

      {/* 02 · TICKER */}
      <Marquee label="Inventory ticker" className="border-b border-line bg-ink py-3">
        <span className="t-lg flex items-center gap-8">
          {ready ? `${metrics.models} on the floor` : "Stock, not theatre"} <Star />
          <span className="t-outline-dim">A purchase moves one unit</span> <Star />
        </span>
      </Marquee>

      {/* 03 · STRIP (signed-in only: the API needs a login) */}
      {ready && strip.length > 0 ? <InventoryStrip items={strip} actions={actions} /> : null}
      {!user ? (
        <section aria-label="Inventory" className="border-b border-line bg-ink px-4 py-16 lg:px-10">
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-5">
            <span aria-hidden="true" className="h-3 w-3 bg-signal" />
            <h2 className="t-lg">The floor is for signed-in visitors</h2>
            <p className="text-dim">Prices and stock come straight from the dealership system, which asks you to sign in first. Registration takes a minute and never asks for payment details.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className={buttonClass("signal")}>Create an account</Link>
              <Link to="/login" state={{ from: "/floor" }} className={buttonClass("ghost")}>Sign in</Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* 04 · MANIFESTO */}
      <section aria-label="What we stand for" className="border-b border-line bg-signal text-signal-ink selection:bg-ink selection:text-bone">
        <div className="grid md:grid-cols-3">
          {[
            ["01 / 03", "Identity", "Every build begins with the person behind the wheel: their taste, their road, their presence.", "Core protocol"],
            ["02 / 03", "Insight", "Exterior, interior and performance resolved as one considered, detailed vision.", "Mechanical rigour"],
            ["03 / 03", "Cohesion", "Nothing is added for effect. Every detail earns its place or it is removed.", "Zero surplus"],
          ].map(([n, title, body, foot], i) => (
            <div key={title} className={`flex min-h-[16rem] flex-col justify-between p-6 lg:p-10 ${i < 2 ? "border-b border-signal-ink/25 md:border-b-0 md:border-r" : ""}`}>
              <span className="t-label font-bold opacity-80">{n}</span>
              <div className="space-y-3"><h2 className="t-lg">{title}</h2><p className="max-w-xs leading-6 opacity-90">{body}</p></div>
              <span className="t-label border-t border-signal-ink/20 pt-4 opacity-80">{foot}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 05 · LIVE NUMBERS (computed from the shared inventory) */}
      {ready ? (
        <section aria-label="Inventory at a glance" className="border-b border-line">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            <Kpi label="Models on the floor" value={metrics.models} />
            <Kpi label="Units in stock" value={metrics.units} />
            <Kpi label={`Low stock (${LOW_STOCK_THRESHOLD} or fewer)`} value={metrics.low} accent={metrics.low > 0} />
            <Kpi label="Out of stock" value={metrics.out} accent={metrics.out > 0} last />
          </div>
        </section>
      ) : null}

      {/* 06 · RECENTLY VIEWED */}
      {user && recent.vehicles.length > 0 ? (
        <section aria-labelledby="recent-title" className="border-b border-line">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-charcoal px-4 py-3 lg:px-10">
            <h2 id="recent-title" className="t-sm">Recently viewed</h2>
            <button type="button" onClick={recent.clear} className="t-label min-h-[2.75rem] px-2 text-signal underline underline-offset-4">Clear history</button>
          </div>
          <div className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {recent.vehicles.map((vehicle) => <VehicleCell key={vehicle.id} vehicle={vehicle} extras={extrasFor(vehicle)} actions={actions} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}

function Kpi({ label, value, accent = false, last = false }: { label: string; value: number; accent?: boolean; last?: boolean }) {
  return (
    <div className={`flex min-h-[11rem] flex-col justify-between border-b border-line p-6 lg:border-b-0 lg:p-8 ${last ? "" : "border-r"} ${accent ? "bg-charcoal" : ""}`}>
      <span className={`t-label ${accent ? "font-bold text-signal" : "text-dim"}`}>{label}</span>
      <span className={`font-display text-6xl font-extrabold tabular-nums tracking-tighter lg:text-7xl ${accent ? "text-signal" : ""}`}>{value}</span>
    </div>
  );
}

/** What a signed-out visitor sees on the right of the hero: a labelled photograph and a way in. No stock claims. */
function GuestPlate() {
  return (
    <div className="flex h-full min-h-[34rem] flex-col">
      <p className="t-data border-b border-line p-4 text-dim">FIG. 01 — AUDI R8 COUPÉ V10</p>
      <div className="relative flex-1 overflow-hidden bg-ink"><VehicleImage src="/images/vehicles/audi-r8-v10.jpg" alt="Audi R8 Coupé V10 in a concrete hall" eager /></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-ink p-5">
        <p className="t-label text-dim">Sign in to see live prices and stock</p>
        <Link to="/login" state={{ from: "/floor" }} className={buttonClass("signal", "sm")}>Sign in</Link>
      </div>
    </div>
  );
}
