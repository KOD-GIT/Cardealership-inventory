import type { Vehicle, VehicleInput, VehicleSearchParams } from "../types";
import { api } from "./client";

export const hasFilters = (p: VehicleSearchParams): boolean =>
  Object.values(p).some((v) => v !== undefined && v !== "");

const PAGE_SIZE = 100;

/** The API answers one page at a time, so keep asking until a page comes back short. */
export async function fetchVehicles(params: VehicleSearchParams = {}): Promise<Vehicle[]> {
  const path = hasFilters(params) ? "/api/vehicles/search" : "/api/vehicles";
  const all: Vehicle[] = [];
  for (let skip = 0; ; skip += PAGE_SIZE) {
    const { data } = await api.get<Vehicle[]>(path, { params: { ...params, skip, limit: PAGE_SIZE } });
    all.push(...data);
    if (data.length < PAGE_SIZE) return all;
  }
}

export const createVehicle = async (input: VehicleInput): Promise<Vehicle> =>
  (await api.post<Vehicle>("/api/vehicles", input)).data;

export const updateVehicle = async (id: number, input: Partial<VehicleInput>): Promise<Vehicle> =>
  (await api.put<Vehicle>(`/api/vehicles/${id}`, input)).data;

export const deleteVehicle = async (id: number): Promise<void> => {
  await api.delete(`/api/vehicles/${id}`);
};

export const purchaseVehicle = async (id: number, quantity = 1): Promise<Vehicle> =>
  (await api.post<Vehicle>(`/api/vehicles/${id}/purchase`, { quantity })).data;

export const restockVehicle = async (id: number, quantity: number): Promise<Vehicle> =>
  (await api.post<Vehicle>(`/api/vehicles/${id}/restock`, { quantity })).data;
