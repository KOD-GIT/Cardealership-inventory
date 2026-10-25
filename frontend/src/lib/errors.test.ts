import { AxiosError } from "axios";
import { apiErrorMessage } from "./errors";

describe("apiErrorMessage", () => {
  const axiosError = (response?: object) => Object.assign(new AxiosError("fail"), { response });

  it("uses the API's detail message", () => {
    expect(apiErrorMessage(axiosError({ status: 409, data: { detail: "Email already registered" } }))).toBe("Email already registered");
  });
  it("uses the first FastAPI validation message", () => {
    expect(apiErrorMessage(axiosError({ status: 422, data: { detail: [{ msg: "Field required" }] } }))).toBe("Field required");
  });
  it("explains network failures", () => expect(apiErrorMessage(axiosError(undefined))).toMatch(/can't reach the server/i));
  it("falls back for unknown errors", () => expect(apiErrorMessage(new Error("boom"), "Fallback")).toBe("Fallback"));
});
