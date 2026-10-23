import axios from "axios";

/** Single Axios instance. TODO: attach the JWT (Authorization: Bearer) via a request interceptor
 *  and redirect to /login on 401 via a response interceptor. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
});
