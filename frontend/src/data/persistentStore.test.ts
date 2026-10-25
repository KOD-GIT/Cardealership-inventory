import { z } from "zod";
import { getStore, resetStoresForTests, type StoreSpec, storageKey } from "./persistentStore";

const numbers = z.array(z.number());
const spec: StoreSpec<number[]> = {
  name: "test-list", version: 1, initial: [], validate: (raw) => { const r = numbers.safeParse(raw); return r.success ? r.data : null; },
  trim: (list) => list.slice(-3),
};

afterEach(() => resetStoresForTests());

describe("persistent store", () => {
  it("starts from the initial value and persists changes in a versioned envelope", () => {
    const store = getStore(spec);
    expect(store.get()).toEqual([]);
    store.set([1, 2]);
    expect(JSON.parse(localStorage.getItem(storageKey("test-list"))!)).toEqual({ v: 1, data: [1, 2] });
  });

  it("loads what an earlier visit saved", () => {
    localStorage.setItem(storageKey("test-list"), JSON.stringify({ v: 1, data: [7, 8] }));
    expect(getStore(spec).get()).toEqual([7, 8]);
  });

  it("recovers from corrupt, wrongly-shaped or other-version data instead of crashing", () => {
    for (const bad of ["{not json", JSON.stringify({ v: 1, data: "oops" }), JSON.stringify({ v: 99, data: [1] }), JSON.stringify([1, 2]), "null"]) {
      localStorage.setItem(storageKey("test-list"), bad);
      resetStoresForTests();
      expect(getStore(spec).get()).toEqual([]);
    }
  });

  it("notifies subscribers and supports updater functions", () => {
    const store = getStore(spec);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set((current) => [...current, 5]);
    expect(store.get()).toEqual([5]);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.set([6]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("keeps lists bounded with trim", () => {
    const store = getStore(spec);
    store.set([1, 2, 3, 4, 5]);
    expect(store.get()).toEqual([3, 4, 5]);
  });

  it("keeps each scope (each signed-in user) separate", () => {
    getStore(spec, 1).set([1]);
    getStore(spec, 2).set([2]);
    expect(getStore(spec, 1).get()).toEqual([1]);
    expect(getStore(spec, 2).get()).toEqual([2]);
  });

  it("keeps working in memory when storage is unavailable", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    const store = getStore(spec);
    expect(() => store.set([4])).not.toThrow();
    expect(store.get()).toEqual([4]);
    setItem.mockRestore();
  });
});
