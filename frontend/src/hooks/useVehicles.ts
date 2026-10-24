import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVehicle, deleteVehicle, fetchVehicles, purchaseVehicle, restockVehicle, updateVehicle,
} from "../api/vehicles";
import type { VehicleInput, VehicleSearchParams } from "../types";

export const VEHICLES_KEY = ["vehicles"] as const;

export function useVehicles(params: VehicleSearchParams = {}) {
  return useQuery({ queryKey: [...VEHICLES_KEY, params], queryFn: () => fetchVehicles(params) });
}

/** Every write refreshes all vehicle lists so dashboard and admin never disagree. */
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
