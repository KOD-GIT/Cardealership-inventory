import { PackagePlus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { carColor } from "../../lib/carColor";
import { categoryLabel, formatPrice } from "../../lib/format";
import { stockStatus } from "../../lib/stock";
import type { Vehicle } from "../../types";
import { Badge } from "../ui/Badge";
import { CarSilhouette } from "../vehicle3d/CarSilhouette";
import { StockBadge } from "../vehicles/StockBadge";

interface Props {
  vehicles: Vehicle[];
  onRestock: (v: Vehicle) => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
}

function Thumb({ vehicle }: { vehicle: Vehicle }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-[#F7F9FB] to-[#E3E8EE]">
      {vehicle.image_url && !failed ? (
        <img src={vehicle.image_url} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : (
        <CarSilhouette color={carColor(vehicle.id)} muted={stockStatus(vehicle.quantity).level === "out"} className="w-[88%]" />
      )}
    </div>
  );
}

function IconButton({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={label} title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors ${danger ? "hover:bg-danger-tint hover:text-danger" : "hover:bg-brand-tint hover:text-brand"}`}
    >
      {children}
    </button>
  );
}

function Actions({ vehicle, onRestock, onEdit, onDelete }: { vehicle: Vehicle } & Omit<Props, "vehicles">) {
  const label = `${vehicle.make} ${vehicle.model}`;
  return (
    <div className="flex items-center gap-1">
      <IconButton label={`Restock ${label}`} onClick={() => onRestock(vehicle)}><PackagePlus className="h-5 w-5" aria-hidden="true" /></IconButton>
      <IconButton label={`Edit ${label}`} onClick={() => onEdit(vehicle)}><Pencil className="h-5 w-5" aria-hidden="true" /></IconButton>
      <IconButton label={`Delete ${label}`} danger onClick={() => onDelete(vehicle)}><Trash2 className="h-5 w-5" aria-hidden="true" /></IconButton>
    </div>
  );
}

export function AdminVehicleTable({ vehicles, ...actions }: Props) {
  const isWide = useMediaQuery("(min-width: 768px)", true);
  if (!isWide) return <VehicleCardList vehicles={vehicles} {...actions} />;
  return (
      <div className="overflow-x-auto rounded-xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[56rem] text-left">
          <caption className="sr-only">Vehicles in inventory</caption>
          <thead className="border-b border-line bg-canvas text-sm text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Image</span></th>
              <th scope="col" className="px-4 py-3 font-semibold">ID</th>
              <th scope="col" className="px-4 py-3 font-semibold">Make</th>
              <th scope="col" className="px-4 py-3 font-semibold">Model</th>
              <th scope="col" className="px-4 py-3 font-semibold">Category</th>
              <th scope="col" className="px-4 py-3 font-semibold">Year</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
              <th scope="col" className="px-4 py-3 font-semibold">Stock</th>
              <th scope="col" className="px-4 py-3 font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {vehicles.map((v) => (
              <tr key={v.id} className="hover:bg-canvas/60">
                <td className="px-4 py-3"><Thumb vehicle={v} /></td>
                <td className="px-4 py-3 text-sm text-muted">{v.id}</td>
                <td className="px-4 py-3 font-semibold">{v.make}</td>
                <td className="px-4 py-3 font-display text-xl font-bold">{v.model}</td>
                <td className="px-4 py-3"><Badge>{categoryLabel(v.category)}</Badge></td>
                <td className="px-4 py-3 text-muted">{v.year ?? "-"}</td>
                <td className="px-4 py-3 text-right font-semibold text-brand">{formatPrice(v.price)}</td>
                <td className="px-4 py-3"><StockBadge quantity={v.quantity} /></td>
                <td className="px-4 py-3"><Actions vehicle={v} {...actions} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
}

/** Phones: one card per vehicle, actions at the bottom. */
function VehicleCardList({ vehicles, ...actions }: Props) {
  return (
      <ul className="flex flex-col gap-3">
        {vehicles.map((v) => (
          <li key={v.id} className="rounded-xl border border-line bg-white p-4 shadow-card">
            <div className="flex gap-3">
              <Thumb vehicle={v} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted">{v.make}{v.year ? `, ${v.year}` : ""}</p>
                <p className="font-display text-2xl font-bold leading-tight">{v.model}</p>
              </div>
              <span className="shrink-0 self-start"><Badge>{categoryLabel(v.category)}</Badge></span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-2xl font-bold text-brand">{formatPrice(v.price)}</span>
              <StockBadge quantity={v.quantity} />
            </div>
            <div className="mt-3 flex justify-end border-t border-line pt-3"><Actions vehicle={v} {...actions} /></div>
          </li>
        ))}
      </ul>
  );
}
