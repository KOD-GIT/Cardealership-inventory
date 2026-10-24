import { Minus, Plus } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { useRestockVehicle } from "../../hooks/useVehicles";
import { apiErrorMessage } from "../../lib/errors";
import { stockStatus } from "../../lib/stock";
import type { Vehicle } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";
import { StockBadge } from "../vehicles/StockBadge";

export function RestockModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const inputId = useId();
  const toast = useToast();
  const restock = useRestockVehicle();
  const [units, setUnits] = useState("5");
  const [formError, setFormError] = useState<string | undefined>();

  const n = Number(units);
  const valid = units.trim() !== "" && Number.isInteger(n) && n >= 1;
  const label = `${vehicle.make} ${vehicle.model}`;
  const step = (delta: number) => setUnits(String(Math.max(1, (valid ? n : 0) + delta)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setFormError(undefined);
    try {
      const updated = await restock.mutateAsync({ id: vehicle.id, quantity: n });
      toast({ tone: "success", title: `Restocked ${label}`, description: `${stockStatus(updated.quantity).label}.` });
      onClose();
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  };

  return (
    <Modal
      open onClose={onClose} size="sm" title={`Restock ${label}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="restock-form" disabled={!valid} loading={restock.isPending}>Restock</Button>
        </>
      }
    >
      <form id="restock-form" onSubmit={submit} noValidate className="flex flex-col gap-4">
        {formError ? <p role="alert" className="rounded-lg bg-danger-tint p-3 text-sm font-medium text-danger">{formError}</p> : null}
        <div className="flex items-center justify-between rounded-lg bg-canvas p-3">
          <span className="text-sm text-muted">Current stock</span>
          <StockBadge quantity={vehicle.quantity} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="text-sm font-semibold">Units to add</label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" aria-label="Decrease units" onClick={() => step(-1)} disabled={!valid || n <= 1}><Minus className="h-4 w-4" aria-hidden="true" /></Button>
            <input
              id={inputId} type="number" min={1} step={1} inputMode="numeric" autoFocus value={units}
              onChange={(e) => setUnits(e.target.value)} aria-invalid={!valid}
              className="h-11 w-full rounded-[10px] border border-line bg-white px-3 text-center text-lg font-semibold focus-visible:border-brand"
            />
            <Button variant="secondary" aria-label="Increase units" onClick={() => step(1)}><Plus className="h-4 w-4" aria-hidden="true" /></Button>
          </div>
          {!valid ? <p role="alert" className="text-sm text-danger">Enter a whole number, 1 or more.</p> : null}
        </div>
        <p className="flex items-center justify-between rounded-lg bg-brand-tint p-3 text-sm">
          <span className="text-muted">New stock</span>
          <span className="font-semibold text-brand">{valid ? `${vehicle.quantity + n} units` : "-"}</span>
        </p>
      </form>
    </Modal>
  );
}
