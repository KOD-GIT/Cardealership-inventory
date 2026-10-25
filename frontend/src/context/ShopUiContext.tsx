import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

/** Which slide-over panel or dialog is open. Only UI state: cart contents and vehicle data live elsewhere. */
interface ShopUi {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  quickViewId: number | null;
  openQuickView: (vehicleId: number) => void;
  closeQuickView: () => void;
  /** the vehicle whose single-unit "Purchase now" dialog is open */
  purchaseId: number | null;
  openPurchase: (vehicleId: number) => void;
  closePurchase: () => void;
}

const ShopUiContext = createContext<ShopUi | null>(null);

export function ShopUiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [purchaseId, setPurchaseId] = useState<number | null>(null);
  const { pathname } = useLocation();

  // Navigating to another page closes any open panel. Changing only the filters of the Floor does not.
  useEffect(() => {
    setCartOpen(false);
    setQuickViewId(null);
    setPurchaseId(null);
  }, [pathname]);

  const value = useMemo<ShopUi>(() => ({
    cartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    quickViewId,
    openQuickView: setQuickViewId,
    closeQuickView: () => setQuickViewId(null),
    purchaseId,
    openPurchase: setPurchaseId,
    closePurchase: () => setPurchaseId(null),
  }), [cartOpen, quickViewId, purchaseId]);

  return <ShopUiContext.Provider value={value}>{children}</ShopUiContext.Provider>;
}

export function useShopUi(): ShopUi {
  const ctx = useContext(ShopUiContext);
  if (!ctx) throw new Error("useShopUi must be used inside <ShopUiProvider>");
  return ctx;
}
