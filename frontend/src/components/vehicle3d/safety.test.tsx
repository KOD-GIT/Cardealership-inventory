import { render, screen } from "@testing-library/react";
import { SceneErrorBoundary } from "./ErrorBoundary";

describe("SceneErrorBoundary", () => {
  it("swallows a crashing scene, reports it once, and renders nothing", () => {
    const onError = vi.fn();
    const Boom = () => { throw new Error("WebGL context lost"); };
    vi.spyOn(console, "error").mockImplementation(() => {}); // React logs caught render errors
    render(<SceneErrorBoundary onError={onError}><Boom /></SceneErrorBoundary>);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/webgl/i)).not.toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("renders its children when nothing goes wrong", () => {
    render(<SceneErrorBoundary onError={() => {}}><p>scene</p></SceneErrorBoundary>);
    expect(screen.getByText("scene")).toBeInTheDocument();
  });
});

describe("supportsWebGL", () => {
  afterEach(() => { vi.restoreAllMocks(); vi.resetModules(); });

  it("is true when a context can be created, and only probes once", async () => {
    vi.resetModules();
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as RenderingContext);
    const { supportsWebGL } = await import("../../lib/webgl");
    expect(supportsWebGL()).toBe(true);
    expect(supportsWebGL()).toBe(true);
    expect(getContext).toHaveBeenCalledTimes(1);
  });

  it("is false when the browser refuses a context", async () => {
    vi.resetModules();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { supportsWebGL } = await import("../../lib/webgl");
    expect(supportsWebGL()).toBe(false);
  });
});
