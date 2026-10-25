import { z } from "zod";
import type { CartItem } from "../lib/cart";
import type { CatalogueExtras } from "./catalogue";
import type { StoreSpec } from "./persistentStore";

/**
 * The demo repository: every piece of state the API does not provide, in one place. To move any of it to
 * a real backend later, replace the matching store with API calls; screens only use these shapes.
 *
 * Per signed-in user: cart, watchlist, compare selection, recently viewed.
 * Device-wide (shared by everyone using this browser): purchase snapshots, stock movements, admin overrides.
 */
const ids = z.array(z.number().int().positive());

function spec<T>(name: string, schema: z.ZodType<T>, initial: T, trim?: (value: T) => T): StoreSpec<T> {
  return {
    name, version: 1, initial, trim,
    validate: (raw) => {
      const parsed = schema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    },
  };
}

export const cartStore = spec<CartItem[]>(
  "cart",
  z.array(z.object({ vehicleId: z.number().int().positive(), quantity: z.number().int().min(1) })),
  [],
);
export const watchlistStore = spec<number[]>("watchlist", ids, []);
export const compareStore = spec<number[]>("compare", ids, []);
export const recentStore = spec<number[]>("recent", ids, []);

// ---------- device-wide records ----------

export interface PurchaseLineSnapshot {
  vehicleId: number;
  /** name, kept so later edits or deletion of the vehicle never rewrite history */
  name: string;
  quantity: number;
  /** price per unit at the moment of purchase, in paise */
  unitPaise: number;
}
export interface PurchaseRecord {
  id: string;
  reference: string;
  userId: number;
  userEmail: string;
  at: string;
  lines: PurchaseLineSnapshot[];
  totalPaise: number;
}

export type MovementEvent = "PURCHASED" | "RESTOCKED" | "CREATED" | "UPDATED" | "DELETED";
export interface MovementRecord {
  id: string;
  at: string;
  vehicleId: number;
  vehicle: string;
  event: MovementEvent;
  /** change in units: purchases are negative, restocks positive, 0 when only details changed */
  delta: number;
  /** stock after the event (null when unknown) */
  resulting: number | null;
  actor: string;
}

const purchaseSchema = z.object({
  id: z.string(), reference: z.string(), userId: z.number(), userEmail: z.string(), at: z.string(),
  lines: z.array(z.object({ vehicleId: z.number(), name: z.string(), quantity: z.number().int().min(1), unitPaise: z.number() })),
  totalPaise: z.number(),
});
const movementSchema = z.object({
  id: z.string(), at: z.string(), vehicleId: z.number(), vehicle: z.string(),
  event: z.enum(["PURCHASED", "RESTOCKED", "CREATED", "UPDATED", "DELETED"]),
  delta: z.number(), resulting: z.number().nullable(), actor: z.string(),
});

const KEEP = 500;
export const purchasesStore = spec<PurchaseRecord[]>("purchases", z.array(purchaseSchema), [], (list) => list.slice(-KEEP));
export const movementsStore = spec<MovementRecord[]>("movements", z.array(movementSchema), [], (list) => list.slice(-KEEP));

export type ExtrasMap = Record<string, Partial<CatalogueExtras>>;
const extrasSchema = z.record(
  z.string(),
  z.object({
    gallery: z.array(z.string()).optional(),
    imagePosition: z.string().nullable().optional(),
    specs: z.record(z.string(), z.string()).optional(),
    featured: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    carouselOrder: z.number().nullable().optional(),
    tagline: z.string().nullable().optional(),
    headline: z.string().nullable().optional(),
  }),
);
export const extrasStore = spec<ExtrasMap>("extras", extrasSchema as z.ZodType<ExtrasMap>, {});

export const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
