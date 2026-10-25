import { useEffect, useState } from "react";
import { stockRef, vehicleName } from "../../lib/format";
import type { Vehicle } from "../../types";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { Modal } from "../ui/Modal";

const MAX_RESTOCK = 10_000;

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  /** Throw to show a failure message. */
  onConfirm: (vehicle: Vehicle, quantity: number) => Promise<void>;
}

/** Add units to a vehicle's stock. The amount must be a positive whole number. */
export function RestockDialog({ vehicle, onClose, onConfirm }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (vehicle) { setValue(""); setError(undefined); setSaving(false); } }, [vehicle]);

  const validate = (text: string): string | undefined => {
    if (!/^\d+$/.test(text.trim())) return "Use a whole number of 1 or more";
    const n = Number(text);
    if (n < 1) return "Add at least 1 unit";
    if (n > MAX_RESTOCK) return `Add at most ${MAX_RESTOCK.toLocaleString("en-IN")} units at a time`;
    return undefined;
  };

  const submit = async () => {
    const problem = validate(value);
    if (problem) { setError(problem); return; }
    if (!vehicle) return;
    setSaving(true);
    setError(undefined);
    try {
      await onConfirm(vehicle, Number(value));
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "The stock could not be updated.");
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(vehicle)} onClose={saving ? () => undefined : onClose} size="sm"
      title={vehicle ? `Restock ${vehicleName(vehicle)}` : "Restock"}
      description={vehicle ? `STOCK ${stockRef(vehicle.id)} · ${vehicle.quantity} in stock now` : undefined}
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="signal" onClick={submit} loading={saving}>{saving ? "Saving…" : "Add stock"}</Button>
        </>
      )}
    >
      <form onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate>
        <TextField label="Units to add" inputMode="numeric" autoFocus value={value} onChange={(event) => { setValue(event.target.value); setError(undefined); }} error={error} hint={vehicle ? `New total: ${vehicle.quantity + (validate(value) ? 0 : Number(value))}` : undefined} />
      </form>
    </Modal>
  );
}
