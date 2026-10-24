import { fireEvent, render, screen } from "@testing-library/react";
import { makeVehicle } from "../../test/fixtures";
import { ParkedVisual } from "./ParkedVisual";

describe("ParkedVisual", () => {
  it("draws the standard car when the vehicle has no image", () => {
    const { container } = render(<ParkedVisual vehicle={makeVehicle()} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uses the vehicle's own image when it has one", () => {
    const { container } = render(<ParkedVisual vehicle={makeVehicle({ image_url: "https://cdn.example.com/camry.jpg" })} />);
    expect(container.querySelector("img")).toHaveAttribute("src", "https://cdn.example.com/camry.jpg");
  });

  it("falls back to the standard car when the image fails to load", () => {
    const { container } = render(<ParkedVisual vehicle={makeVehicle({ image_url: "https://cdn.example.com/broken.jpg" })} />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
