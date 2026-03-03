import axios from "axios";

/**
 * Client-side axios instance.
 * Calls internal Next.js API routes (same-origin).
 * Usage: api.get("/api/admin/users"), api.post("/api/auth/admin/login", body)
 */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Server-side axios instance.
 * Calls the actual backend API directly (used in Next.js API routes).
 * Usage: backendApi.get("/api/v1/admin/subscription-packages")
 */
export const backendApi = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});
