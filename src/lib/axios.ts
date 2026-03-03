import axios from "axios";

/**
 * Client-side axios instance.
 * Calls internal Next.js API routes (same-origin).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => {
    console.log(
      `[API ✓ ${res.status}] ${(res.config.method ?? "?").toUpperCase()} ${res.config.url}`,
    );
    return res;
  },
  (error) => {
    const data = error?.response?.data;
    const status = error?.response?.status ?? "network";
    const method = (error?.config?.method ?? "?").toUpperCase();
    const url = error?.config?.url ?? "unknown";
    const detail =
      data?.detail ?? data?.message ?? data?.error ?? JSON.stringify(data);
    console.error(`[API ✗ ${status}] ${method} ${url} — ${detail}`);
    return Promise.reject(error);
  },
);

/**
 * Server-side axios instance.
 * Calls the actual backend API directly (used in Next.js API routes).
 */
export const backendApi = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

backendApi.interceptors.request.use((config) => {
  const method = (config.method ?? "?").toUpperCase();
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
  const body = config.data ? JSON.stringify(config.data) : "";
  console.log(`[Backend →] ${method} ${url}`, body ? `\n  body: ${body}` : "");
  return config;
});

backendApi.interceptors.response.use(
  (res) => {
    const method = (res.config.method ?? "?").toUpperCase();
    const url = res.config.url ?? "unknown";
    console.log(
      `[Backend ✓ ${res.status}] ${method} ${url}`,
      `\n  response: ${JSON.stringify(res.data)}`.slice(0, 500),
    );
    return res;
  },
  (error) => {
    const data = error?.response?.data;
    const status = error?.response?.status ?? "network";
    const method = (error?.config?.method ?? "?").toUpperCase();
    const url = error?.config?.url ?? "unknown";
    console.error(
      `[Backend ✗ ${status}] ${method} ${url}`,
      `\n  response: ${JSON.stringify(data, null, 2)}`,
    );
    return Promise.reject(error);
  },
);
