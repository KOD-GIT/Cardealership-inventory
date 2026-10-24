const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** 27999.99 -> "$27,999.99" (one formatter so prices look identical everywhere). */
export function formatPrice(amount: number): string {
  return currency.format(amount);
}

const CATEGORY_LABELS: Record<string, string> = {
  SEDAN: "Sedan", SUV: "SUV", HATCHBACK: "Hatchback", COUPE: "Coupe",
  CONVERTIBLE: "Convertible", TRUCK: "Truck", VAN: "Van",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
