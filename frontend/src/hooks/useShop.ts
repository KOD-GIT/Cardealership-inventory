import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNotify } from "../components/ui/Notifications";
import { useAuth } from "../context/AuthContext";
import { type CatalogueExtras, resolveExtras } from "../data/catalogue";
import { useStoreHandle } from "../data/persistentStore";
import {
  cartStore, compareStore, extrasStore, type MovementRecord, movementsStore, newId, type PurchaseRecord,
  purchasesStore, recentStore, watchlistStore,
} from "../data/stores";
import { addToCart, cartLines, cartTotals, removeFromCart, restoreToCart, type Removed, setQuantity } from "../lib/cart";
import { MAX_COMPARE, pruneIds, pushRecent, toggleCompare } from "../lib/compare";
import { vehicleName } from "../lib/format";
import { flyToCart } from "../lib/flyToCart";
import type { Vehicle } from "../types";
import { useInventory } from "./useVehicles";

/** Per-person data is keyed by user id, so two people on one browser never see each other's cart. */
function useScope(): string | number {
  const { user } = useAuth();
  return user?.id ?? "guest";
}

/** Keeps a ref pointing at the newest value, so delayed callbacks (Undo) never act on stale data. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// ---------------------------------------------------------------- catalogue extras (admin-editable)

export function useExtras() {
  const { value: map, store } = useStoreHandle(extrasStore);
  const extrasFor = useCallback(
    (vehicle: Pick<Vehicle, "id" | "make" | "model">): CatalogueExtras => resolveExtras(vehicle, map[String(vehicle.id)]),
    [map],
  );
  const update = useCallback(
    (id: number, patch: Partial<CatalogueExtras>) => store.set((previous) => ({ ...previous, [id]: { ...previous[String(id)], ...patch } })),
    [store],
  );
  const forget = useCallback(
    (id: number) => store.set((previous) => Object.fromEntries(Object.entries(previous).filter(([key]) => key !== String(id)))),
    [store],
  );
  return { extrasFor, update, forget };
}

// ---------------------------------------------------------------- watchlist

export function useWatchlist() {
  const scope = useScope();
  const notify = useNotify();
  const { value: ids, store } = useStoreHandle(watchlistStore, scope);
  const { byId, isSuccess } = useInventory();
  const byIdRef = useLatest(byId);

  // A vehicle an administrator deleted disappears from the watchlist.
  useEffect(() => {
    if (isSuccess) {
      const kept = pruneIds(store.get(), new Set(byId.keys()));
      if (kept.length !== store.get().length) store.set(kept);
    }
  }, [isSuccess, byId, store]);

  const vehicles = useMemo(() => ids.map((id) => byId.get(id)).filter((vehicle): vehicle is Vehicle => Boolean(vehicle)), [ids, byId]);
  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const remove = useCallback((vehicle: Vehicle) => {
    const current = store.get();
    const index = current.indexOf(vehicle.id);
    if (index === -1) return;
    store.set(current.filter((id) => id !== vehicle.id));
    notify({
      tone: "info", title: `Removed ${vehicleName(vehicle)} from your watchlist`,
      action: {
        label: "Undo",
        onClick: () => {
          if (!byIdRef.current.has(vehicle.id)) {
            notify({ tone: "error", title: "Cannot restore", description: `${vehicleName(vehicle)} is no longer in the inventory.` });
            return;
          }
          const now = store.get();
          if (now.includes(vehicle.id)) return;
          store.set([...now.slice(0, index), vehicle.id, ...now.slice(index)]);
          notify({ tone: "success", title: `Restored ${vehicleName(vehicle)} to your watchlist` });
        },
      },
    });
  }, [store, notify, byIdRef]);

  const toggle = useCallback((vehicle: Vehicle) => {
    if (store.get().includes(vehicle.id)) remove(vehicle);
    else {
      store.set([...store.get(), vehicle.id]);
      notify({ tone: "success", title: `Saved ${vehicleName(vehicle)} to your watchlist` });
    }
  }, [store, remove, notify]);

  return { ids, vehicles, has, toggle, remove };
}

// ---------------------------------------------------------------- compare

export function useCompare() {
  const scope = useScope();
  const notify = useNotify();
  const { value: ids, store } = useStoreHandle(compareStore, scope);
  const { byId, isSuccess } = useInventory();

  useEffect(() => {
    if (isSuccess) {
      const kept = pruneIds(store.get(), new Set(byId.keys()));
      if (kept.length !== store.get().length) store.set(kept);
    }
  }, [isSuccess, byId, store]);

  const vehicles = useMemo(() => ids.map((id) => byId.get(id)).filter((vehicle): vehicle is Vehicle => Boolean(vehicle)), [ids, byId]);
  const has = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((vehicle: Vehicle) => {
    const result = toggleCompare(store.get(), vehicle.id);
    if (result.result === "full") {
      notify({ tone: "error", title: "Compare is full", description: `You can compare up to ${MAX_COMPARE} vehicles. Remove one first.` });
      return;
    }
    store.set(result.ids);
  }, [store, notify]);
  const remove = useCallback((id: number) => store.set((current) => current.filter((existing) => existing !== id)), [store]);
  const clear = useCallback(() => store.set([]), [store]);

  return { ids, vehicles, has, toggle, remove, clear, isFull: ids.length >= MAX_COMPARE };
}

// ---------------------------------------------------------------- recently viewed

export function useRecentlyViewed() {
  const scope = useScope();
  const { value: ids, store } = useStoreHandle(recentStore, scope);
  const { byId, isSuccess } = useInventory();

  const vehicles = useMemo(() => ids.map((id) => byId.get(id)).filter((vehicle): vehicle is Vehicle => Boolean(vehicle)), [ids, byId]);
  const record = useCallback((id: number) => store.set((current) => (current[0] === id ? current : pushRecent(current, id))), [store]);
  const clear = useCallback(() => store.set([]), [store]);

  useEffect(() => {
    if (isSuccess) {
      const kept = pruneIds(store.get(), new Set(byId.keys()));
      if (kept.length !== store.get().length) store.set(kept);
    }
  }, [isSuccess, byId, store]);

  return { vehicles, record, clear };
}

// ---------------------------------------------------------------- cart

export function useCart() {
  const scope = useScope();
  const notify = useNotify();
  const { value: items, store } = useStoreHandle(cartStore, scope);
  const { vehicles, byId } = useInventory();
  const byIdRef = useLatest(byId);

  const lines = useMemo(() => cartLines(items, vehicles), [items, vehicles]);
  const totals = useMemo(() => cartTotals(lines), [lines]);
  const quantityIn = useCallback((vehicleId: number) => items.find((item) => item.vehicleId === vehicleId)?.quantity ?? 0, [items]);

  /** Adds one unit. The cart is updated first and independently; the flying photo is only decoration. */
  const add = useCallback((vehicle: Vehicle, source?: Element | null) => {
    const result = addToCart(store.get(), vehicle.id, vehicle.quantity, 1);
    if (result.blocked) {
      notify({ tone: "error", title: "Out of stock", description: `${vehicleName(vehicle)} cannot be added to the cart.` });
      return;
    }
    store.set(result.items);
    notify({
      tone: "success", title: `Added ${vehicleName(vehicle)} to your cart`,
      description: result.capped ? `Only ${vehicle.quantity} in stock, so your cart holds ${result.quantity}.` : `${result.quantity} in cart.`,
    });
    flyToCart(source ?? null, vehicle.image_url);
  }, [store, notify]);

  const changeQuantity = useCallback((vehicleId: number, quantity: number) => {
    const stock = byIdRef.current.get(vehicleId)?.quantity ?? 1;
    store.set((current) => setQuantity(current, vehicleId, quantity, stock));
  }, [store, byIdRef]);

  const restore = useCallback((removed: Removed) => {
    const vehicle = byIdRef.current.get(removed.item.vehicleId);
    const result = restoreToCart(store.get(), removed, vehicle ? vehicle.quantity : null);
    if (result.outcome !== "already-present" && result.outcome !== "unavailable") store.set(result.items);
    notify({
      tone: result.outcome === "unavailable" ? "error" : result.outcome === "restored" ? "success" : "info",
      title: result.outcome === "unavailable" ? "Cannot restore" : result.outcome === "already-present" ? "Already in your cart" : "Cart updated",
      description: result.note,
    });
  }, [store, notify, byIdRef]);

  const remove = useCallback((vehicleId: number) => {
    const { items: next, removed } = removeFromCart(store.get(), vehicleId);
    if (!removed) return;
    store.set(next);
    const vehicle = byIdRef.current.get(vehicleId);
    notify({
      tone: "info", title: `Removed ${vehicle ? vehicleName(vehicle) : "a vehicle"} from your cart`,
      action: { label: "Undo", onClick: () => restore(removed) },
    });
  }, [store, notify, restore, byIdRef]);

  const clearBought = useCallback((vehicleIds: number[]) => store.set((current) => current.filter((item) => !vehicleIds.includes(item.vehicleId))), [store]);

  // The badge is "units in the cart", the same number whatever the stock does later. What can actually be
  // bought right now is `totals`, shown on the cart page.
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return { items, lines, totals, count, quantityIn, add, changeQuantity, remove, clearBought };
}

// ---------------------------------------------------------------- recorded activity (demo, this device)

export function useActivity() {
  const { user } = useAuth();
  const purchases = useStoreHandle(purchasesStore);
  const movements = useStoreHandle(movementsStore);

  const mine = useMemo(
    () => purchases.value.filter((record) => record.userId === user?.id).slice().reverse(),
    [purchases.value, user?.id],
  );
  const recordPurchase = useCallback((record: Omit<PurchaseRecord, "id">) => purchases.store.set((all) => [...all, { ...record, id: newId("pur") }]), [purchases.store]);
  const recordMovement = useCallback(
    (movement: Omit<MovementRecord, "id" | "at" | "actor"> & { actor?: string }) =>
      movements.store.set((all) => [...all, { ...movement, id: newId("mov"), at: new Date().toISOString(), actor: movement.actor ?? user?.email ?? "unknown" }]),
    [movements.store, user?.email],
  );

  return {
    myPurchases: mine,
    allPurchases: purchases.value,
    movements: movements.value,
    recordPurchase,
    recordMovement,
  };
}
