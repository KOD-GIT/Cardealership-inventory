import { Eye, Heart, Scale, ShoppingBag } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import type { CatalogueExtras } from "../../data/catalogue";
import type { VehicleActionsApi } from "../../hooks/useVehicleActions";
import { categoryLabel, stockRef, vehicleName } from "../../lib/format";
import { isPurchasable } from "../../lib/stock";
import type { Vehicle } from "../../types";
import { buttonClass } from "../ui/Button";
import { StockTag } from "../ui/StockTag";
import { VehicleImage } from "../ui/VehicleImage";
import { Price } from "./Price";

interface Props {
  vehicle: Vehicle;
  extras: CatalogueExtras;
  actions: VehicleActionsApi;
  /** Watchlist cells show a Remove-style heart, otherwise identical. */
  eagerImage?: boolean;
}

/**
 * One square cell of the inventory grid (adjoining cells share hairline borders; no floating cards).
 * Everything needed to decide is readable without hovering: stock reference, category, photo, name, price,
 * quantity and availability. Hover and focus only restore the photograph's natural colour.
 */
export function VehicleCell({ vehicle, extras, actions, eagerImage = false }: Props) {
  const photo = useRef<HTMLAnchorElement>(null);
  const name = vehicleName(vehicle);
  const available = isPurchasable(vehicle.quantity);
  const saved = actions.isSaved(vehicle.id);
  const compared = actions.isCompared(vehicle.id);
  const inCart = actions.cartQuantity(vehicle.id);

  return (
    <article aria-label={name} className="group relative flex flex-col border-b border-r border-line bg-ink transition-colors focus-within:bg-elevated hover:bg-elevated">
      <div className="t-data flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <span className="font-bold text-bone">STOCK {stockRef(vehicle.id)}</span>
        <span className="text-dim">{categoryLabel(vehicle.category)}</span>
      </div>

      <Link ref={photo} to={`/vehicle/${vehicle.id}`} aria-label={`View manifest: ${name}`} className="relative block aspect-[4/3] overflow-hidden bg-charcoal">
        <VehicleImage src={vehicle.image_url} alt={name} soldOut={!available} position={extras.imagePosition} eager={eagerImage} />
        {extras.newArrival ? <span className="tag absolute left-2 top-2 border-signal bg-ink text-signal">New arrival</span> : null}
        {!available ? <span className="tag absolute bottom-2 left-2 border-line-active bg-ink text-bone">Sold out</span> : null}
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <h2 className="t-sm text-bone">
            <Link to={`/vehicle/${vehicle.id}`} className="hover:text-signal">{name}</Link>
          </h2>
          <p className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            <Price rupees={vehicle.price} soldOut={!available} className="!text-xl" />
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <StockTag quantity={vehicle.quantity} />
            <span className="t-label text-dim">{vehicle.quantity} {vehicle.quantity === 1 ? "unit" : "units"}</span>
          </div>
          {inCart > 0 ? <p className="t-label mt-2 text-signal">{inCart} in your cart</p> : null}
        </div>

        <div className="border-t border-line-subtle pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Link to={`/vehicle/${vehicle.id}`} aria-label="View manifest" className={buttonClass("ghost", "sm")}>Manifest</Link>
            <button
              type="button" disabled={!available} onClick={() => actions.purchase(vehicle)}
              className={buttonClass("signal", "sm")} aria-label={available ? `Purchase ${name}` : `${name} is out of stock`}
            >
              {available ? "Purchase" : "Unavailable"}
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" className="icon-btn !h-10 flex-1" aria-pressed={saved} onClick={() => actions.toggleSave(vehicle)}
              aria-label={saved ? `Remove ${name} from watchlist` : `Save ${name} to watchlist`}>
              <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn !h-10 flex-1" aria-pressed={compared} onClick={() => actions.toggleCompare(vehicle)}
              aria-label={compared ? `Remove ${name} from comparison` : `Compare ${name}`}>
              <Scale className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn !h-10 flex-1" onClick={() => actions.quickView(vehicle.id)} aria-label={`Quick view: ${name}`}>
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button" className="icon-btn !h-10 flex-1 disabled:opacity-40" disabled={!available}
              onClick={() => actions.addToCart(vehicle, photo.current)} aria-label={available ? `Add ${name} to cart` : `${name} cannot be added: out of stock`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
