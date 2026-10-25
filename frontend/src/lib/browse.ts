import { CATEGORIES, type Vehicle, type VehicleCategory } from "../types";
import { categoryLabel, vehicleName } from "./format";
import { formatRupees, toPaise } from "./money";

/**
 * Everything the Floor remembers about how you are browsing. It lives in the URL, so the back button,
 * refresh, a shared link and "return to my results" all restore it for free.
 */
export type SortKey = "newest" | "price-asc" | "price-desc" | "name" | "stock";

export interface BrowseState {
  q: string;
  category: VehicleCategory | null;
  /** rupees, inclusive */
  min: number | null;
  max: number | null;
  inStockOnly: boolean;
  sort: SortKey;
  page: number;
}

export const PAGE_SIZE = 10;
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest arrival" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name A–Z" },
  { key: "stock", label: "Stock: most first" },
];
const SORT_KEYS = SORT_OPTIONS.map((option) => option.key);

export const DEFAULT_BROWSE: BrowseState = {
  q: "", category: null, min: null, max: null, inStockOnly: false, sort: "newest", page: 1,
};

const positiveNumber = (raw: string | null): number | null => {
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

/** URL -> state. Anything invalid falls back to the default instead of breaking the page. */
export function parseBrowse(params: URLSearchParams): BrowseState {
  const category = params.get("cat");
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  return {
    q: (params.get("q") ?? "").slice(0, 80),
    category: CATEGORIES.includes(category as VehicleCategory) ? (category as VehicleCategory) : null,
    min: positiveNumber(params.get("min")),
    max: positiveNumber(params.get("max")),
    inStockOnly: params.get("stock") === "1",
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : DEFAULT_BROWSE.sort,
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/** State -> URL. Defaults are omitted so the plain Floor URL stays clean. */
export function serializeBrowse(state: BrowseState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q.trim()) params.set("q", state.q.trim());
  if (state.category) params.set("cat", state.category);
  if (state.min !== null) params.set("min", String(state.min));
  if (state.max !== null) params.set("max", String(state.max));
  if (state.inStockOnly) params.set("stock", "1");
  if (state.sort !== DEFAULT_BROWSE.sort) params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params;
}

export function filterVehicles(vehicles: Vehicle[], state: BrowseState): Vehicle[] {
  const needle = state.q.trim().toLowerCase();
  const minPaise = state.min === null ? null : toPaise(state.min);
  const maxPaise = state.max === null ? null : toPaise(state.max);
  return vehicles.filter((vehicle) => {
    if (needle && !vehicleName(vehicle).toLowerCase().includes(needle)) return false;
    if (state.category && vehicle.category !== state.category) return false;
    const price = toPaise(vehicle.price);
    if (minPaise !== null && price < minPaise) return false;
    if (maxPaise !== null && price > maxPaise) return false;
    if (state.inStockOnly && vehicle.quantity <= 0) return false;
    return true;
  });
}

const byName = (a: Vehicle, b: Vehicle) => vehicleName(a).localeCompare(vehicleName(b), "en", { sensitivity: "base" });
const arrival = (vehicle: Vehicle) => {
  const time = Date.parse(vehicle.created_at);
  return Number.isNaN(time) ? 0 : time;
};

/** Returns a new array. "Newest" uses the inventory arrival time (never the model year), ties broken by id. */
export function sortVehicles(vehicles: Vehicle[], key: SortKey): Vehicle[] {
  const copy = [...vehicles];
  switch (key) {
    case "price-asc": return copy.sort((a, b) => toPaise(a.price) - toPaise(b.price) || byName(a, b));
    case "price-desc": return copy.sort((a, b) => toPaise(b.price) - toPaise(a.price) || byName(a, b));
    case "name": return copy.sort(byName);
    case "stock": return copy.sort((a, b) => b.quantity - a.quantity || byName(a, b));
    default: return copy.sort((a, b) => arrival(b) - arrival(a) || b.id - a.id);
  }
}

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
  /** 1-based inclusive range shown, for "Showing 11–14 of 14". */
  from: number;
  to: number;
}

/** Pagination happens AFTER filtering and sorting. An out-of-range page is clamped to the last page. */
export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice, page: current, pageCount, total: items.length,
    from: slice.length === 0 ? 0 : start + 1, to: start + slice.length,
  };
}

export interface Chip { id: string; label: string; clear: Partial<BrowseState> }

/** One removable chip per active filter. Sort and page are not filters, so they never appear here. */
export function activeChips(state: BrowseState): Chip[] {
  const chips: Chip[] = [];
  if (state.q.trim()) chips.push({ id: "q", label: `Search: ${state.q.trim()}`, clear: { q: "" } });
  if (state.category) chips.push({ id: "cat", label: `Category: ${categoryLabel(state.category)}`, clear: { category: null } });
  if (state.min !== null) chips.push({ id: "min", label: `Min ${formatRupees(state.min)}`, clear: { min: null } });
  if (state.max !== null) chips.push({ id: "max", label: `Max ${formatRupees(state.max)}`, clear: { max: null } });
  if (state.inStockOnly) chips.push({ id: "stock", label: "In stock only", clear: { inStockOnly: false } });
  return chips;
}

export function categoryCounts(vehicles: Vehicle[]): Record<VehicleCategory, number> {
  const counts = Object.fromEntries(CATEGORIES.map((category) => [category, 0])) as Record<VehicleCategory, number>;
  for (const vehicle of vehicles) counts[vehicle.category] += 1;
  return counts;
}

/** Aggregate numbers shown on the home page and the ledger, always computed from the live collection. */
export function inventoryMetrics(vehicles: Vehicle[], lowThreshold: number) {
  let units = 0;
  let valuePaise = 0;
  let low = 0;
  let out = 0;
  for (const vehicle of vehicles) {
    units += vehicle.quantity;
    valuePaise += toPaise(vehicle.price) * vehicle.quantity;
    if (vehicle.quantity <= 0) out += 1;
    else if (vehicle.quantity <= lowThreshold) low += 1;
  }
  return { models: vehicles.length, units, valuePaise, low, out, inStock: vehicles.length - out };
}
