import { Heart, Scale, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useShopUi } from "../../context/ShopUiContext";
import { useExtras } from "../../hooks/useShop";
import { useVehicleActions } from "../../hooks/useVehicleActions";
import { useInventory } from "../../hooks/useVehicles";
import { categoryLabel, stockRef, vehicleName } from "../../lib/format";
import { isPurchasable } from "../../lib/stock";
import { Button, buttonClass } from "../ui/Button";
import { Drawer } from "../ui/Modal";
import { StockTag } from "../ui/StockTag";
import { VehicleImage } from "../ui/VehicleImage";
import { Price } from "./Price";

/**
 * A side panel with the essentials and every action, so you can decide without leaving the Floor. Closing it
 * leaves the filters, page and scroll position exactly as they were (it is not a route).
 */
export function QuickViewDrawer() {
  const { quickViewId, closeQuickView } = useShopUi();
  const { byId } = useInventory();
  const { extrasFor } = useExtras();
  const actions = useVehicleActions();
  const vehicle = quickViewId === null ? undefined : byId.get(quickViewId);
  const extras = vehicle ? extrasFor(vehicle) : null;

  if (!vehicle || !extras) return <Drawer open={false} onClose={closeQuickView} title="Quick view"><span /></Drawer>;

  const name = vehicleName(vehicle);
  const available = isPurchasable(vehicle.quantity);
  const saved = actions.isSaved(vehicle.id);
  const compared = actions.isCompared(vehicle.id);
  const specs = Object.entries(extras.specs).slice(0, 5);

  return (
    <Drawer
      open onClose={closeQuickView} title={name} closeLabel="Close quick view" width="max-w-lg"
      description={`STOCK ${stockRef(vehicle.id)} · ${categoryLabel(vehicle.category)}${vehicle.year ? ` · ${vehicle.year}` : ""}`}
      footer={(
        <div className="grid grid-cols-2 gap-2">
          <Button variant="signal" disabled={!available} onClick={() => actions.addToCart(vehicle, document.getElementById("quick-photo"))}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Add to cart
          </Button>
          <Button variant="ghost" disabled={!available} onClick={() => { closeQuickView(); actions.purchase(vehicle); }}>Purchase now</Button>
          <Button variant="ghost" aria-pressed={saved} onClick={() => actions.toggleSave(vehicle)}>
            <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} aria-hidden="true" /> {saved ? "Saved" : "Save"}
          </Button>
          <Button variant="ghost" aria-pressed={compared} onClick={() => actions.toggleCompare(vehicle)}>
            <Scale className="h-4 w-4" aria-hidden="true" /> {compared ? "In compare" : "Compare"}
          </Button>
          <Link to={`/vehicle/${vehicle.id}`} onClick={closeQuickView} className={buttonClass("ghost", "md", "col-span-2")}>View full manifest</Link>
        </div>
      )}
    >
      <div id="quick-photo" className="aspect-[4/3] w-full overflow-hidden border-b border-line bg-charcoal">
        <VehicleImage src={vehicle.image_url} alt={name} soldOut={!available} position={extras.imagePosition} eager active />
      </div>
      <div className="space-y-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Price rupees={vehicle.price} soldOut={!available} className="!text-2xl font-bold" />
          <StockTag quantity={vehicle.quantity} />
        </div>
        {extras.headline ? <p className="t-label text-dim">{extras.headline}</p> : null}
        <dl className="divide-y divide-line border border-line">
          {specs.length === 0 ? (
            <div className="p-3 text-sm text-dim">Specifications: Not provided</div>
          ) : specs.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 p-3 text-sm"><dt className="text-dim">{label}</dt><dd className="t-data text-right">{value}</dd></div>
          ))}
        </dl>
        {!available ? <p className="text-sm text-dim">This vehicle is out of stock. You can still view it, save it or compare it.</p> : null}
      </div>
    </Drawer>
  );
}
