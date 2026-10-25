import { AxiosError } from "axios";
import { makeVehicle } from "../test/fixtures";
import { type CheckoutLine, runCheckout } from "./checkout";

const lines: CheckoutLine[] = [
  { vehicleId: 1, name: "Swift", quantity: 2 },
  { vehicleId: 2, name: "Creta", quantity: 1 },
];
const stock = (swift: number, creta: number) => () => Promise.resolve([makeVehicle({ id: 1, quantity: swift }), makeVehicle({ id: 2, quantity: creta })]);

describe("runCheckout", () => {
  it("buys nothing and reports why when stock changed since the cart was filled", async () => {
    const purchase = vi.fn();
    const result = await runCheckout(lines, { fetchFresh: stock(1, 0), purchase });
    expect(purchase).not.toHaveBeenCalled();
    expect(result).toEqual({
      kind: "stale",
      problems: [
        { vehicleId: 1, name: "Swift", message: "Only 1 left, you asked for 2." },
        { vehicleId: 2, name: "Creta", message: "Out of stock." },
      ],
    });
  });

  it("reports a vehicle that was deleted meanwhile", async () => {
    const result = await runCheckout([{ vehicleId: 9, name: "Ghost", quantity: 1 }], { fetchFresh: stock(5, 5), purchase: vi.fn() });
    expect(result).toMatchObject({ kind: "stale", problems: [{ vehicleId: 9, message: "No longer in the inventory." }] });
  });

  it("buys every line and records the server's price and remaining stock", async () => {
    const purchase = vi.fn(async (id: number, quantity: number) => makeVehicle({ id, price: 1000 * id, quantity: 10 - quantity }));
    const result = await runCheckout(lines, { fetchFresh: stock(5, 5), purchase });
    expect(purchase.mock.calls).toEqual([[1, 2], [2, 1]]);
    expect(result).toEqual({
      kind: "done", failed: [],
      bought: [
        { vehicleId: 1, name: "Swift", quantity: 2, unitPaise: 100000, resulting: 8 },
        { vehicleId: 2, name: "Creta", quantity: 1, unitPaise: 200000, resulting: 9 },
      ],
    });
  });

  it("reports a partial failure accurately: what was bought stays bought, the rest failed", async () => {
    const conflict = Object.assign(new AxiosError("conflict"), { response: { status: 409, data: { detail: "Out of stock" } } });
    const purchase = vi.fn(async (id: number) => { if (id === 2) throw conflict; return makeVehicle({ id, quantity: 3 }); });
    const result = await runCheckout(lines, { fetchFresh: stock(5, 5), purchase });
    expect(result.kind).toBe("done");
    if (result.kind !== "done") return;
    expect(result.bought.map((line) => line.vehicleId)).toEqual([1]);
    expect(result.failed).toEqual([{ line: lines[1], message: "Out of stock" }]);
  });
});
