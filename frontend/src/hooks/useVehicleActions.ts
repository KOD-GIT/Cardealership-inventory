import { useMemo } from "react";
import { useShopUi } from "../context/ShopUiContext";
import type { Vehicle } from "../types";
import { useCart, useCompare, useWatchlist } from "./useShop";

/**
 * Everything a person can do to a vehicle from a cell, the quick view or the detail page, behind one object.
 * Screens stay presentational: they receive this and call it, so the watchlist/compare/cart state is shared
 * and every screen stays in sync.
 */
export interface VehicleActionsApi {
  isSaved: (id: number) => boolean;
  toggleSave: (vehicle: Vehicle) => void;
  isCompared: (id: number) => boolean;
  toggleCompare: (vehicle: Vehicle) => void;
  addToCart: (vehicle: Vehicle, source?: Element | null) => void;
  cartQuantity: (id: number) => number;
  quickView: (id: number) => void;
  purchase: (vehicle: Vehicle) => void;
}

export function useVehicleActions(): VehicleActionsApi {
  const watchlist = useWatchlist();
  const compare = useCompare();
  const cart = useCart();
  const ui = useShopUi();

  return useMemo<VehicleActionsApi>(() => ({
    isSaved: watchlist.has,
    toggleSave: watchlist.toggle,
    isCompared: compare.has,
    toggleCompare: compare.toggle,
    addToCart: cart.add,
    cartQuantity: cart.quantityIn,
    quickView: ui.openQuickView,
    purchase: (vehicle) => ui.openPurchase(vehicle.id),
  }), [watchlist.has, watchlist.toggle, compare.has, compare.toggle, cart.add, cart.quantityIn, ui.openQuickView, ui.openPurchase]);
}
