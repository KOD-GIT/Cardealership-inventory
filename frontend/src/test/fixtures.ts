import type { User, Vehicle } from "../types";

export const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1, make: "Toyota", model: "Camry", category: "SEDAN", price: 2799999, quantity: 4, year: 2024, image_url: null,
  created_at: "2026-10-20T10:00:00Z",
  ...overrides,
});

export const customer: User = { id: 2, email: "jane@example.com", role: "USER" };
export const admin: User = { id: 1, email: "admin@dealership.com", role: "ADMIN" };

/** Arrival order is 1 (oldest) to 6 (newest). Model years are deliberately NOT in arrival order. */
export const sampleVehicles: Vehicle[] = [
  makeVehicle({ id: 1, make: "Maruti Suzuki", model: "Swift ZXi", category: "HATCHBACK", price: 815000, quantity: 6, year: 2024, image_url: "/images/vehicles/swift-zxi.jpg", created_at: "2026-10-20T10:00:00Z" }),
  makeVehicle({ id: 2, make: "Hyundai", model: "Creta SX", category: "SUV", price: 1620000, quantity: 4, year: null, image_url: "/images/vehicles/creta-sx.jpg", created_at: "2026-10-21T10:00:00Z" }),
  makeVehicle({ id: 3, make: "Toyota", model: "Fortuner 4x4", category: "SUV", price: 4680000, quantity: 1, year: 2019, image_url: "/images/vehicles/fortuner-4x4.jpg", created_at: "2026-10-22T10:00:00Z" }),
  makeVehicle({ id: 4, make: "Mahindra", model: "Thar LX", category: "SUV", price: 1730000, quantity: 0, year: null, image_url: "/images/vehicles/thar-lx.jpg", created_at: "2026-10-23T10:00:00Z" }),
  makeVehicle({ id: 5, make: "BMW", model: "330Li M Sport", category: "SEDAN", price: 6200000, quantity: 2, year: null, image_url: "/images/vehicles/bmw-330li-front.jpg", created_at: "2026-10-24T10:00:00Z" }),
  makeVehicle({ id: 6, make: "Audi", model: "R8 Coupé V10", category: "COUPE", price: 24000000, quantity: 3, year: 2024, image_url: "/images/vehicles/audi-r8-v10.jpg", created_at: "2026-10-25T10:00:00Z" }),
];

/** n vehicles, handy for pagination tests. */
export const manyVehicles = (n: number): Vehicle[] =>
  Array.from({ length: n }, (_, i) => makeVehicle({
    id: i + 1, make: "Make", model: `Model ${String(i + 1).padStart(2, "0")}`, price: 1_000_000 + i * 1000, quantity: 3,
    created_at: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
  }));
