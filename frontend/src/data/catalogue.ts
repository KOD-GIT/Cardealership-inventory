import type { Vehicle } from "../types";

/**
 * "Catalogue extras": presentation data the API does not carry yet (extra photographs, specifications,
 * featured flags). Defaults below hold ONLY what the supplied design provided, matched to a vehicle by
 * make+model. Administrators can override them per vehicle id (stored on this device, see repository.ts).
 * Anything not listed here is shown as "Not provided". Nothing here is a verified claim.
 */
export interface CatalogueExtras {
  /** Extra photographs of the SAME vehicle. The vehicle's own image_url is always shown first. */
  gallery: string[];
  /** CSS object-position for the main photograph when the default centre crop would hide the vehicle. */
  imagePosition: string | null;
  /** Specification label -> value. */
  specs: Record<string, string>;
  featured: boolean;
  newArrival: boolean;
  /** Position on the home carousel (1 = first). Null sorts last. */
  carouselOrder: number | null;
  /** Short editorial tag shown on cells, e.g. "V8 BITURBO". */
  tagline: string | null;
  /** One line under the name on the home carousel, e.g. "5.2L V10 FSI · 602 BHP". */
  headline: string | null;
}

export const EMPTY_EXTRAS: CatalogueExtras = {
  gallery: [], imagePosition: null, specs: {}, featured: false, newArrival: false, carouselOrder: null,
  tagline: null, headline: null,
};

/** "Audi R8 Coupé V10" -> "audi-r8-coupe-v10". Stable key for default extras. */
export function vehicleSlug(make: string, model: string): string {
  return `${make} ${model}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const P = "/images/vehicles/";

const DEFAULTS: Record<string, Partial<CatalogueExtras>> = {
  "audi-r8-coupe-v10": {
    gallery: [`${P}audi-r8-v10.jpg`, `${P}audi-r8-v10-hall.jpg`, `${P}audi-r8-v10-basalt.jpg`],
    specs: { Engine: "5.2L V10 FSI", Power: "602 BHP", Transmission: "S tronic", Drive: "All-wheel drive" },
    featured: true, carouselOrder: 1, tagline: "Naturally aspirated", headline: "5.2L V10 FSI · 602 BHP",
  },
  "mercedes-amg-gt-63-s": {
    gallery: [`${P}amg-gt63s-front.jpg`, `${P}amg-gt63s-rear.jpg`, `${P}amg-gt63s-cockpit.jpg`],
    specs: {
      Engine: "4.0L V8 BiTurbo", Power: "639 PS", Torque: "900 Nm @ 2,500 rpm", Gearbox: "9-speed MCT",
      Drive: "AMG 4MATIC+", Seats: "4", Displacement: "3,982 cc", "0–100 km/h": "3.2 seconds",
      "Top speed": "315 km/h (limited)", "Kerb weight": "2,120 kg", Brakes: "420 mm carbon ceramic",
      Wheels: "21-inch forged AMG cross-spoke", Exhaust: "Titanium with active flap",
    },
    featured: true, carouselOrder: 2, tagline: "V8 BiTurbo", headline: "4.0L V8 BITURBO · 639 PS · 4MATIC+",
  },
  "iso-rivolta-islero-400-gt": {
    gallery: [`${P}islero-400gt.jpg`],
    specs: { Engine: "5.4L Chevrolet 327 V8", Power: "350 HP", Gearbox: "5-speed manual" },
    featured: true, carouselOrder: 3, tagline: "Heritage vault", headline: "5.4L CHEVROLET 327 V8 · 350 HP · MANUAL",
  },
  "mercedes-amg-g-63-6x6": {
    gallery: [`${P}g63-6x6.jpg`],
    specs: { Engine: "5.5L twin-turbo V8", Power: "536 HP", Drive: "6×6" },
    featured: true, carouselOrder: 4, tagline: "Portal axles", headline: "5.5L TWIN-TURBO V8 · 536 HP · 6×6",
  },
  "mercedes-benz-cl-63-amg": {
    gallery: [`${P}cl63-amg.jpg`],
    specs: { Engine: "5.5L bi-turbo V8", Power: "536 HP", Drive: "Rear-wheel drive" },
  },
  "bmw-330li-m-sport": {
    gallery: [
      `${P}bmw-330li-front.jpg`, `${P}bmw-330li-studio.jpg`, `${P}bmw-330li-three-quarter.jpg`,
      `${P}bmw-330li-side.jpg`, `${P}bmw-330li-interior.jpg`, `${P}bmw-330li-rear.jpg`,
    ],
    specs: {
      Displacement: "1,998 cc", Configuration: "Inline-4 TwinPower turbo", Power: "258 HP @ 5,000 rpm",
      Torque: "400 Nm @ 1,550 rpm", "Fuel type": "Petrol", Transmission: "8-speed Steptronic",
      Drive: "Rear-wheel drive", "0–100 km/h": "6.2 seconds", Length: "4,823 mm", Width: "2,068 mm (incl. mirrors)",
      Height: "1,441 mm", Wheelbase: "2,961 mm", "Kerb weight": "1,645 kg", Wheels: "18-inch M double-spoke",
      Upholstery: "Vernasca Cognac", Audio: "Harman Kardon", "Infotainment": "BMW iDrive 8.5",
    },
    featured: true, carouselOrder: 5, tagline: "Long wheelbase", headline: "2.0L TWINPOWER TURBO · 258 HP · RWD",
  },
};

const DEFAULT_IMAGE_POSITIONS: Record<string, string> = { "mercedes-amg-g-63-6x6": "left center" };

/** Extras for a vehicle: defaults for its make+model, then any administrator overrides saved for its id. */
export function resolveExtras(
  vehicle: Pick<Vehicle, "make" | "model">,
  overrides: Partial<CatalogueExtras> | undefined,
): CatalogueExtras {
  const slug = vehicleSlug(vehicle.make, vehicle.model);
  return {
    ...EMPTY_EXTRAS,
    imagePosition: DEFAULT_IMAGE_POSITIONS[slug] ?? null,
    ...DEFAULTS[slug],
    ...overrides,
  };
}

/** Photographs of one vehicle, its own image first, no duplicates. May be empty (the UI then shows a fallback). */
export function galleryFor(vehicle: Pick<Vehicle, "image_url">, extras: CatalogueExtras): string[] {
  const all = [vehicle.image_url, ...extras.gallery].filter((src): src is string => Boolean(src));
  return all.filter((src, index) => all.indexOf(src) === index);
}
