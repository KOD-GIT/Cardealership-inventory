import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createVehicle, deleteVehicle, fetchVehicles, purchaseVehicle, restockVehicle, updateVehicle,
} from "../api/vehicles";
import { useAuth } from "../context/AuthContext";
import type { Vehicle, VehicleInput, VehicleSearchParams } from "../types";

export const VEHICLES_KEY = ["vehicles"] as const;

export function useVehicles(params: VehicleSearchParams = {}, options: { enabled?: boolean } = {}) {
  return useQuery({ queryKey: [...VEHICLES_KEY, params], queryFn: () => fetchVehicles(params), enabled: options.enabled ?? true });
}

const NONE: Vehicle[] = [];

/**
 * THE shared inventory: every vehicle, fetched once and cached. The Floor, details, cart, watchlist, compare,
 * quick view and the ledger all read this one list, so an administrator's change reaches all of them together.
 * Filtering, sorting and paging happen on this full collection in the browser. Only runs while signed in,
 * because the API requires a login for vehicle data.
 */
export function useInventory() {
  const { user } = useAuth();
  const query = useVehicles({}, { enabled: Boolean(user) });
  const vehicles = query.data ?? NONE;
  const byId = useMemo(() => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])), [vehicles]);
  return {
    vehicles, byId,
    isLoading: query.isLoading, isError: query.isError, error: query.error, isSuccess: query.isSuccess,
    isFetching: query.isFetching, refetch: query.refetch, dataUpdatedAt: query.dataUpdatedAt,
  };
}

/** Every write refreshes all vehicle lists so every screen agrees. */
function useVehicleMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSettled: () => queryClient.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export const usePurchaseVehicle = () =>
  useVehicleMutation(({ id, quantity }: { id: number; quantity?: number }) => purchaseVehicle(id, quantity));
export const useRestockVehicle = () =>
  useVehicleMutation(({ id, quantity }: { id: number; quantity: number }) => restockVehicle(id, quantity));
export const useCreateVehicle = () => useVehicleMutation((input: VehicleInput) => createVehicle(input));
export const useUpdateVehicle = () =>
  useVehicleMutation(({ id, input }: { id: number; input: Partial<VehicleInput> }) => updateVehicle(id, input));
export const useDeleteVehicle = () => useVehicleMutation((id: number) => deleteVehicle(id));
