import { apiErrorMessage } from "../lib/errors";
import { toPaise } from "../lib/money";
import type { Vehicle } from "../types";

/**
 * Buying one or more vehicles.
 *
 * The API purchases ONE vehicle per request. There is no multi-item transaction, so this code does not
 * pretend there is one:
 *  1. Stock is re-read first. If any line can no longer be satisfied, NOTHING is bought and the problems are
 *     returned, so the person can adjust the cart (the cart itself is never changed here).
 *  2. Otherwise the lines are bought one by one. A line that fails (for example someone else bought the
 *     last unit a moment earlier) is reported as failed; lines that already succeeded stay bought and are
 *     reported as such. Nothing is rolled back, because a purchase cannot be undone.
 */
export interface CheckoutLine { vehicleId: number; name: string; quantity: number }

export interface BoughtLine extends CheckoutLine {
  /** price per unit when the sale happened, in paise (taken from the server's reply) */
  unitPaise: number;
  /** stock left after the sale, from the server's reply */
  resulting: number;
}
export interface FailedLine { line: CheckoutLine; message: string }
export interface StaleProblem { vehicleId: number; name: string; message: string }

export type CheckoutResult =
  | { kind: "stale"; problems: StaleProblem[] }
  | { kind: "done"; bought: BoughtLine[]; failed: FailedLine[] };

export interface CheckoutDeps {
  fetchFresh: () => Promise<Vehicle[]>;
  purchase: (vehicleId: number, quantity: number) => Promise<Vehicle>;
}

export async function runCheckout(lines: CheckoutLine[], deps: CheckoutDeps): Promise<CheckoutResult> {
  const fresh = new Map((await deps.fetchFresh()).map((vehicle) => [vehicle.id, vehicle]));

  const problems: StaleProblem[] = [];
  for (const line of lines) {
    const vehicle = fresh.get(line.vehicleId);
    if (!vehicle) problems.push({ vehicleId: line.vehicleId, name: line.name, message: "No longer in the inventory." });
    else if (vehicle.quantity <= 0) problems.push({ vehicleId: line.vehicleId, name: line.name, message: "Out of stock." });
    else if (vehicle.quantity < line.quantity) {
      problems.push({ vehicleId: line.vehicleId, name: line.name, message: `Only ${vehicle.quantity} left, you asked for ${line.quantity}.` });
    }
  }
  if (problems.length > 0) return { kind: "stale", problems };

  const bought: BoughtLine[] = [];
  const failed: FailedLine[] = [];
  for (const line of lines) {
    try {
      const after = await deps.purchase(line.vehicleId, line.quantity);
      bought.push({ ...line, unitPaise: toPaise(after.price), resulting: after.quantity });
    } catch (error) {
      failed.push({ line, message: apiErrorMessage(error, "The purchase could not be completed.") });
    }
  }
  return { kind: "done", bought, failed };
}
