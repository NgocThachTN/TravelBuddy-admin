import { API_ROUTES } from "./constants";

/**
 * Fetch wrapper for internal API calls (client-side).
 * Automatically includes credentials for cookie-based auth.
 * Designed to be swapped for a real backend base URL later.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "locked";
  createdAt: string;
}

export async function fetchUsers(): Promise<User[]> {
  return request<User[]>(API_ROUTES.ADMIN_USERS);
}

export async function updateUserStatus(
  userId: string,
  action: "lock" | "unlock"
): Promise<User> {
  return request<User>(API_ROUTES.ADMIN_USERS, {
    method: "PATCH",
    body: JSON.stringify({ userId, action }),
  });
}

export async function loginAdmin(
  phoneNumber: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  return request(API_ROUTES.AUTH_LOGIN, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, password }),
  });
}

export async function logoutAdmin(): Promise<void> {
  await request(API_ROUTES.AUTH_LOGOUT, { method: "POST" });
}
