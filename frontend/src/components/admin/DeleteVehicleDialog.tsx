import { useEffect, useState } from "react";
import { stockRef, vehicleName } from "../../lib/format";
import type { Vehicle } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  /** Throw to show a failure message. */
  onConfirm: (vehicle: Vehicle) => Promise<void>;
}

export function DeleteVehicleDialog({ vehicle, onClose, onConfirm }: Props) {
  const [error, setError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { if (vehicle) { setError(undefined); setDeleting(false); } }, [vehicle]);

  const confirm = async () => {
    if (!vehicle) return;
    setDeleting(true);
    setError(undefined);
    try {
      await onConfirm(vehicle);
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The vehicle could not be deleted.");
      setDeleting(false);
    }
  };

  return (
    <Modal
      open={Boolean(vehicle)} onClose={deleting ? () => undefined : onClose} size="sm"
      title={vehicle ? `Delete ${vehicleName(vehicle)}?` : "Delete vehicle"}
      description={vehicle ? `STOCK ${stockRef(vehicle.id)} · ${vehicle.quantity} in stock` : undefined}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>Cancel</Button>
          <Button variant="danger" onClick={confirm} loading={deleting}>{deleting ? "Deleting…" : "Delete vehicle"}</Button>
        </>
      )}
    >
      {error ? <p role="alert" className="mb-4 border border-signal p-3 text-sm font-medium text-signal">{error}</p> : null}
      <p className="text-dim">
        This removes the vehicle from the floor, other people&rsquo;s watchlists and comparisons, and any cart that holds it. Purchase history keeps
        its own record of what was bought. This cannot be undone.
      </p>
    </Modal>
  );
}
