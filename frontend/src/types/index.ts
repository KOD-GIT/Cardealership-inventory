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
  price: number; // rupees as the API sends them, e.g. 24200000 or 815000.5. Money maths uses paise (lib/money.ts)
  quantity: number;
  year: number | null;
  image_url: string | null;
  /** ISO-8601 time the vehicle was added to the inventory (arrival). Used for "Newest arrivals". */
  created_at: string;
}
/** Body of POST /api/vehicles and PUT /api/vehicles/:id (the server fills in id and created_at). */
export type VehicleInput = Omit<Vehicle, "id" | "created_at">;

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: VehicleCategory;
  min_price?: number;
  max_price?: number;
}
