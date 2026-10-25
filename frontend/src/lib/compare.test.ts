import { resolveExtras } from "../data/catalogue";
import { makeVehicle, sampleVehicles } from "../test/fixtures";
import { buildCompareRows, MAX_COMPARE, NOT_PROVIDED, pruneIds, pushRecent, RECENT_LIMIT, toggleCompare } from "./compare";

describe("toggleCompare", () => {
  it("adds up to three, refuses a fourth, and removes on a second toggle", () => {
    let ids: number[] = [];
    for (const id of [1, 2, 3]) ids = toggleCompare(ids, id).ids;
    expect(ids).toEqual([1, 2, 3]);
    expect(toggleCompare(ids, 4)).toEqual({ ids: [1, 2, 3], result: "full" });
    expect(toggleCompare(ids, 2)).toEqual({ ids: [1, 3], result: "removed" });
    expect(MAX_COMPARE).toBe(3);
  });
});

describe("buildCompareRows", () => {
  const [swift, , , , bmw] = sampleVehicles;
  const rows = buildCompareRows([swift, bmw], (vehicle) => resolveExtras(vehicle, undefined));
  const row = (label: string) => rows.find((r) => r.label === label);

  it("always starts with price, category, availability and year", () => {
    expect(rows.slice(0, 4).map((r) => r.label)).toEqual(["Price", "Category", "Availability", "Model year"]);
  });
  it("marks rows that differ", () => {
    expect(row("Price")?.differs).toBe(true);
    expect(row("Category")?.differs).toBe(true);
  });
  it("says 'Not provided' instead of inventing specs, and unions the spec labels", () => {
    expect(row("Engine")).toBeUndefined(); // neither of these two has an "Engine" entry
    expect(row("Wheelbase")?.values).toEqual([NOT_PROVIDED, "2,961 mm"]); // only the BMW has data
  });
  it("marks identical rows as not different", () => {
    const twin = buildCompareRows([makeVehicle({ id: 7 }), makeVehicle({ id: 8 })], (vehicle) => resolveExtras(vehicle, undefined));
    expect(twin.every((r) => !r.differs)).toBe(true);
  });
});

describe("recently viewed helpers", () => {
  it("puts the newest first, without duplicates", () => {
    expect(pushRecent([3, 2, 1], 2)).toEqual([2, 3, 1]);
  });
  it("keeps at most six", () => {
    let ids: number[] = [];
    for (let id = 1; id <= 9; id++) ids = pushRecent(ids, id);
    expect(ids).toHaveLength(RECENT_LIMIT);
    expect(ids[0]).toBe(9);
  });
  it("drops vehicles that no longer exist", () => {
    expect(pruneIds([5, 6, 7], new Set([5, 7]))).toEqual([5, 7]);
  });
});
