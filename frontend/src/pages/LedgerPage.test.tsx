import { screen, waitFor, within } from "@testing-library/react";
import { mockInventoryApi } from "../test/api";
import { admin } from "../test/fixtures";
import { renderApp } from "../test/utils";

const THAR = "Mahindra Thar LX";
const SWIFT = "Maruti Suzuki Swift ZXi";
const low = () => screen.getByRole("region", { name: "Low-stock manifest" });
const full = () => screen.getByRole("region", { name: "Full inventory" });
const movements = () => screen.getByRole("region", { name: "Recent stock movements" });

const open = async () => {
  const api = mockInventoryApi();
  const view = renderApp("/ledger", { signedInAs: admin });
  await screen.findByRole("heading", { level: 1, name: "The Ledger" });
  await screen.findByRole("region", { name: "Key figures" });
  return { api, ...view };
};

describe("Ledger: figures", () => {
  it("calculates the key figures from the inventory", async () => {
    await open();
    const figures = screen.getByRole("region", { name: "Key figures" });
    const value = (label: RegExp) => within(figures).getByText(label).nextElementSibling?.textContent;
    expect(value(/Models logged/)).toBe("6");
    expect(value(/Units in stock/)).toBe("16");
    expect(value(/Low stock/)).toBe("3"); // Fortuner (1), BMW (2) and the sold-out Thar (0)
    expect(within(figures).getByText(/Inventory value ₹10/)).toBeInTheDocument(); // sum of price x stock
  });

  it("does not invent sales: with no recorded purchases it says so", async () => {
    await open();
    const figures = screen.getByRole("region", { name: "Key figures" });
    expect(within(figures).getByText("No sales recorded on this device yet")).toBeInTheDocument();
    expect(within(figures).getByText(/Sales this month/).nextElementSibling).toHaveTextContent("–");
  });

  it("lists exactly the vehicles at or below two units in the low-stock manifest", async () => {
    await open();
    const rows = within(low()).getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[0].textContent);
    expect(rows).toEqual([THAR, "Toyota Fortuner 4x4", "BMW 330Li M Sport"]); // fewest first
  });

  it("is honest that movements are recorded on this device only", async () => {
    await open();
    expect(screen.getByText(/recorded by this application on this device \(demonstration data\)/)).toBeInTheDocument();
    expect(within(movements()).getByText(/No stock movements have been recorded on this device yet/)).toBeInTheDocument();
  });

  it("offers an honest Refresh, not a fake 'reconcile'", async () => {
    const { api, user } = await open();
    const before = api.calls.list;
    await user.click(screen.getByRole("button", { name: "Refresh inventory" }));
    await waitFor(() => expect(api.calls.list).toBeGreaterThan(before));
    expect(screen.queryByText(/reconcile/i)).not.toBeInTheDocument();
  });
});

describe("Ledger: restock", () => {
  it("restocks a vehicle, updates every figure and records the movement", async () => {
    const { api, user } = await open();
    await user.click(within(low()).getByRole("button", { name: `Restock ${THAR}` }));
    const dialog = screen.getByRole("dialog", { name: `Restock ${THAR}` });
    await user.type(within(dialog).getByLabelText("Units to add"), "5");
    expect(within(dialog).getByText("New total: 5")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Add stock" }));

    await waitFor(() => expect(api.calls.restock).toEqual([{ id: 4, quantity: 5 }]));
    expect(await screen.findByText(`Restocked ${THAR}`)).toBeInTheDocument();
    await waitFor(() => expect(within(low()).queryByRole("button", { name: `Restock ${THAR}` })).not.toBeInTheDocument()); // no longer low
    const row = within(movements()).getAllByRole("row")[1];
    expect(row).toHaveTextContent("RESTOCKED");
    expect(row).toHaveTextContent(THAR);
    expect(row).toHaveTextContent("+5");
    expect(row).toHaveTextContent("5"); // stock after
  });

  it("only accepts a positive whole number of units", async () => {
    const { api, user } = await open();
    await user.click(within(low()).getByRole("button", { name: `Restock ${THAR}` }));
    const dialog = screen.getByRole("dialog");
    for (const [typed, message] of [["0", "Add at least 1 unit"], ["-3", "Use a whole number of 1 or more"], ["2.5", "Use a whole number of 1 or more"], ["", "Use a whole number of 1 or more"]] as const) {
      await user.clear(within(dialog).getByLabelText("Units to add"));
      if (typed) await user.type(within(dialog).getByLabelText("Units to add"), typed);
      await user.click(within(dialog).getByRole("button", { name: "Add stock" }));
      expect(await within(dialog).findByText(message)).toBeInTheDocument();
    }
    expect(api.calls.restock).toEqual([]);
  });

  it("shows the server's message and keeps the dialog open when restocking fails", async () => {
    const { api, user } = await open();
    api.vehicles = api.vehicles.filter((vehicle) => vehicle.id !== 4); // deleted by someone else meanwhile
    await user.click(within(low()).getByRole("button", { name: `Restock ${THAR}` }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Units to add"), "2");
    await user.click(within(dialog).getByRole("button", { name: "Add stock" }));
    expect(await within(dialog).findByText("Vehicle not found")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Ledger: add, edit, feature and delete", () => {
  const fillNew = async (user: Awaited<ReturnType<typeof open>>["user"]) => {
    const dialog = screen.getByRole("dialog", { name: "Add vehicle" });
    await user.type(within(dialog).getByLabelText("Make"), "Tata");
    await user.type(within(dialog).getByLabelText("Model"), "Punch");
    await user.selectOptions(within(dialog).getByLabelText("Category"), "SUV");
    await user.type(within(dialog).getByLabelText(/Price/), "7,20,000");
    await user.clear(within(dialog).getByLabelText("Units in stock"));
    await user.type(within(dialog).getByLabelText("Units in stock"), "3");
    return dialog;
  };

  it("adds a vehicle: sent to the API in rupees, listed straight away, movement recorded", async () => {
    const { api, user } = await open();
    await user.click(screen.getByRole("button", { name: "Add vehicle" }));
    const dialog = await fillNew(user);
    await user.click(within(dialog).getByRole("button", { name: "Add vehicle" }));
    await waitFor(() => expect(api.vehicles[api.vehicles.length - 1]).toMatchObject({ make: "Tata", model: "Punch", category: "SUV", price: 720000, quantity: 3, year: null, image_url: null }));
    expect(await within(full()).findByText("Tata Punch")).toBeInTheDocument();
    expect(within(movements()).getAllByRole("row")[1]).toHaveTextContent("CREATED");
    expect(screen.getByText(/Stock reference 0007/)).toBeInTheDocument();
  });

  it("validates inline: required fields, a positive price, whole non-negative stock", async () => {
    const { api, user } = await open();
    await user.click(screen.getByRole("button", { name: "Add vehicle" }));
    const dialog = screen.getByRole("dialog", { name: "Add vehicle" });
    await user.click(within(dialog).getByRole("button", { name: "Add vehicle" }));
    for (const message of ["Enter the make", "Enter the model", "Enter a price"]) expect(await within(dialog).findByText(message)).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText("Make"), "Tata");
    await user.type(within(dialog).getByLabelText("Model"), "Punch");
    await user.type(within(dialog).getByLabelText(/Price/), "0");
    await user.clear(within(dialog).getByLabelText("Units in stock"));
    await user.type(within(dialog).getByLabelText("Units in stock"), "-1");
    await user.click(within(dialog).getByRole("button", { name: "Add vehicle" }));
    expect(await within(dialog).findByText("The price must be more than zero")).toBeInTheDocument();
    expect(within(dialog).getByText("Use a whole number, 0 or more")).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText("Units in stock"));
    await user.type(within(dialog).getByLabelText("Units in stock"), "2.5");
    await user.click(within(dialog).getByRole("button", { name: "Add vehicle" }));
    expect(await within(dialog).findByText("Use a whole number, 0 or more")).toBeInTheDocument();
    expect(api.vehicles).toHaveLength(6); // nothing was sent
  });

  it("edits a vehicle, with the system-generated id and stock reference read-only", async () => {
    const { api, user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    expect(within(dialog).getByText("Vehicle ID (read-only)").nextElementSibling).toHaveTextContent("1");
    expect(within(dialog).getByText("Stock reference (read-only)").nextElementSibling).toHaveTextContent("0001");
    expect(within(dialog).queryByRole("textbox", { name: /Vehicle ID/ })).not.toBeInTheDocument();
    await user.clear(within(dialog).getByLabelText(/Price/));
    await user.type(within(dialog).getByLabelText(/Price/), "8,50,000");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(api.vehicles.find((v) => v.id === 1)?.price).toBe(850000));
    expect(await screen.findByText(`Saved ${SWIFT}`)).toBeInTheDocument();
  });

  it("asks before throwing away unsaved changes", async () => {
    const { user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    await user.type(within(dialog).getByLabelText("Model"), " Dzire");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    const confirm = screen.getByRole("dialog", { name: "Discard changes?" });
    await user.click(within(confirm).getByRole("button", { name: "Keep editing" }));
    expect(screen.getByRole("dialog", { name: "Edit vehicle" })).toBeInTheDocument();
    await user.keyboard("{Escape}"); // Escape also asks first
    await user.click(within(screen.getByRole("dialog", { name: "Discard changes?" })).getByRole("button", { name: "Discard changes" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes an untouched form without asking", async () => {
    const { user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks a vehicle featured with a carousel position and shows it in the table", async () => {
    const { user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    await user.click(within(dialog).getByLabelText("Featured"));
    await user.click(within(dialog).getByLabelText("New arrival"));
    await user.type(within(dialog).getByLabelText(/Carousel order/), "1");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    const row = (await within(full()).findByRole("button", { name: `Edit ${SWIFT}` })).closest("tr")!;
    await waitFor(() => expect(row).toHaveTextContent("Featured #1 · New"));
  });

  it("rejects a bad carousel order", async () => {
    const { user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    await user.type(within(dialog).getByLabelText(/Carousel order/), "0");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    expect(await within(dialog).findByText(/whole number from 1 to 999/)).toBeInTheDocument();
  });

  it("deletes only after confirmation, and records it", async () => {
    const { api, user } = await open();
    await user.click(within(full()).getByRole("button", { name: `Delete ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: `Delete ${SWIFT}?` });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(api.vehicles.some((v) => v.id === 1)).toBe(true);
    await user.click(within(full()).getByRole("button", { name: `Delete ${SWIFT}` }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete vehicle" }));
    await waitFor(() => expect(api.vehicles.some((v) => v.id === 1)).toBe(false));
    await waitFor(() => expect(within(full()).queryByText(SWIFT)).not.toBeInTheDocument());
    expect(within(movements()).getAllByRole("row")[1]).toHaveTextContent("DELETED");
  });
});

describe("Ledger: search and filters", () => {
  it("filters the full inventory by text, category and stock status", async () => {
    const { user } = await open();
    const rows = () => within(full()).getAllByRole("row").length - 1;
    expect(rows()).toBe(6);
    await user.type(within(full()).getByLabelText("Search"), "bmw");
    expect(rows()).toBe(1);
    await user.clear(within(full()).getByLabelText("Search"));
    await user.selectOptions(within(full()).getByLabelText("Category"), "SUV");
    expect(rows()).toBe(3);
    await user.selectOptions(within(full()).getByLabelText("Stock status"), "out");
    expect(rows()).toBe(1);
    expect(within(full()).getByRole("status")).toHaveTextContent("1 of 6 vehicles");
  });
});

describe("Ledger: export", () => {
  const capture = () => {
    const blobs: Blob[] = [];
    URL.createObjectURL = vi.fn((blob: Blob) => { blobs.push(blob); return "blob:ledger"; });
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    return { blobs, click };
  };
  const read = (blob: Blob) => new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });

  it("is disabled until there is something real to export", async () => {
    await open();
    expect(screen.getByRole("button", { name: "Export ledger" })).toBeDisabled();
  });

  it("downloads a real CSV of the recorded movements, with spreadsheet formulas neutralised", async () => {
    const { user } = await open();
    const { blobs, click } = capture();
    // record a movement under a vehicle name that would run as a formula if a spreadsheet opened it as-is
    await user.click(within(full()).getByRole("button", { name: `Edit ${SWIFT}` }));
    const dialog = screen.getByRole("dialog", { name: "Edit vehicle" });
    await user.clear(within(dialog).getByLabelText("Make"));
    await user.type(within(dialog).getByLabelText("Make"), "=HYPERLINK(1)");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));
    await within(movements()).findByText("UPDATED");

    await user.click(screen.getByRole("button", { name: "Export ledger" }));
    expect(click).toHaveBeenCalledTimes(1);
    const csv = await read(blobs[0]);
    const lines = csv.replace("﻿", "").trim().split("\r\n");
    expect(lines[0]).toBe("Timestamp (ISO 8601),Stock reference,Vehicle,Event,Change (units),Stock after,Actor");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toMatch(/,0001,'=HYPERLINK\(1\) Swift ZXi,UPDATED,0,6,admin@dealership\.com$/); // the apostrophe defuses the formula
    click.mockRestore();
  });
});

describe("Ledger: stays in step with the rest of the app", () => {
  it("a restock on the Ledger shows on the Floor straight away", async () => {
    const { user } = await open();
    await user.click(within(low()).getByRole("button", { name: `Restock ${THAR}` }));
    await user.type(within(screen.getByRole("dialog")).getByLabelText("Units to add"), "4");
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add stock" }));
    await screen.findByText(`Restocked ${THAR}`);
    await user.click(screen.getAllByRole("link", { name: "The Floor" })[0]);
    const thar = await screen.findByRole("article", { name: THAR });
    expect(await within(thar).findByText("4 in stock")).toBeInTheDocument();
    expect(within(thar).getByRole("button", { name: `Purchase ${THAR}` })).toBeEnabled();
  });
});
