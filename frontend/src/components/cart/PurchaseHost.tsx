import { useShopUi } from "../../context/ShopUiContext";
import { useInventory } from "../../hooks/useVehicles";
import { vehicleName } from "../../lib/format";
import { toPaise } from "../../lib/money";
import { PurchaseDialog } from "./PurchaseDialog";

/** The one "Purchase now" dialog for the whole app: single unit, the cart is not touched. */
export function PurchaseHost() {
  const { purchaseId, closePurchase } = useShopUi();
  const { byId } = useInventory();
  const vehicle = purchaseId === null ? undefined : byId.get(purchaseId);
  return (
    <PurchaseDialog
      open={Boolean(vehicle)} onClose={closePurchase} fromCart={false} title="Purchase now"
      items={vehicle ? [{ vehicleId: vehicle.id, name: vehicleName(vehicle), quantity: 1, unitPaise: toPaise(vehicle.price) }] : []}
    />
  );
}
