/**
 * Money is carried as integer PAISE (1 rupee = 100 paise) so sums never drift the way floats do
 * (0.1 + 0.2). The API sends rupees as a JSON number; convert at the edge with `toPaise` and back with
 * `fromPaise` when talking to the API.
 */
const PAISE_PER_RUPEE = 100;
const LAKH = 100_000 * PAISE_PER_RUPEE;
const CRORE = 10_000_000 * PAISE_PER_RUPEE;

export const toPaise = (rupees: number): number => Math.round(rupees * PAISE_PER_RUPEE);
export const fromPaise = (paise: number): number => paise / PAISE_PER_RUPEE;
export const sumPaise = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const wholeRupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const withPaise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });

/** 24200000 rupees -> "₹2,42,00,000" (Indian digit grouping). Paise are shown only when present. */
export function formatInr(paise: number): string {
  const rounded = Math.round(paise);
  return rounded % PAISE_PER_RUPEE === 0 ? wholeRupees.format(rounded / PAISE_PER_RUPEE) : withPaise.format(rounded / PAISE_PER_RUPEE);
}

/** Convenience for the API's rupee numbers. */
export const formatRupees = (rupees: number): string => formatInr(toPaise(rupees));

/** Short form for large totals: "₹4.44 Cr", "₹8.15 L", otherwise the full figure. */
export function formatInrCompact(paise: number): string {
  const abs = Math.abs(paise);
  const trim = (value: number) => value.toFixed(2).replace(/\.?0+$/, "");
  if (abs >= CRORE) return `₹${trim(paise / CRORE)} Cr`;
  if (abs >= LAKH) return `₹${trim(paise / LAKH)} L`;
  return formatInr(paise);
}

/**
 * Parses what a person types into a price box: "8,15,000", "₹ 8,15,000", "815000.50".
 * Returns rupees, or null when it is not a clean non-negative number.
 */
export function parseRupees(text: string): number | null {
  const cleaned = text.replace(/[₹,\s]/g, "");
  if (cleaned === "" || !/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned);
}
