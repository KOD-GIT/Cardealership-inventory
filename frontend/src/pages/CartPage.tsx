import { useState } from "react";
import { Link } from "react-router-dom";
import { CartLineRow } from "../components/cart/CartLineRow";
import { PurchaseDialog } from "../components/cart/PurchaseDialog";
import { Button, buttonClass } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState, ErrorState, PageHeader } from "../components/ui/States";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCart } from "../hooks/useShop";
import { useInventory } from "../hooks/useVehicles";
import { vehicleName } from "../lib/format";
import { formatInr } from "../lib/money";

export default function CartPage() {
  useDocumentTitle("Cart");
  const cart = useCart();
  const inventory = useInventory();
  const [reviewing, setReviewing] = useState(false);

  const buyable = cart.lines.filter((line) => line.quantity > 0 && line.vehicle);
  const items = buyable.map((line) => ({
    vehicleId: line.item.vehicleId, name: vehicleName(line.vehicle!), quantity: line.quantity, unitPaise: line.unitPaise,
  }));

  return (
    <>
      <PageHeader overline={`Cart / ${cart.count} ${cart.count === 1 ? "unit" : "units"}`} title="Your cart" />

      <div className="p-4 lg:p-10">
        {inventory.isLoading ? <Skeleton className="h-64 w-full" /> : inventory.isError ? (
          <ErrorState message="The cart could not be checked against the current stock." onRetry={() => inventory.refetch()} />
        ) : cart.lines.length === 0 ? (
          <EmptyState title="Your cart is empty" action={{ label: "Continue browsing", to: "/floor" }}>
            Add a vehicle from the floor. Adding to the cart does not reserve it or reduce stock.
          </EmptyState>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <ul aria-label="Cart lines" className="border-x border-t border-line lg:col-span-8">
              {cart.lines.map((line) => <CartLineRow key={line.item.vehicleId} line={line} onQuantity={cart.changeQuantity} onRemove={cart.remove} />)}
            </ul>

            <aside aria-label="Order summary" className="h-fit border border-line bg-charcoal lg:sticky lg:top-24 lg:col-span-4">
              <h2 className="t-label border-b border-line p-4 text-dim">Summary</h2>
              <dl className="space-y-3 p-4">
                <div className="flex justify-between"><dt className="text-dim">Vehicles</dt><dd className="t-data">{buyable.length}</dd></div>
                <div className="flex justify-between"><dt className="text-dim">Units</dt><dd className="t-data">{cart.totals.units}</dd></div>
                <div className="flex items-baseline justify-between border-t border-line pt-3"><dt className="t-label">Subtotal</dt><dd className="t-data text-xl font-bold">{formatInr(cart.totals.subtotalPaise)}</dd></div>
              </dl>
              {cart.totals.problemLines > 0 ? (
                <p role="status" className="mx-4 mb-4 border border-signal p-3 text-sm text-signal">
                  {cart.totals.problemLines} {cart.totals.problemLines === 1 ? "line cannot" : "lines cannot"} be purchased right now and {cart.totals.problemLines === 1 ? "is" : "are"} left out of this total.
                </p>
              ) : null}
              <div className="space-y-3 border-t border-line p-4">
                <Button variant="signal" className="w-full" disabled={items.length === 0} onClick={() => setReviewing(true)}>Review purchase</Button>
                <Link to="/floor" className={buttonClass("ghost", "md", "w-full")}>Continue browsing</Link>
                <p className="text-sm text-muted">Nothing is bought until you confirm. Stock is checked again at that moment, and no payment details are collected.</p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <PurchaseDialog open={reviewing} onClose={() => setReviewing(false)} items={items} fromCart />
    </>
  );
}
