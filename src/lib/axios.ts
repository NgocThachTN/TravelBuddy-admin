import axios from "axios";
import { API_ROUTES } from "./constants";

type RetriableRequestConfig = {
  _retry?: boolean;
  url?: string;
};

/**
 * Client-side axios instance.
 * Calls internal Next.js API routes (same-origin).
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAdminSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = api
      .post<{ success?: boolean }>(API_ROUTES.AUTH_REFRESH)
      .then((res) => Boolean(res.data?.success))
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (res) => {
    console.log(
      `[API OK ${res.status}] ${(res.config.method ?? "?").toUpperCase()} ${res.config.url}`,
    );
    return res;
  },
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = (error?.config ?? null) as RetriableRequestConfig | null;
    const requestUrl = originalRequest?.url ?? "";
    const isRefreshRequest = requestUrl.includes(API_ROUTES.AUTH_REFRESH);

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;
      const refreshed = await refreshAdminSession();

      if (refreshed) {
        return api.request(originalRequest);
      }
    }

    const data = error?.response?.data;
    const responseStatus = status ?? "network";
    const method = (error?.config?.method ?? "?").toUpperCase();
    const url = error?.config?.url ?? "unknown";
    const detail =
      data?.detail ?? data?.message ?? data?.error ?? JSON.stringify(data);
    console.error(`[API ERROR ${responseStatus}] ${method} ${url} - ${detail}`);
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
  console.log(`[Backend ->] ${method} ${url}`, body ? `\n  body: ${body}` : "");
  return config;
});

backendApi.interceptors.response.use(
  (res) => {
    const method = (res.config.method ?? "?").toUpperCase();
    const url = res.config.url ?? "unknown";
    console.log(
      `[Backend OK ${res.status}] ${method} ${url}`,
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
      `[Backend ERROR ${status}] ${method} ${url}`,
      `\n  response: ${JSON.stringify(data, null, 2)}`,
    );
    return Promise.reject(error);
  },
);
