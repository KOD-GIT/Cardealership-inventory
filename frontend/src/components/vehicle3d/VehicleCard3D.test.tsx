import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { supportsWebGL } from "../../lib/webgl";
import { VehicleCard3D } from "./VehicleCard3D";

// jsdom has no WebGL, so the heavy Three.js scene is replaced by a stub that exposes its props.
vi.mock("./CarCanvas", () => ({
  default: (props: { engaged: boolean; yaw: number; onReady?: () => void }) => {
    // like R3F's onCreated: fires after mount, never during render
    useEffect(() => { props.onReady?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return <div data-testid="car-canvas" data-engaged={String(props.engaged)} data-yaw={String(props.yaw)} />;
  },
}));
vi.mock("../../lib/webgl", () => ({ supportsWebGL: vi.fn(() => true) }));

const parked = <div data-testid="parked">parked car</div>;
const renderCard = (props: Partial<Parameters<typeof VehicleCard3D>[0]> = {}) =>
  render(<VehicleCard3D label="Toyota Camry" parked={parked} {...props} />);
const toggle = () => screen.getByRole("button", { name: "Toyota Camry: 3D view" });
const wrapper = () => toggle().parentElement as HTMLElement;

describe("VehicleCard3D", () => {
  beforeEach(() => vi.mocked(supportsWebGL).mockReturnValue(true));

  it("shows only the parked image at first (no WebGL canvas is created)", () => {
    renderCard();
    expect(screen.getByTestId("parked")).toBeInTheDocument();
    expect(screen.queryByTestId("car-canvas")).not.toBeInTheDocument();
  });

  it("lazy-mounts the scene on hover and removes it after the exit animation", async () => {
    renderCard();
    fireEvent.pointerEnter(wrapper());
    expect(await screen.findByTestId("car-canvas")).toHaveAttribute("data-engaged", "true");

    fireEvent.pointerLeave(wrapper());
    await waitFor(() => expect(screen.getByTestId("car-canvas")).toHaveAttribute("data-engaged", "false"));
    await waitFor(() => expect(screen.queryByTestId("car-canvas")).not.toBeInTheDocument(), { timeout: 2000 });
  });

  it("ignores touch 'hover' (a tap is handled by click instead)", () => {
    renderCard();
    fireEvent.pointerEnter(wrapper(), { pointerType: "touch" });
    expect(screen.queryByTestId("car-canvas")).not.toBeInTheDocument();
  });

  it("a tap pins the car open on touch devices", async () => {
    renderCard();
    fireEvent.pointerDown(wrapper(), { clientX: 10, clientY: 10 });
    fireEvent.click(wrapper(), { clientX: 10, clientY: 10 });
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByTestId("car-canvas")).toHaveAttribute("data-engaged", "true");
  });

  it("dragging to rotate is not mistaken for a tap", () => {
    renderCard();
    fireEvent.pointerDown(wrapper(), { clientX: 0, clientY: 0 });
    fireEvent.click(wrapper(), { clientX: 80, clientY: 40 });
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("can be opened with the keyboard (focus engages it, Enter pins it)", async () => {
    renderCard();
    await userEvent.setup().tab(); // Tab onto the toggle button, as a keyboard user would
    expect(toggle()).toHaveFocus();
    expect(await screen.findByTestId("car-canvas")).toBeInTheDocument();
    fireEvent.click(toggle()); // what Enter/Space dispatch on a button
    expect(toggle()).toHaveAttribute("aria-pressed", "true");
  });

  it("offers rotate buttons while open, and rotating does not toggle the card", async () => {
    renderCard();
    fireEvent.pointerEnter(wrapper());
    const right = await screen.findByRole("button", { name: "Rotate Toyota Camry right" });
    fireEvent.click(right);
    expect(screen.getByTestId("car-canvas").getAttribute("data-yaw")).toBe(String(Math.PI / 4));
    fireEvent.click(screen.getByRole("button", { name: "Rotate Toyota Camry left" }));
    fireEvent.click(screen.getByRole("button", { name: "Rotate Toyota Camry left" }));
    expect(screen.getByTestId("car-canvas").getAttribute("data-yaw")).toBe(String(-Math.PI / 4));
    expect(toggle()).toHaveAttribute("aria-pressed", "false");
  });

  it("does nothing when disabled (out of stock)", () => {
    renderCard({ disabled: true });
    expect(screen.queryByRole("button", { name: /3D view/ })).not.toBeInTheDocument();
    fireEvent.pointerEnter(screen.getByTestId("parked").parentElement!.parentElement!);
    expect(screen.queryByTestId("car-canvas")).not.toBeInTheDocument();
  });

  it("keeps the parked image when WebGL is unavailable", () => {
    vi.mocked(supportsWebGL).mockReturnValue(false);
    renderCard();
    fireEvent.pointerEnter(wrapper());
    expect(screen.queryByTestId("car-canvas")).not.toBeInTheDocument();
    expect(screen.getByTestId("parked")).toBeInTheDocument();
  });
});
