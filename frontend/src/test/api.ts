import { http, HttpResponse } from "msw";
import type { Vehicle, VehicleInput } from "../types";
import { sampleVehicles } from "./fixtures";
import { API, server } from "./server";

/**
 * A stateful stand-in for the real inventory API that behaves the way the backend does: purchases decrement stock
 * atomically and answer 409 "Out of stock" when there is not enough, restock adds, create/update/delete work.
 * Tests can read `.vehicles` to see what the "server" holds, and `.calls` to see what was sent.
 */
export function mockInventoryApi(initial: Vehicle[] = sampleVehicles) {
  const state = {
    vehicles: initial.map((vehicle) => ({ ...vehicle })),
    calls: { purchase: [] as { id: number; quantity: number }[], restock: [] as { id: number; quantity: number }[], list: 0 },
    /** make the next purchase of this id fail with a server error (for partial-failure tests) */
    failPurchaseFor: new Set<number>(),
  };
  const find = (id: string | readonly string[]) => state.vehicles.find((vehicle) => vehicle.id === Number(id));
  const notFound = () => HttpResponse.json({ detail: "Vehicle not found" }, { status: 404 });

  server.use(
    http.get(`${API}/api/vehicles`, ({ request }) => {
      // like the backend: skip/limit paging, 50 per page when no limit is given
      const url = new URL(request.url);
      const skip = Number(url.searchParams.get("skip") ?? 0);
      const limit = Number(url.searchParams.get("limit") ?? 50);
      state.calls.list += 1;
      return HttpResponse.json(state.vehicles.slice(skip, skip + limit));
    }),
    http.post(`${API}/api/vehicles/:id/purchase`, async ({ params, request }) => {
      const vehicle = find(params.id as string);
      if (!vehicle) return notFound();
      const body = (await request.json().catch(() => null)) as { quantity?: number } | null;
      const quantity = body?.quantity ?? 1;
      state.calls.purchase.push({ id: vehicle.id, quantity });
      if (state.failPurchaseFor.has(vehicle.id)) return HttpResponse.json({ detail: "Out of stock" }, { status: 409 });
      if (vehicle.quantity < quantity) return HttpResponse.json({ detail: "Out of stock" }, { status: 409 });
      vehicle.quantity -= quantity;
      return HttpResponse.json(vehicle);
    }),
    http.post(`${API}/api/vehicles/:id/restock`, async ({ params, request }) => {
      const vehicle = find(params.id as string);
      if (!vehicle) return notFound();
      const { quantity } = (await request.json()) as { quantity: number };
      state.calls.restock.push({ id: vehicle.id, quantity });
      vehicle.quantity += quantity;
      return HttpResponse.json(vehicle);
    }),
    http.post(`${API}/api/vehicles`, async ({ request }) => {
      const input = (await request.json()) as VehicleInput;
      const created: Vehicle = { ...input, id: Math.max(0, ...state.vehicles.map((vehicle) => vehicle.id)) + 1, created_at: new Date().toISOString() };
      state.vehicles.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(`${API}/api/vehicles/:id`, async ({ params, request }) => {
      const vehicle = find(params.id as string);
      if (!vehicle) return notFound();
      Object.assign(vehicle, (await request.json()) as Partial<VehicleInput>);
      return HttpResponse.json(vehicle);
    }),
    http.delete(`${API}/api/vehicles/:id`, ({ params }) => {
      const vehicle = find(params.id as string);
      if (!vehicle) return notFound();
      state.vehicles = state.vehicles.filter((existing) => existing.id !== vehicle.id);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return state;
}
