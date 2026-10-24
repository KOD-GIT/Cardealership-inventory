import { screen } from "@testing-library/react";
import { makeVehicle } from "../../test/fixtures";
import { renderWithProviders } from "../../test/utils";
import { VehicleCard } from "./VehicleCard";

describe("VehicleCard", () => {
  it("shows make, model, category, year, price and stock", () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} onPurchase={() => {}} />);
    expect(screen.getByText("Toyota")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Camry" })).toBeInTheDocument();
    expect(screen.getByText("Sedan")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("$27,999.99")).toBeInTheDocument();
    expect(screen.getByText("4 in stock")).toBeInTheDocument();
  });

  it("calls onPurchase with the vehicle when Purchase is clicked", async () => {
    const onPurchase = vi.fn();
    const vehicle = makeVehicle();
    const { user } = renderWithProviders(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />);
    await user.click(screen.getByRole("button", { name: "Purchase Toyota Camry" }));
    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it("disables Purchase when the quantity is zero", () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ quantity: 0 })} onPurchase={() => {}} />);
    const button = screen.getByRole("button", { name: "Toyota Camry is unavailable" });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Unavailable");
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
  });

  it("flags low stock with the exact count", () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle({ quantity: 1 })} onPurchase={() => {}} />);
    expect(screen.getByText("Only 1 left")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Purchase Toyota Camry" })).toBeEnabled();
  });

  it("blocks repeat clicks while a purchase is in flight", () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} onPurchase={() => {}} purchasing />);
    expect(screen.getByRole("button", { name: "Purchase Toyota Camry" })).toBeDisabled();
  });
});
