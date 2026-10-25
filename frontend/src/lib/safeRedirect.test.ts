import { safeReturnPath } from "./safeRedirect";

describe("safeReturnPath (no open redirects)", () => {
  it("keeps same-site paths, including query strings", () => {
    expect(safeReturnPath("/vehicle/7")).toBe("/vehicle/7");
    expect(safeReturnPath("/floor?cat=SUV&page=2")).toBe("/floor?cat=SUV&page=2");
  });
  it("falls back for anything that could leave the site", () => {
    for (const evil of ["//evil.example", "/\evil.example", "https://evil.example", "javascript:alert(1)", "evil", "", "/\u0000x"]) {
      expect(safeReturnPath(evil)).toBe("/");
    }
  });
  it("falls back for non-strings", () => {
    expect(safeReturnPath(undefined)).toBe("/");
    expect(safeReturnPath(42, "/floor")).toBe("/floor");
  });
});
