import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { resetStoresForTests } from "../data/persistentStore";
import { server } from "./server";

// jsdom (as of v24) has no PointerEvent, so pointer events lose clientX/clientY in tests.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

// Browser features jsdom does not implement. Real browsers have them all.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollBy = vi.fn() as unknown as typeof Element.prototype.scrollBy;
Element.prototype.scrollIntoView = vi.fn();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
  resetStoresForTests(); // stores cache their state in memory, so forget it as well
});
afterAll(() => server.close());
