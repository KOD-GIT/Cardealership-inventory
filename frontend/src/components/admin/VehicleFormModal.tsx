import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateVehicle, useUpdateVehicle } from "../../hooks/useVehicles";
import { apiErrorMessage } from "../../lib/errors";
import { categoryLabel } from "../../lib/format";
import { CATEGORIES, type Vehicle, type VehicleInput } from "../../types";
import { Button } from "../ui/Button";
import { SelectField, TextField } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { useToast } from "../ui/Toast";

// All fields are strings in the form (inputs give strings); they are converted in `toPayload`.
const schema = z.object({
  make: z.string().trim().min(1, "Make is required").max(80, "Use 80 characters or fewer"),
  model: z.string().trim().min(1, "Model is required").max(80, "Use 80 characters or fewer"),
  category: z.enum(CATEGORIES),
  price: z.string().trim().min(1, "Price is required")
    .refine((v) => Number(v) > 0, "Price must be greater than 0")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Use at most 2 decimal places"),
  quantity: z.string().trim().min(1, "Quantity is required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Quantity must be a whole number, 0 or more"),
  year: z.string().trim().refine((v) => v === "" || (Number.isInteger(Number(v)) && Number(v) >= 1886 && Number(v) <= 2100), "Enter a year between 1886 and 2100"),
  image_url: z.string().trim().refine((v) => v === "" || /^https?:\/\//i.test(v), "Link must start with http:// or https://"),
});
type Values = z.infer<typeof schema>;

const toPayload = (v: Values): VehicleInput => ({
  make: v.make, model: v.model, category: v.category, price: Number(v.price), quantity: Number(v.quantity),
  year: v.year === "" ? null : Number(v.year), image_url: v.image_url === "" ? null : v.image_url,
});

interface Props { vehicle?: Vehicle; onClose: () => void }

/** Add (no `vehicle`) or edit (with `vehicle`). Mount it only while open so the form resets each time. */
export function VehicleFormModal({ vehicle, onClose }: Props) {
  const editing = Boolean(vehicle);
  const toast = useToast();
  const create = useCreateVehicle();
  const update = useUpdateVehicle();
  const [formError, setFormError] = useState<string | undefined>();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      make: vehicle?.make ?? "", model: vehicle?.model ?? "", category: vehicle?.category ?? "SEDAN",
      price: vehicle ? String(vehicle.price) : "", quantity: vehicle ? String(vehicle.quantity) : "",
      year: vehicle?.year ? String(vehicle.year) : "", image_url: vehicle?.image_url ?? "",
    },
  });
  const pending = create.isPending || update.isPending;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(undefined);
    const payload = toPayload(values);
    try {
      if (vehicle) await update.mutateAsync({ id: vehicle.id, input: payload });
      else await create.mutateAsync(payload);
      toast({ tone: "success", title: editing ? "Vehicle updated" : "Vehicle added", description: `${payload.make} ${payload.model}` });
      onClose();
    } catch (error) {
      setFormError(apiErrorMessage(error));
    }
  });

  return (
    <Modal
      open onClose={onClose} size="lg"
      title={editing ? "Edit vehicle" : "Add vehicle"}
      description={editing ? "Update the details shown to customers." : "New vehicles appear on the dashboard straight away."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="vehicle-form" loading={pending}>Save vehicle</Button>
        </>
      }
    >
      <form id="vehicle-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        {formError ? <p role="alert" className="rounded-lg bg-danger-tint p-3 text-sm font-medium text-danger sm:col-span-2">{formError}</p> : null}
        <TextField label="Make" autoFocus error={errors.make?.message} {...register("make")} />
        <TextField label="Model" error={errors.model?.message} {...register("model")} />
        <SelectField label="Category" error={errors.category?.message} {...register("category")}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </SelectField>
        <TextField label="Year" type="number" inputMode="numeric" optional error={errors.year?.message} {...register("year")} />
        <TextField label="Price" type="number" inputMode="decimal" step="0.01" min={0} placeholder="27999.99" error={errors.price?.message} {...register("price")} />
        <TextField label="Quantity in stock" type="number" inputMode="numeric" min={0} step={1} error={errors.quantity?.message} {...register("quantity")} />
        <div className="sm:col-span-2">
          <TextField label="Image link" type="url" optional placeholder="https://" hint="Shown on the vehicle card. Leave empty to use the standard car." error={errors.image_url?.message} {...register("image_url")} />
        </div>
      </form>
    </Modal>
  );
}
