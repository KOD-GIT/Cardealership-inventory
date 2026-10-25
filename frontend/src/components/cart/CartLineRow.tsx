import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { vehicleName } from "../../lib/format";
import type { CartLine } from "../../lib/cart";
import { formatInr } from "../../lib/money";
import { VehicleImage } from "../ui/VehicleImage";

interface Props {
  line: CartLine;
  onQuantity: (vehicleId: number, quantity: number) => void;
  onRemove: (vehicleId: number) => void;
}

/** One cart line: photo, name, unit price, stock-limited quantity, line total and Remove. */
export function CartLineRow({ line, onQuantity, onRemove }: Props) {
  const { vehicle, item } = line;
  const name = vehicle ? vehicleName(vehicle) : "Vehicle no longer available";

  return (
    <li className="flex gap-4 border-b border-line p-4">
      <div className="h-24 w-28 shrink-0 overflow-hidden border border-line bg-charcoal">
        {vehicle ? <VehicleImage src={vehicle.image_url} alt={name} soldOut={line.status === "unavailable"} /> : <VehicleImage src={null} alt={name} />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {vehicle ? <Link to={`/vehicle/${vehicle.id}`} className="t-sm block break-words hover:text-signal">{name}</Link> : <p className="t-sm">{name}</p>}
            {vehicle ? <p className="t-data text-dim">{formatInr(line.unitPaise)} each</p> : null}
          </div>
          <button type="button" onClick={() => onRemove(item.vehicleId)} aria-label={`Remove ${name} from cart`} className="icon-btn !h-10 !w-10">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {line.status === "missing" ? <p role="status" className="text-sm text-signal">This vehicle was removed from the inventory. Remove it from your cart.</p> : null}
        {line.status === "unavailable" ? <p role="status" className="text-sm text-signal">Out of stock now, so this line cannot be purchased.</p> : null}
        {line.status === "reduced" ? <p role="status" className="text-sm text-signal">Only {line.maxQuantity} in stock now. You will buy {line.quantity}.</p> : null}

        {line.quantity > 0 ? (
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center" role="group" aria-label={`Quantity for ${name}`}>
              <button type="button" className="icon-btn !h-10 !w-10" aria-label={`Decrease quantity of ${name}`} disabled={line.quantity <= 1}
                onClick={() => onQuantity(item.vehicleId, line.quantity - 1)}>
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output aria-live="polite" className="t-data -mx-px flex h-10 min-w-[2.75rem] items-center justify-center border border-line px-2">{line.quantity}</output>
              <button type="button" className="icon-btn !h-10 !w-10" aria-label={`Increase quantity of ${name}`} disabled={line.quantity >= line.maxQuantity}
                onClick={() => onQuantity(item.vehicleId, line.quantity + 1)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p className="t-data font-bold" aria-label={`Line total ${formatInr(line.lineTotalPaise)}`}>{formatInr(line.lineTotalPaise)}</p>
          </div>
        ) : null}
        {line.quantity > 0 && line.quantity >= line.maxQuantity ? <p className="t-label text-muted">Maximum available</p> : null}
      </div>
    </li>
  );
}
