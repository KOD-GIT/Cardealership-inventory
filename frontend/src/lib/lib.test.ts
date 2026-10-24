import { AxiosError } from "axios";
import { apiErrorMessage } from "./errors";
import { categoryLabel, formatPrice } from "./format";
import { LOW_STOCK_THRESHOLD, stockStatus } from "./stock";

describe("formatPrice", () => {
  it("formats currency with thousands separators and 2 decimals", () => {
    expect(formatPrice(27999.99)).toBe("$27,999.99");
    expect(formatPrice(22500)).toBe("$22,500.00");
  });
});

describe("categoryLabel", () => {
  it("turns API enum values into readable labels", () => {
    expect(categoryLabel("SUV")).toBe("SUV");
    expect(categoryLabel("HATCHBACK")).toBe("Hatchback");
  });
});

describe("stockStatus", () => {
  it("is out of stock at 0", () => expect(stockStatus(0)).toEqual({ level: "out", label: "Out of stock" }));
  it("is low up to the threshold, with the exact count", () => {
    expect(stockStatus(1)).toEqual({ level: "low", label: "Only 1 left" });
    expect(stockStatus(LOW_STOCK_THRESHOLD).level).toBe("low");
  });
  it("is in stock above the threshold", () => {
    expect(stockStatus(LOW_STOCK_THRESHOLD + 1)).toEqual({ level: "in", label: `${LOW_STOCK_THRESHOLD + 1} in stock` });
  });
});

describe("apiErrorMessage", () => {
  const axiosError = (response?: object) => Object.assign(new AxiosError("fail"), { response });

  it("uses the API's detail message", () => {
    expect(apiErrorMessage(axiosError({ status: 409, data: { detail: "Email already registered" } }))).toBe("Email already registered");
  });
  it("uses the first FastAPI validation message", () => {
    expect(apiErrorMessage(axiosError({ status: 422, data: { detail: [{ msg: "Field required" }] } }))).toBe("Field required");
  });
  it("explains network failures", () => {
    expect(apiErrorMessage(axiosError(undefined))).toMatch(/can't reach the server/i);
  });
  it("falls back for unknown errors", () => {
    expect(apiErrorMessage(new Error("boom"), "Fallback")).toBe("Fallback");
  });
});
