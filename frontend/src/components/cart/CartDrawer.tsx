import { Link } from "react-router-dom";
import { useShopUi } from "../../context/ShopUiContext";
import { useCart } from "../../hooks/useShop";
import { formatInr } from "../../lib/money";
import { Button, buttonClass } from "../ui/Button";
import { Drawer } from "../ui/Modal";
import { CartLineRow } from "./CartLineRow";

/** The slide-over cart. The full Cart page (/cart) holds the confirmation; this is the quick look. */
export function CartDrawer() {
  const { cartOpen, closeCart } = useShopUi();
  const cart = useCart();

  return (
    <Drawer
      open={cartOpen} onClose={closeCart} title={`Cart [ ${cart.count} ]`}
      description={cart.lines.length === 0 ? undefined : `${cart.lines.length} ${cart.lines.length === 1 ? "vehicle" : "vehicles"}. Adding to the cart does not hold stock.`}
      closeLabel="Close cart"
      footer={cart.lines.length > 0 ? (
        <div className="space-y-3">
          <p className="t-label flex items-baseline justify-between text-dim"><span>Subtotal</span><span className="text-lg text-bone t-data tnum">{formatInr(cart.totals.subtotalPaise)}</span></p>
          <Link to="/cart" className={buttonClass("signal", "md", "w-full")}>Review purchase</Link>
          <Button variant="ghost" className="w-full" onClick={closeCart}>Continue browsing</Button>
        </div>
      ) : undefined}
    >
      {cart.lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4 p-6">
          <span aria-hidden="true" className="h-3 w-3 bg-signal" />
          <p className="t-md">Your cart is empty</p>
          <p className="text-dim">Add a vehicle from the floor. Nothing is reserved until you confirm a purchase.</p>
          <Link to="/floor" className={buttonClass("signal")}>Enter the floor</Link>
        </div>
      ) : (
        <ul>
          {cart.lines.map((line) => <CartLineRow key={line.item.vehicleId} line={line} onQuantity={cart.changeQuantity} onRemove={cart.remove} />)}
        </ul>
      )}
    </Drawer>
  );
}
