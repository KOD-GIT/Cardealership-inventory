import { makeVehicle, manyVehicles, sampleVehicles } from "../test/fixtures";
import {
  activeChips, type BrowseState, categoryCounts, DEFAULT_BROWSE, filterVehicles, inventoryMetrics, PAGE_SIZE, paginate, parseBrowse,
  serializeBrowse, sortVehicles,
} from "./browse";

const state = (patch: Partial<BrowseState> = {}): BrowseState => ({ ...DEFAULT_BROWSE, ...patch });
const models = (list: { model: string }[]) => list.map((vehicle) => vehicle.model);

describe("URL <-> browse state", () => {
  it("round-trips every field", () => {
    const original = state({ q: "bmw", category: "SEDAN", min: 100000, max: 9000000, inStockOnly: true, sort: "price-desc", page: 3 });
    expect(parseBrowse(serializeBrowse(original))).toEqual(original);
  });
  it("keeps the plain URL clean: defaults are omitted", () => {
    expect(serializeBrowse(DEFAULT_BROWSE).toString()).toBe("");
  });
  it("falls back to defaults for invalid or hostile values", () => {
    const parsed = parseBrowse(new URLSearchParams(`cat=SPACESHIP&sort=lol&min=abc&max=-4&page=0&stock=maybe&q=${"x".repeat(200)}`));
    expect(parsed).toEqual({ ...DEFAULT_BROWSE, q: "x".repeat(80) });
  });
});

describe("filterVehicles", () => {
  it("searches make and model, ignoring case", () => {
    expect(models(filterVehicles(sampleVehicles, state({ q: "bmw" })))).toEqual(["330Li M Sport"]);
    expect(models(filterVehicles(sampleVehicles, state({ q: "creta sx" })))).toEqual(["Creta SX"]);
  });
  it("filters by category", () => {
    expect(filterVehicles(sampleVehicles, state({ category: "SUV" }))).toHaveLength(3);
  });
  it("treats the price range as inclusive at both ends", () => {
    // Swift is exactly 8,15,000 (the minimum) and Creta exactly 16,20,000 (the maximum): both stay, Thar (17,30,000) goes.
    const result = filterVehicles(sampleVehicles, state({ min: 815000, max: 1620000 }));
    expect(models(result)).toEqual(["Swift ZXi", "Creta SX"]);
  });
  it("can show only vehicles in stock", () => {
    const result = filterVehicles(sampleVehicles, state({ inStockOnly: true }));
    expect(result.some((vehicle) => vehicle.quantity === 0)).toBe(false);
    expect(result).toHaveLength(5);
  });
  it("combines filters with AND", () => {
    expect(models(filterVehicles(sampleVehicles, state({ category: "SUV", inStockOnly: true, max: 2000000 })))).toEqual(["Creta SX"]);
  });
  it("returns an empty list, not an error, when nothing matches", () => {
    expect(filterVehicles(sampleVehicles, state({ q: "ferrari" }))).toEqual([]);
  });
});

describe("sortVehicles", () => {
  it("sorts newest by ARRIVAL time, never by model year", () => {
    // The fixture's model years (2024, none, 2019, none, none, 2024) are not in arrival order on purpose.
    expect(sortVehicles(sampleVehicles, "newest").map((vehicle) => vehicle.id)).toEqual([6, 5, 4, 3, 2, 1]);
  });
  it("breaks arrival ties by id", () => {
    const tied = [makeVehicle({ id: 1, created_at: "2026-01-01T00:00:00Z" }), makeVehicle({ id: 2, created_at: "2026-01-01T00:00:00Z" })];
    expect(sortVehicles(tied, "newest").map((vehicle) => vehicle.id)).toEqual([2, 1]);
  });
  it("sorts by price both ways", () => {
    expect(sortVehicles(sampleVehicles, "price-asc")[0].id).toBe(1);
    expect(sortVehicles(sampleVehicles, "price-desc")[0].id).toBe(6);
  });
  it("sorts by name and by stock (most first)", () => {
    expect(sortVehicles(sampleVehicles, "name")[0].make).toBe("Audi");
    expect(sortVehicles(sampleVehicles, "stock")[0].quantity).toBe(6);
  });
  it("does not change the array it was given", () => {
    const copy = [...sampleVehicles];
    sortVehicles(sampleVehicles, "price-desc");
    expect(sampleVehicles).toEqual(copy);
  });
});

describe("paginate", () => {
  it("pages AFTER filtering and sorting, with accurate counts", () => {
    const filtered = filterVehicles(manyVehicles(14), state({ q: "model 1" })); // Model 10..14 = 5 matches
    const page = paginate(sortVehicles(filtered, "name"), 1);
    expect([page.total, page.pageCount, page.items.length]).toEqual([5, 1, 5]);
  });
  it("splits a long list into pages of ten with a correct range", () => {
    const second = paginate(manyVehicles(14), 2);
    expect(PAGE_SIZE).toBe(10);
    expect(second.items).toHaveLength(4);
    expect([second.from, second.to, second.total, second.pageCount]).toEqual([11, 14, 14, 2]);
  });
  it("clamps an out-of-range page and handles an empty list", () => {
    expect(paginate(manyVehicles(14), 99).page).toBe(2);
    expect(paginate([], 1)).toMatchObject({ items: [], total: 0, from: 0, to: 0, pageCount: 1 });
  });
});

describe("chips, counts and metrics", () => {
  it("makes one removable chip per active filter, never for sort or page", () => {
    const chips = activeChips(state({ q: "bmw", category: "SUV", min: 1000, inStockOnly: true, sort: "name", page: 2 }));
    expect(chips.map((chip) => chip.id)).toEqual(["q", "cat", "min", "stock"]);
    expect(chips.find((chip) => chip.id === "cat")?.clear).toEqual({ category: null });
  });
  it("counts vehicles per category", () => {
    expect(categoryCounts(sampleVehicles)).toMatchObject({ SUV: 3, SEDAN: 1, HATCHBACK: 1, COUPE: 1, VAN: 0 });
  });
  it("computes metrics from the vehicles, value as price x stock", () => {
    const metrics = inventoryMetrics(sampleVehicles, 2);
    expect(metrics).toMatchObject({ models: 6, units: 16, low: 2, out: 1, inStock: 5 });
    expect(metrics.valuePaise).toBe((815000 * 6 + 1620000 * 4 + 4680000 * 1 + 0 + 6200000 * 2 + 24000000 * 3) * 100);
  });
});
