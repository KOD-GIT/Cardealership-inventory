import { makeVehicle } from "../test/fixtures";
import { EMPTY_EXTRAS, galleryFor, resolveExtras, vehicleSlug } from "./catalogue";

describe("vehicleSlug", () => {
  it("is stable, lower-case and accent-free", () => {
    expect(vehicleSlug("Audi", "R8 Coupé V10")).toBe("audi-r8-coupe-v10");
    expect(vehicleSlug("Mercedes-AMG", "G 63 6x6")).toBe("mercedes-amg-g-63-6x6");
  });
});

describe("resolveExtras", () => {
  it("returns empty extras for a vehicle the catalogue does not know (specs then read 'Not provided')", () => {
    expect(resolveExtras({ make: "Unknown", model: "Thing" }, undefined)).toEqual(EMPTY_EXTRAS);
  });
  it("supplies the defaults for known models", () => {
    const extras = resolveExtras({ make: "BMW", model: "330Li M Sport" }, undefined);
    expect(extras.specs.Wheelbase).toBe("2,961 mm");
    expect(extras.gallery).toHaveLength(6);
  });
  it("lets administrator overrides win", () => {
    const extras = resolveExtras({ make: "Audi", model: "R8 Coupé V10" }, { featured: false, carouselOrder: 9 });
    expect(extras).toMatchObject({ featured: false, carouselOrder: 9 });
  });
  it("never invents inspection or verification claims", () => {
    const text = JSON.stringify(resolveExtras({ make: "BMW", model: "330Li M Sport" }, undefined)).toLowerCase();
    for (const claim of ["certified", "inspected", "verified", "accident", "vin"]) expect(text).not.toContain(claim);
  });
});

describe("galleryFor", () => {
  it("puts the vehicle's own image first and removes duplicates", () => {
    const extras = { ...EMPTY_EXTRAS, gallery: ["/a.jpg", "/b.jpg", "/a.jpg"] };
    expect(galleryFor(makeVehicle({ image_url: "/b.jpg" }), extras)).toEqual(["/b.jpg", "/a.jpg"]);
  });
  it("is empty when there are no photographs at all", () => {
    expect(galleryFor(makeVehicle({ image_url: null }), EMPTY_EXTRAS)).toEqual([]);
  });
});
