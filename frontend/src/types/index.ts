// Mirrors docs/API_CONTRACT.md
export const CATEGORIES = ["SEDAN", "SUV", "HATCHBACK", "COUPE", "CONVERTIBLE", "TRUCK", "VAN"] as const;
export type VehicleCategory = (typeof CATEGORIES)[number];
export type Role = "USER" | "ADMIN";

export interface User { id: number; email: string; role: Role }
export interface TokenResponse { access_token: string; token_type: "bearer"; user: User }

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: VehicleCategory;
  price: number; // decimal currency units, e.g. 27999.99
  quantity: number;
  year: number | null;
  image_url: string | null;
}
/** Body of POST /api/vehicles and PUT /api/vehicles/:id */
export type VehicleInput = Omit<Vehicle, "id">;

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: VehicleCategory;
  min_price?: number;
  max_price?: number;
}
