import type { Vehicle } from "../types";
import { sumPaise, toPaise } from "./money";

/**
 * Pure cart rules (no React, no storage), so they are easy to test.
 * Adding to the cart never reserves or reduces stock: the cart is only a list of intentions. Stock
 * changes only when a purchase succeeds on the server.
 */
export interface CartItem { vehicleId: number; quantity: number }

export interface AddResult { items: CartItem[]; quantity: number; capped: boolean; blocked: boolean }

/** Repeated additions update the existing line. The line never exceeds the stock on the floor. */
export function addToCart(items: CartItem[], vehicleId: number, stock: number, quantity = 1): AddResult {
  if (stock <= 0 || quantity < 1) return { items, quantity: 0, capped: false, blocked: true };
  const existing = items.find((item) => item.vehicleId === vehicleId);
  const wanted = (existing?.quantity ?? 0) + quantity;
  const next = Math.min(wanted, stock);
  const updated = existing
    ? items.map((item) => (item.vehicleId === vehicleId ? { ...item, quantity: next } : item))
    : [...items, { vehicleId, quantity: next }];
  return { items: updated, quantity: next, capped: wanted > stock, blocked: false };
}

/** Quantity is whole, at least 1 and at most the stock. Use removeFromCart to take a line out. */
export function setQuantity(items: CartItem[], vehicleId: number, quantity: number, stock: number): CartItem[] {
  if (!Number.isFinite(quantity)) return items;
  const clamped = Math.max(1, Math.min(Math.floor(quantity), Math.max(stock, 1)));
  return items.map((item) => (item.vehicleId === vehicleId ? { ...item, quantity: clamped } : item));
}

export interface Removed { item: CartItem; index: number }

export function removeFromCart(items: CartItem[], vehicleId: number): { items: CartItem[]; removed: Removed | null } {
  const index = items.findIndex((item) => item.vehicleId === vehicleId);
  if (index === -1) return { items, removed: null };
  return { items: items.filter((_, i) => i !== index), removed: { item: items[index], index } };
}

export type RestoreOutcome = "restored" | "adjusted" | "already-present" | "unavailable";
export interface RestoreResult { items: CartItem[]; outcome: RestoreOutcome; quantity: number; note: string }

/**
 * Undo for a removed line. `stock` is the vehicle's current stock, or null if the vehicle no longer exists.
 * - never duplicates or overwrites a line that was added again after the removal;
 * - restores the old quantity only while stock allows, and says so when it had to reduce it;
 * - explains why a deleted or sold-out vehicle cannot come back.
 */
export function restoreToCart(items: CartItem[], removed: Removed, stock: number | null): RestoreResult {
  if (items.some((item) => item.vehicleId === removed.item.vehicleId)) {
    return { items, outcome: "already-present", quantity: 0, note: "It is already back in your cart, so nothing was changed." };
  }
  if (stock === null) {
    return { items, outcome: "unavailable", quantity: 0, note: "That vehicle is no longer in the inventory, so it cannot be restored." };
  }
  if (stock <= 0) {
    return { items, outcome: "unavailable", quantity: 0, note: "That vehicle is out of stock, so it cannot be restored." };
  }
  const quantity = Math.min(removed.item.quantity, stock);
  const index = Math.min(removed.index, items.length);
  const next = [...items.slice(0, index), { vehicleId: removed.item.vehicleId, quantity }, ...items.slice(index)];
  return quantity < removed.item.quantity
    ? { items: next, outcome: "adjusted", quantity, note: `Restored ${quantity} of ${removed.item.quantity}: only ${stock} in stock.` }
    : { items: next, outcome: "restored", quantity, note: "Restored to your cart." };
}

export type LineStatus = "ok" | "reduced" | "unavailable" | "missing";

export interface CartLine {
  item: CartItem;
  vehicle: Vehicle | null;
  status: LineStatus;
  /** What will actually be bought: the saved quantity limited by today's stock (0 if unavailable). */
  quantity: number;
  maxQuantity: number;
  unitPaise: number;
  lineTotalPaise: number;
}

/** Joins saved lines with live vehicles. A line is never silently dropped: the person is told why it cannot be bought. */
export function cartLines(items: CartItem[], vehicles: Vehicle[]): CartLine[] {
  const byId = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  return items.map((item) => {
    const vehicle = byId.get(item.vehicleId) ?? null;
    if (!vehicle) return { item, vehicle, status: "missing", quantity: 0, maxQuantity: 0, unitPaise: 0, lineTotalPaise: 0 };
    const unitPaise = toPaise(vehicle.price);
    if (vehicle.quantity <= 0) return { item, vehicle, status: "unavailable", quantity: 0, maxQuantity: 0, unitPaise, lineTotalPaise: 0 };
    const quantity = Math.min(item.quantity, vehicle.quantity);
    return {
      item, vehicle, quantity, maxQuantity: vehicle.quantity, unitPaise, lineTotalPaise: unitPaise * quantity,
      status: quantity < item.quantity ? "reduced" : "ok",
    };
  });
}

export function cartTotals(lines: CartLine[]) {
  const buyable = lines.filter((line) => line.quantity > 0);
  return {
    subtotalPaise: sumPaise(buyable.map((line) => line.lineTotalPaise)),
    units: buyable.reduce((total, line) => total + line.quantity, 0),
    buyableLines: buyable.length,
    problemLines: lines.length - buyable.length,
  };
}
