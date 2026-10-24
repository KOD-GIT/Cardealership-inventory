import type { User, Vehicle } from "../types";

export const makeVehicle = (overrides: Partial<Vehicle> = {}): Vehicle => ({
  id: 1, make: "Toyota", model: "Camry", category: "SEDAN", price: 27999.99, quantity: 4, year: 2024, image_url: null,
  ...overrides,
});

export const customer: User = { id: 2, email: "jane@example.com", role: "USER" };
export const admin: User = { id: 1, email: "admin@dealership.com", role: "ADMIN" };

export const sampleVehicles: Vehicle[] = [
  makeVehicle(),
  makeVehicle({ id: 2, make: "Honda", model: "Civic", category: "HATCHBACK", price: 22500, quantity: 1, year: 2023 }),
  makeVehicle({ id: 3, make: "Ford", model: "F-150", category: "TRUCK", price: 41250.5, quantity: 0, year: null }),
];
