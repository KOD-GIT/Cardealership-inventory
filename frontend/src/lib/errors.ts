import axios from "axios";

/** Best human-readable message from an API error ({"detail": "..."} or FastAPI validation list). */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
    if (!error.response) return "Can't reach the server. Check your connection and try again.";
  }
  return fallback;
}

export function apiErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
