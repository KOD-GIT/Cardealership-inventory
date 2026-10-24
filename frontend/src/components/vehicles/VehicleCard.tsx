import { Ban, ShoppingBag } from "lucide-react";
import { carColor } from "../../lib/carColor";
import { categoryLabel, formatPrice } from "../../lib/format";
import { stockStatus } from "../../lib/stock";
import type { Vehicle } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { VehicleCard3D } from "../vehicle3d/VehicleCard3D";
import { ParkedVisual } from "./ParkedVisual";
import { StockBadge } from "./StockBadge";

interface Props {
  vehicle: Vehicle;
  onPurchase: (vehicle: Vehicle) => void;
  purchasing?: boolean;
}

export function VehicleCard({ vehicle, onPurchase, purchasing = false }: Props) {
  const soldOut = stockStatus(vehicle.quantity).level === "out";
  const label = `${vehicle.make} ${vehicle.model}`;
  return (
    <article
      aria-label={label}
      className="overflow-hidden rounded-xl border border-line bg-white shadow-card transition-shadow hover:shadow-lift focus-within:shadow-lift"
    >
      <VehicleCard3D
        label={label} disabled={soldOut} color={carColor(vehicle.id)}
        parked={<ParkedVisual vehicle={vehicle} muted={soldOut} />}
      />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-muted">{vehicle.make}</p>
          <StockBadge quantity={vehicle.quantity} />
        </div>
        <h3 className="font-display text-2xl font-bold leading-tight">{vehicle.model}</h3>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Badge>{categoryLabel(vehicle.category)}</Badge>
          {vehicle.year ? <span>{vehicle.year}</span> : null}
        </div>
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">Price</span>
          <span className="font-display text-3xl font-bold text-brand">{formatPrice(vehicle.price)}</span>
        </div>
        <Button
          disabled={soldOut} loading={purchasing} onClick={() => onPurchase(vehicle)}
          aria-label={soldOut ? `${label} is unavailable` : `Purchase ${label}`}
          className="w-full"
        >
          {soldOut ? <Ban className="h-4 w-4" aria-hidden="true" /> : <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
          {soldOut ? "Unavailable" : "Purchase"}
        </Button>
      </div>
    </article>
  );
}
