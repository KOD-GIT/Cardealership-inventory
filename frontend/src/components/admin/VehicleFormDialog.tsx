import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { CatalogueExtras } from "../../data/catalogue";
import { categoryLabel, stockRef } from "../../lib/format";
import { parseRupees } from "../../lib/money";
import { CATEGORIES, type Vehicle, type VehicleCategory, type VehicleInput } from "../../types";
import { Button } from "../ui/Button";
import { CheckboxField, SelectField, TextField } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { VehicleImage } from "../ui/VehicleImage";

/** The API accepts prices up to 99,999,999.99. */
export const MAX_PRICE = 99_999_999.99;

const schema = z.object({
  make: z.string().trim().min(1, "Enter the make").max(80, "At most 80 characters"),
  model: z.string().trim().min(1, "Enter the model").max(80, "At most 80 characters"),
  category: z.enum(CATEGORIES),
  price: z.string().trim().min(1, "Enter a price").refine((v) => parseRupees(v) !== null, "Enter an amount like 8,15,000 or 815000.50")
    .refine((v) => (parseRupees(v) ?? 0) > 0, "The price must be more than zero")
    .refine((v) => (parseRupees(v) ?? 0) <= MAX_PRICE, "The price is above ₹9,99,99,999.99"),
  quantity: z.string().trim().min(1, "Enter the stock").regex(/^\d+$/, "Use a whole number, 0 or more").refine((v) => Number(v) <= 100_000, "That is too many units"),
  year: z.string().trim().refine((v) => v === "" || (/^\d{4}$/.test(v) && Number(v) >= 1886 && Number(v) <= 2100), "Use a year between 1886 and 2100"),
  imageUrl: z.string().trim().max(500, "At most 500 characters").refine((v) => v === "" || /^(\/(?!\/)|https:\/\/)/.test(v), "Use a path starting with / or an https:// address"),
  featured: z.boolean(),
  newArrival: z.boolean(),
  carouselOrder: z.string().trim().refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 999), "Use a whole number from 1 to 999, or leave empty"),
});
type Values = z.infer<typeof schema>;

export interface VehicleFormResult { input: VehicleInput; extras: Pick<CatalogueExtras, "featured" | "newArrival" | "carouselOrder"> }

interface Props {
  open: boolean;
  onClose: () => void;
  /** undefined = add a vehicle; a vehicle = edit it */
  vehicle?: Vehicle;
  extras?: CatalogueExtras;
  /** Throw to show a failure message in the form. */
  onSubmit: (result: VehicleFormResult) => Promise<void>;
}

const blank: Values = {
  make: "", model: "", category: "SEDAN", price: "", quantity: "1", year: "", imageUrl: "", featured: false, newArrival: false, carouselOrder: "",
};

function initialValues(vehicle?: Vehicle, extras?: CatalogueExtras): Values {
  if (!vehicle) return blank;
  return {
    make: vehicle.make, model: vehicle.model, category: vehicle.category, price: String(vehicle.price), quantity: String(vehicle.quantity),
    year: vehicle.year === null ? "" : String(vehicle.year), imageUrl: vehicle.image_url ?? "", featured: extras?.featured ?? false,
    newArrival: extras?.newArrival ?? false, carouselOrder: extras?.carouselOrder == null ? "" : String(extras.carouselOrder),
  };
}

export function VehicleFormDialog({ open, onClose, vehicle, extras, onSubmit }: Props) {
  const editing = Boolean(vehicle);
  const [failure, setFailure] = useState<string | undefined>();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema), defaultValues: initialValues(vehicle, extras),
  });

  useEffect(() => {
    if (open) { reset(initialValues(vehicle, extras)); setFailure(undefined); setConfirmDiscard(false); }
  }, [open, vehicle, extras, reset]);

  const requestClose = () => { if (isDirty && !isSubmitting) setConfirmDiscard(true); else onClose(); };

  const submit = handleSubmit(async (values) => {
    setFailure(undefined);
    try {
      await onSubmit({
        input: {
          make: values.make.trim(), model: values.model.trim(), category: values.category as VehicleCategory,
          price: parseRupees(values.price) as number, quantity: Number(values.quantity),
          year: values.year === "" ? null : Number(values.year), image_url: values.imageUrl === "" ? null : values.imageUrl,
        },
        extras: { featured: values.featured, newArrival: values.newArrival, carouselOrder: values.carouselOrder === "" ? null : Number(values.carouselOrder) },
      });
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The vehicle could not be saved.");
    }
  });

  const preview = watch("imageUrl");

  return (
    <>
      <Modal
        open={open} onClose={requestClose} size="lg" title={editing ? "Edit vehicle" : "Add vehicle"}
        description={editing ? "Changes apply to the floor, the cart, the watchlist and comparisons straight away." : "The stock reference and ID are assigned by the system."}
        footer={(
          <>
            <Button variant="ghost" onClick={requestClose} disabled={isSubmitting}>Cancel</Button>
            <Button variant="signal" type="submit" form="vehicle-form" loading={isSubmitting}>{isSubmitting ? "Saving…" : editing ? "Save changes" : "Add vehicle"}</Button>
          </>
        )}
      >
        <form id="vehicle-form" onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
          {failure ? <p role="alert" className="border border-signal p-3 text-sm font-medium text-signal sm:col-span-2">{failure}</p> : null}
          {editing && vehicle ? (
            <div className="grid grid-cols-2 gap-px border border-line bg-line sm:col-span-2">
              <div className="bg-charcoal p-3"><p className="t-label text-dim">Vehicle ID (read-only)</p><p className="t-data">{vehicle.id}</p></div>
              <div className="bg-charcoal p-3"><p className="t-label text-dim">Stock reference (read-only)</p><p className="t-data">{stockRef(vehicle.id)}</p></div>
            </div>
          ) : null}
          <TextField label="Make" autoComplete="off" error={errors.make?.message} {...register("make")} />
          <TextField label="Model" autoComplete="off" error={errors.model?.message} {...register("model")} />
          <SelectField label="Category" error={errors.category?.message} {...register("category")}>
            {CATEGORIES.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}
          </SelectField>
          <TextField label="Price (₹)" inputMode="decimal" hint="Whole rupees or with paise, for example 24200000" error={errors.price?.message} {...register("price")} />
          <TextField label="Units in stock" inputMode="numeric" error={errors.quantity?.message} {...register("quantity")} />
          <TextField label="Model year" optional inputMode="numeric" error={errors.year?.message} {...register("year")} />
          <div className="sm:col-span-2">
            <TextField label="Image path or address" optional placeholder="/images/vehicles/swift-zxi.jpg" error={errors.imageUrl?.message} {...register("imageUrl")} />
            {preview && !errors.imageUrl ? (
              <div className="mt-3 flex items-center gap-3"><div className="h-20 w-28 overflow-hidden border border-line"><VehicleImage src={preview} alt="Image preview" key={preview} /></div><p className="t-label text-dim">Preview</p></div>
            ) : null}
          </div>
          <fieldset className="grid gap-4 border border-line p-4 sm:col-span-2 sm:grid-cols-3">
            <legend className="t-label px-2 text-dim">Home page display (saved on this device)</legend>
            <CheckboxField label="Featured" hint="Shown on the home carousel" {...register("featured")} />
            <CheckboxField label="New arrival" hint="Shows a “New arrival” tag" {...register("newArrival")} />
            <TextField label="Carousel order" optional inputMode="numeric" hint="1 comes first" error={errors.carouselOrder?.message} {...register("carouselOrder")} />
          </fieldset>
        </form>
      </Modal>

      <Modal
        open={confirmDiscard} onClose={() => setConfirmDiscard(false)} size="sm" title="Discard changes?"
        description="You have unsaved changes. If you close now they will be lost."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>Keep editing</Button>
            <Button variant="danger" onClick={() => { setConfirmDiscard(false); onClose(); }}>Discard changes</Button>
          </>
        )}
      >
        <p className="text-dim">Nothing has been saved yet.</p>
      </Modal>
    </>
  );
}
