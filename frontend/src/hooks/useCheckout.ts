import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { fetchVehicles, purchaseVehicle } from "../api/vehicles";
import { useAuth } from "../context/AuthContext";
import { type CheckoutLine, type CheckoutResult, runCheckout } from "../data/checkout";
import { sumPaise } from "../lib/money";
import { useActivity, useCart } from "./useShop";
import { VEHICLES_KEY } from "./useVehicles";

/**
 * Runs a purchase and records its result. Used by both "Purchase now" (one vehicle, the cart is left alone)
 * and the cart confirmation (selected quantities, bought lines leave the cart).
 *
 * Duplicate submissions are blocked with a ref, not only by disabling the button, so a fast double click or
 * Enter key can never fire two purchases. History and stock movements are written ONLY for lines the server
 * confirmed. On any failure the cart is left exactly as it was, except for lines that were truly bought.
 */
export function useCheckout() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const cart = useCart();
  const activity = useActivity();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const checkout = useCallback(async (lines: CheckoutLine[], options: { fromCart: boolean }): Promise<CheckoutResult | null> => {
    if (inFlight.current || lines.length === 0 || !user) return null;
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await runCheckout(lines, {
        fetchFresh: () => queryClient.fetchQuery({ queryKey: [...VEHICLES_KEY, {}], queryFn: () => fetchVehicles({}), staleTime: 0 }),
        purchase: purchaseVehicle,
      });
      if (result.kind === "done" && result.bought.length > 0) {
        const at = new Date().toISOString();
        activity.recordPurchase({
          reference: `IGN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          userId: user.id, userEmail: user.email, at,
          lines: result.bought.map((line) => ({ vehicleId: line.vehicleId, name: line.name, quantity: line.quantity, unitPaise: line.unitPaise })),
          totalPaise: sumPaise(result.bought.map((line) => line.unitPaise * line.quantity)),
        });
        for (const line of result.bought) {
          activity.recordMovement({ vehicleId: line.vehicleId, vehicle: line.name, event: "PURCHASED", delta: -line.quantity, resulting: line.resulting });
        }
        if (options.fromCart) cart.clearBought(result.bought.map((line) => line.vehicleId));
      }
      return result;
    } finally {
      // Whatever happened, the floor must show the stock the server now has.
      await queryClient.invalidateQueries({ queryKey: VEHICLES_KEY });
      inFlight.current = false;
      setBusy(false);
    }
  }, [queryClient, user, activity, cart]);

  return { checkout, busy };
}
