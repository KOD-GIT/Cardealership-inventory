import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { SearchFilterBar } from "./SearchFilterBar";

const setup = () => {
  const onSearch = vi.fn();
  const onReset = vi.fn();
  render(<SearchFilterBar onSearch={onSearch} onReset={onReset} />);
  return { onSearch, onReset, user: userEvent.setup() };
};

describe("SearchFilterBar", () => {
  it("sends only the filters that were filled in, with numbers parsed", async () => {
    const { user, onSearch } = setup();
    await user.type(screen.getByLabelText("Make"), "  Toyota ");
    await user.selectOptions(screen.getByLabelText("Category"), "SEDAN");
    await user.type(screen.getByLabelText("Min price"), "10000");
    await user.type(screen.getByLabelText("Max price"), "30000");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(onSearch).toHaveBeenCalledWith({
      make: "Toyota", model: undefined, category: "SEDAN", min_price: 10000, max_price: 30000,
    });
  });

  it("offers exactly the seven API categories", () => {
    setup();
    const options = Array.from((screen.getByLabelText("Category") as HTMLSelectElement).options).map((o) => o.text);
    expect(options).toEqual(["All categories", "Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Truck", "Van"]);
  });

  it("rejects a minimum price above the maximum without calling the API", async () => {
    const { user, onSearch } = setup();
    await user.type(screen.getByLabelText("Min price"), "50000");
    await user.type(screen.getByLabelText("Max price"), "10000");
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/minimum price can't be higher/i);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("clears every field and notifies on reset", async () => {
    const { user, onReset } = setup();
    await user.type(screen.getByLabelText("Model"), "Camry");
    await user.click(screen.getByRole("button", { name: "Reset filters" }));
    expect(screen.getByLabelText("Model")).toHaveValue("");
    expect(onReset).toHaveBeenCalled();
  });
});
