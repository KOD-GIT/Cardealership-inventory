import type { CatalogueExtras } from "../data/catalogue";
import type { Vehicle } from "../types";
import { categoryLabel } from "./format";
import { formatRupees } from "./money";
import { stockStatus } from "./stock";

export const MAX_COMPARE = 3;
export const RECENT_LIMIT = 6;
export const NOT_PROVIDED = "Not provided";

export interface ToggleResult { ids: number[]; result: "added" | "removed" | "full" }

/** Up to three vehicles can be compared; a fourth is refused (the caller tells the person why). */
export function toggleCompare(ids: number[], id: number): ToggleResult {
  if (ids.includes(id)) return { ids: ids.filter((existing) => existing !== id), result: "removed" };
  if (ids.length >= MAX_COMPARE) return { ids, result: "full" };
  return { ids: [...ids, id], result: "added" };
}

export interface CompareRow { label: string; values: string[]; differs: boolean }

/** Price, category, availability, year, then every specification any compared vehicle has, in first-seen order. */
export function buildCompareRows(vehicles: Vehicle[], extrasFor: (vehicle: Vehicle) => CatalogueExtras): CompareRow[] {
  const row = (label: string, values: string[]): CompareRow => ({ label, values, differs: new Set(values).size > 1 });
  const rows: CompareRow[] = [
    row("Price", vehicles.map((vehicle) => formatRupees(vehicle.price))),
    row("Category", vehicles.map((vehicle) => categoryLabel(vehicle.category))),
    row("Availability", vehicles.map((vehicle) => stockStatus(vehicle.quantity).label)),
    row("Model year", vehicles.map((vehicle) => (vehicle.year === null ? NOT_PROVIDED : String(vehicle.year)))),
  ];
  const specLabels: string[] = [];
  const specs = vehicles.map((vehicle) => extrasFor(vehicle).specs);
  for (const set of specs) for (const label of Object.keys(set)) if (!specLabels.includes(label)) specLabels.push(label);
  for (const label of specLabels) rows.push(row(label, specs.map((set) => set[label] ?? NOT_PROVIDED)));
  return rows;
}

/** Newest first, no duplicates, at most six. Viewing the same vehicle again moves it to the front. */
export function pushRecent(ids: number[], id: number): number[] {
  return [id, ...ids.filter((existing) => existing !== id)].slice(0, RECENT_LIMIT);
}

/** Drops ids of vehicles that no longer exist (deleted by an administrator). */
export function pruneIds(ids: number[], existing: Set<number>): number[] {
  return ids.filter((id) => existing.has(id));
}
