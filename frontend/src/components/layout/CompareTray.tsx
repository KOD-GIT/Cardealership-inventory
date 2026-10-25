import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCompare } from "../../hooks/useShop";
import { MAX_COMPARE } from "../../lib/compare";
import { vehicleName } from "../../lib/format";
import { buttonClass } from "../ui/Button";
import { VehicleImage } from "../ui/VehicleImage";

/** The selection tray: what you are comparing (up to three), with Remove, Clear and a link to the comparison. */
export function CompareTray() {
  const compare = useCompare();
  const { pathname } = useLocation();
  if (compare.vehicles.length === 0 || pathname === "/compare") return null;

  return (
    <section aria-label="Comparison selection" className="fixed inset-x-0 bottom-0 z-30 border-t border-line-active bg-charcoal pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[26rem] sm:border">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <p className="t-label text-dim">Compare ({compare.vehicles.length}/{MAX_COMPARE})</p>
        <button type="button" onClick={compare.clear} className="t-label min-h-[2rem] px-2 text-signal underline underline-offset-4">Clear</button>
      </div>
      <ul className="flex divide-x divide-line">
        {compare.vehicles.map((vehicle) => (
          <li key={vehicle.id} className="relative flex min-w-0 flex-1 items-center gap-2 p-2">
            <div className="h-10 w-12 shrink-0 overflow-hidden bg-ink"><VehicleImage src={vehicle.image_url} alt="" /></div>
            <span className="t-label min-w-0 flex-1 truncate normal-case">{vehicleName(vehicle)}</span>
            <button type="button" onClick={() => compare.remove(vehicle.id)} aria-label={`Remove ${vehicleName(vehicle)} from comparison`} className="icon-btn !h-8 !w-8 shrink-0"><X className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </li>
        ))}
      </ul>
      <div className="p-2">
        <Link to="/compare" className={buttonClass("signal", "sm", "w-full")} aria-disabled={compare.vehicles.length < 2}>
          {compare.vehicles.length < 2 ? "Add one more to compare" : `Compare ${compare.vehicles.length} vehicles`}
        </Link>
      </div>
    </section>
  );
}
