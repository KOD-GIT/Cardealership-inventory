import { describe, expect, it } from "vitest";
import { sampleVehicles } from "../test/fixtures";
import { mockInventoryApi } from "../test/api";
import { fetchVehicles } from "./vehicles";

describe("fetchVehicles", () => {
  it("loads the whole inventory even when it is bigger than one page of the API", async () => {
    const many = Array.from({ length: 230 }, (_, i) => ({ ...sampleVehicles[0], id: i + 1, model: `Model ${i + 1}` }));
    mockInventoryApi(many);
    const loaded = await fetchVehicles();
    expect(loaded).toHaveLength(230);
    expect(new Set(loaded.map((v) => v.id)).size).toBe(230);
  });

  it("asks only once when the inventory fits in one page", async () => {
    const api = mockInventoryApi(sampleVehicles);
    await fetchVehicles();
    expect(api.calls.list).toBe(1);
  });
});
