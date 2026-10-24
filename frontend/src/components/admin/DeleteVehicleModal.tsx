import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useDeleteVehicle } from "../../hooks/useVehicles";
import { apiErrorMessage } from "../../lib/errors";
import type { Vehicle } from "../../types";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

export function DeleteVehicleModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const toast = useToast();
  const remove = useDeleteVehicle();
  const [formError, setFormError] = useState<string | undefined>();
  const label = `${vehicle.make} ${vehicle.model}`;

  const confirm = async () => {
    setFormError(undefined);
    try {
      await remove.mutateAsync(vehicle.id);
      toast({ tone: "success", title: "Vehicle deleted", description: label });
      onClose();
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  };

  return (
    <Modal
      open onClose={onClose} size="sm" title={`Delete ${label}?`}
      description="This cannot be undone. Purchase history is kept."
      footer={
        <>
          <Button variant="secondary" autoFocus onClick={onClose}>Cancel</Button>
          <Button variant="danger" loading={remove.isPending} onClick={confirm}>Delete vehicle</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-tint text-danger">
          <TriangleAlert className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="text-sm text-muted">
          {label} will be removed from the showroom and from every customer&rsquo;s search results.
        </p>
      </div>
      {formError ? <p role="alert" className="mt-4 rounded-lg bg-danger-tint p-3 text-sm font-medium text-danger">{formError}</p> : null}
    </Modal>
  );
}
