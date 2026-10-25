import { ArrowLeft, Heart, Scale, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MovementsTable } from "../components/admin/MovementsTable";
import { Button, buttonClass } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../components/ui/States";
import { StockTag } from "../components/ui/StockTag";
import { Tabs } from "../components/ui/Tabs";
import { Gallery } from "../components/vehicles/Gallery";
import { Price } from "../components/vehicles/Price";
import { ShareButton } from "../components/vehicles/ShareButton";
import { SpecTable } from "../components/vehicles/SpecTable";
import { useAuth } from "../context/AuthContext";
import { galleryFor } from "../data/catalogue";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useActivity, useExtras, useRecentlyViewed } from "../hooks/useShop";
import { useVehicleActions } from "../hooks/useVehicleActions";
import { useInventory } from "../hooks/useVehicles";
import { categoryLabel, stockRef, vehicleName } from "../lib/format";
import { isPurchasable } from "../lib/stock";
import { LAST_FLOOR_KEY } from "./FloorPage";

/** "Back to the floor" returns to the filters, sort and page you left (remembered by the Floor page). */
function floorLink(): string {
  let saved = "";
  try { saved = sessionStorage.getItem(LAST_FLOOR_KEY) ?? ""; } catch { /* storage unavailable */ }
  const query = new URLSearchParams(saved).toString();
  return query ? `/floor?${query}` : "/floor";
}

export default function VehiclePage() {
  const { id: rawId } = useParams();
  const id = /^\d+$/.test(rawId ?? "") ? Number(rawId) : null;
  const { isAdmin } = useAuth();
  const inventory = useInventory();
  const { extrasFor } = useExtras();
  const actions = useVehicleActions();
  const recent = useRecentlyViewed();
  const activity = useActivity();
  const [tab, setTab] = useState("overview");

  const vehicle = id === null ? undefined : inventory.byId.get(id);
  const extras = vehicle ? extrasFor(vehicle) : null;
  useDocumentTitle(vehicle ? vehicleName(vehicle) : "Vehicle");

  const { record } = recent;
  useEffect(() => { if (vehicle) record(vehicle.id); }, [vehicle?.id, record]); // eslint-disable-line react-hooks/exhaustive-deps

  const movements = useMemo(() => activity.movements.filter((movement) => movement.vehicleId === id), [activity.movements, id]);

  if (inventory.isLoading) {
    return <div className="grid gap-px p-4 lg:grid-cols-2 lg:p-10"><Skeleton className="aspect-[16/10] w-full" /><Skeleton className="h-96 w-full" /></div>;
  }
  if (inventory.isError) {
    return <div className="p-4 lg:p-10"><ErrorState message="The vehicle could not be loaded." onRetry={() => inventory.refetch()} /></div>;
  }
  if (!vehicle || !extras) {
    return (
      <div className="p-4 lg:p-10">
        <EmptyState title="Vehicle not found" action={{ label: "Back to the floor", to: floorLink() }}>
          That link does not match a vehicle on the floor. It may have been sold out of the catalogue or removed by an administrator.
        </EmptyState>
      </div>
    );
  }

  const name = vehicleName(vehicle);
  const available = isPurchasable(vehicle.quantity);
  const saved = actions.isSaved(vehicle.id);
  const compared = actions.isCompared(vehicle.id);
  const inCart = actions.cartQuantity(vehicle.id);
  const highlights = Object.entries(extras.specs).slice(0, 4);

  const tabs = [
    {
      id: "overview", label: "Overview",
      content: (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <h2 className="t-md">About this vehicle</h2>
            <p className="max-w-2xl text-lg leading-7 text-dim">
              {vehicle.year ? `${vehicle.year} ` : ""}{name}, {categoryLabel(vehicle.category).toLowerCase()}. Listed at{" "}
              <Price rupees={vehicle.price} className="!text-lg text-bone" /> with {vehicle.quantity} {vehicle.quantity === 1 ? "unit" : "units"} in stock.
              {extras.headline ? ` ${extras.headline}.` : ""}
            </p>
            <p className="max-w-2xl text-dim">The specification tab lists everything the dealership holds for this model. Items marked “Not provided” are simply not on record.</p>
          </div>
          <aside className="border border-line bg-charcoal p-5">
            <h3 className="t-label mb-3 text-dim">How buying works</h3>
            <p className="text-sm text-dim">“Purchase now” records a sale for one unit and reduces the stock by one. The cart lets you choose quantities first. No payment details are collected, and nothing is reserved until you confirm.</p>
          </aside>
          {highlights.length > 0 ? (
            <dl className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
              {highlights.map(([label, value]) => (
                <div key={label} className="bg-ink p-4"><dt className="t-label text-dim">{label}</dt><dd className="t-data mt-1 text-base">{value}</dd></div>
              ))}
            </dl>
          ) : null}
        </div>
      ),
    },
    { id: "specs", label: "Specifications", content: <SpecTable vehicle={vehicle} extras={extras} /> },
    ...(isAdmin ? [{
      id: "movements", label: "Stock movements",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted">Administrator view. Recorded by this application on this device (demonstration data), not a server audit log.</p>
          <MovementsTable movements={movements} showVehicle={false} empty="No movements for this vehicle have been recorded on this device yet." />
        </div>
      ),
    }] : []),
  ];

  return (
    <article aria-label={name}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 lg:px-10">
        <nav aria-label="Breadcrumb">
          <ol className="t-label flex flex-wrap items-center gap-2 text-dim">
            <li><Link to={floorLink()} className="hover:text-bone">The Floor</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to={`/floor?cat=${vehicle.category}`} className="hover:text-bone">{categoryLabel(vehicle.category)}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-bone">{name}</li>
          </ol>
        </nav>
        <Link to={floorLink()} className={buttonClass("ghost", "sm")}><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the floor</Link>
      </div>

      <div className="grid lg:grid-cols-12">
        <div className="border-b border-line p-4 lg:col-span-7 lg:border-b-0 lg:border-r lg:p-10">
          <Gallery images={galleryFor(vehicle, extras)} name={name} soldOut={!available} position={extras.imagePosition} />
        </div>

        <div className="flex flex-col gap-6 p-4 lg:col-span-5 lg:p-10">
          <div className="t-data flex flex-wrap items-center justify-between gap-2 text-dim">
            <span>STOCK {stockRef(vehicle.id)} · {categoryLabel(vehicle.category)}</span>
            <StockTag quantity={vehicle.quantity} />
          </div>
          <h1 className="t-xl break-words">{name}</h1>
          <div>
            <p className="t-label text-dim">Price</p>
            <p className="font-display text-4xl font-extrabold tracking-tight"><Price rupees={vehicle.price} soldOut={!available} className="!text-3xl font-bold sm:!text-4xl" /></p>
          </div>

          <dl className="grid grid-cols-2 gap-px border border-line bg-line">
            <div className="bg-charcoal p-4"><dt className="t-label text-dim">Units in stock</dt><dd className="t-data mt-1 text-xl font-bold">{vehicle.quantity}</dd></div>
            <div className="bg-charcoal p-4"><dt className="t-label text-dim">Model year</dt><dd className="t-data mt-1 text-xl font-bold">{vehicle.year ?? "Not provided"}</dd></div>
          </dl>
          {!available ? <p role="status" className="border border-line-active bg-charcoal p-4 text-dim">This vehicle is out of stock. You can still read everything about it, save it or compare it, but it cannot be purchased or added to the cart.</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="signal" disabled={!available} onClick={() => actions.addToCart(vehicle, document.getElementById("vehicle-photo"))}>
              <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to cart
            </Button>
            <Button variant="ghost" disabled={!available} onClick={() => actions.purchase(vehicle)}>Purchase now</Button>
            <Button variant="ghost" aria-pressed={saved} onClick={() => actions.toggleSave(vehicle)}>
              <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" /> {saved ? "Saved to watchlist" : "Save to watchlist"}
            </Button>
            <Button variant="ghost" aria-pressed={compared} onClick={() => actions.toggleCompare(vehicle)}>
              <Scale className="h-4 w-4" aria-hidden="true" /> {compared ? "In comparison" : "Compare"}
            </Button>
          </div>
          {inCart > 0 ? <p className="t-label text-signal">{inCart} in your cart. <Link to="/cart" className="underline underline-offset-4">View cart</Link></p> : null}
          <ShareButton vehicleId={vehicle.id} name={name} />
        </div>
      </div>

      <div className="border-t border-line px-4 py-10 lg:px-10">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>
    </article>
  );
}
