import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CheckoutLine, CheckoutResult } from "../../data/checkout";
import { useCheckout } from "../../hooks/useCheckout";
import { formatInr, sumPaise } from "../../lib/money";
import { Button, buttonClass } from "../ui/Button";
import { Modal } from "../ui/Modal";

export interface PurchaseItem extends CheckoutLine { unitPaise: number }

interface Props {
  open: boolean;
  onClose: () => void;
  items: PurchaseItem[];
  /** true for the cart (bought lines leave the cart); false for "Purchase now" (the cart is left alone) */
  fromCart: boolean;
  title?: string;
}

const money = (paise: number) => <span className="t-data tnum">{formatInr(paise)}</span>;

/**
 * Review -> confirm -> result. Nothing is bought until "Confirm purchase". The result is built from what the
 * server actually confirmed, so it can say plainly which vehicles were bought, which were not and why.
 * No payment details are ever collected.
 */
export function PurchaseDialog({ open, onClose, items, fromCart, title = "Review purchase" }: Props) {
  const { checkout, busy } = useCheckout();
  const [result, setResult] = useState<CheckoutResult | null>(null);

  // Opening again starts a fresh review.
  useEffect(() => { if (open) setResult(null); }, [open]);

  const totalPaise = sumPaise(items.map((item) => item.unitPaise * item.quantity));
  const units = items.reduce((sum, item) => sum + item.quantity, 0);

  const confirm = async () => {
    const outcome = await checkout(items.map(({ vehicleId, name, quantity }) => ({ vehicleId, name, quantity })), { fromCart });
    if (outcome) setResult(outcome);
  };

  if (result) return <Modal open={open} onClose={onClose} title={resultTitle(result)} size="md" footer={<ResultFooter result={result} onClose={onClose} />}><ResultBody result={result} /></Modal>;

  return (
    <Modal
      open={open} onClose={busy ? () => undefined : onClose} title={title} size="md"
      description="Confirming records a sale for each vehicle and reduces its stock. No payment details are collected."
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="signal" onClick={confirm} loading={busy} disabled={items.length === 0}>
            Confirm purchase of {units} {units === 1 ? "unit" : "units"}
          </Button>
        </>
      )}
    >
      <ul className="divide-y divide-line border border-line">
        {items.map((item) => (
          <li key={item.vehicleId} className="flex items-baseline justify-between gap-4 p-3">
            <span className="min-w-0">
              <span className="t-sm block truncate">{item.name}</span>
              <span className="t-label text-dim">{item.quantity} × {formatInr(item.unitPaise)}</span>
            </span>
            {money(item.unitPaise * item.quantity)}
          </li>
        ))}
      </ul>
      <p className="t-label mt-4 flex items-center justify-between border-t border-line pt-4 text-dim">
        <span>Total</span> <span className="text-lg text-bone">{money(totalPaise)}</span>
      </p>
    </Modal>
  );
}

function resultTitle(result: CheckoutResult): string {
  if (result.kind === "stale") return "Stock has changed";
  if (result.bought.length === 0) return "Purchase not completed";
  return result.failed.length > 0 ? "Purchase partly completed" : "Purchase complete";
}

function ResultBody({ result }: { result: CheckoutResult }) {
  if (result.kind === "stale") {
    return (
      <div role="status">
        <p className="mb-4 text-dim">Nothing was purchased and your cart is unchanged. Adjust it and try again.</p>
        <ul className="divide-y divide-line border border-line">
          {result.problems.map((problem) => (
            <li key={problem.vehicleId} className="p-3"><span className="t-sm block">{problem.name}</span><span className="text-sm text-signal">{problem.message}</span></li>
          ))}
        </ul>
      </div>
    );
  }
  const total = sumPaise(result.bought.map((line) => line.unitPaise * line.quantity));
  return (
    <div role="status" className="space-y-5">
      {result.bought.length > 0 ? (
        <section aria-label="Purchased">
          <h3 className="t-label mb-2 text-lime">Purchased</h3>
          <ul className="divide-y divide-line border border-line">
            {result.bought.map((line) => (
              <li key={line.vehicleId} className="flex items-baseline justify-between gap-4 p-3">
                <span className="min-w-0"><span className="t-sm block truncate">{line.name}</span><span className="t-label text-dim">{line.quantity} × {formatInr(line.unitPaise)} · {line.resulting} left</span></span>
                {money(line.unitPaise * line.quantity)}
              </li>
            ))}
          </ul>
          <p className="t-label mt-3 flex justify-between text-dim"><span>Total recorded</span>{money(total)}</p>
        </section>
      ) : null}
      {result.failed.length > 0 ? (
        <section aria-label="Not purchased">
          <h3 className="t-label mb-2 text-signal">Not purchased</h3>
          <ul className="divide-y divide-line border border-signal">
            {result.failed.map(({ line, message }) => (
              <li key={line.vehicleId} className="p-3"><span className="t-sm block">{line.name}</span><span className="text-sm text-signal">{message}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-dim">
            {result.bought.length > 0
              ? "The vehicles listed as purchased were bought and cannot be undone here. The others stay in your cart. The purchases are separate, not one transaction."
              : "Nothing was bought. Your cart is unchanged."}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function ResultFooter({ result, onClose }: { result: CheckoutResult; onClose: () => void }) {
  const bought = result.kind === "done" && result.bought.length > 0;
  return (
    <>
      {bought ? <Link to="/history" onClick={onClose} className={buttonClass("ghost")}>View purchase history</Link> : null}
      <Button variant="signal" onClick={onClose}>Done</Button>
    </>
  );
}
