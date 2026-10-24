import { RotateCw, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import { categoryLabel } from "../../lib/format";
import { CATEGORIES, type VehicleCategory, type VehicleSearchParams } from "../../types";
import { Button } from "../ui/Button";
import { SelectField, TextField } from "../ui/Field";

interface Props {
  onSearch: (params: VehicleSearchParams) => void;
  onReset: () => void;
}

const toNumber = (value: string): number | undefined => (value.trim() === "" ? undefined : Number(value));

/** Make / model / category / price range: exactly the filters GET /api/vehicles/search supports. */
export function SearchFilterBar({ onSearch, onReset }: Props) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState<VehicleCategory | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [error, setError] = useState<string | undefined>();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const min = toNumber(minPrice), max = toNumber(maxPrice);
    if (min !== undefined && max !== undefined && min > max) {
      setError("Minimum price can't be higher than maximum price.");
      return;
    }
    setError(undefined);
    onSearch({
      make: make.trim() || undefined, model: model.trim() || undefined,
      category: category || undefined, min_price: min, max_price: max,
    });
  };

  const reset = () => {
    setMake(""); setModel(""); setCategory(""); setMinPrice(""); setMaxPrice(""); setError(undefined);
    onReset();
  };

  return (
    <form role="search" aria-label="Filter vehicles" onSubmit={submit} className="rounded-xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_9rem_9rem_auto] lg:items-end">
        <TextField label="Make" placeholder="Toyota" value={make} onChange={(e) => setMake(e.target.value)} />
        <TextField label="Model" placeholder="Camry" value={model} onChange={(e) => setModel(e.target.value)} />
        <SelectField label="Category" value={category} onChange={(e) => setCategory(e.target.value as VehicleCategory | "")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </SelectField>
        <TextField label="Min price" type="number" inputMode="decimal" min={0} placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <TextField label="Max price" type="number" inputMode="decimal" min={0} placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="flex-1 lg:flex-none">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search
          </Button>
          <Button variant="secondary" onClick={reset} aria-label="Reset filters">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            <span className="lg:sr-only">Reset</span>
          </Button>
        </div>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-danger">{error}</p> : null}
    </form>
  );
}
