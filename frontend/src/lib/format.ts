import type { Vehicle, VehicleCategory } from "../types";

const CATEGORY_LABELS: Record<string, string> = {
  SEDAN: "Sedan", SUV: "SUV", HATCHBACK: "Hatchback", COUPE: "Coupe",
  CONVERTIBLE: "Convertible", TRUCK: "Truck", VAN: "Van",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

export const vehicleName = (vehicle: Pick<Vehicle, "make" | "model">): string => `${vehicle.make} ${vehicle.model}`;

/** Stock reference shown on cells and details, derived from the stable vehicle id: id 7 -> "0007". */
export const stockRef = (id: number): string => String(id).padStart(4, "0");

const dateTime = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" });
const timeOnly = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "Unknown time" : dateTime.format(date);
}

export function formatClock(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--:--" : timeOnly.format(date);
}

export type { VehicleCategory };
