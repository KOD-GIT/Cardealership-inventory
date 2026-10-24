import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { sampleVehicles } from "./fixtures";

export const API = "http://localhost:8000";

/** Safe defaults; individual tests override with `server.use(...)`. Unhandled requests fail the test. */
export const server = setupServer(
  http.get(`${API}/api/vehicles`, () => HttpResponse.json(sampleVehicles)),
);
