import { API_ROUTES } from "./constants";

/**
 * Fetch wrapper for internal API calls (client-side).
 * Automatically includes credentials for cookie-based auth.
 * Designed to be swapped for a real backend base URL later.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// ── Subscription types ────────────────────────────────────────────────

export interface SubscriptionPackage {
  subscriptionPackageId: string;
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  isEnabled: boolean;
  tripCreateLimit: number;
  tripParticipantLimit: number;
  aiUsageLimit: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SubscriptionPackagesResponse {
  data: SubscriptionPackage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateSubscriptionPackagePayload {
  name: string;
  price: number;
  durationDays: number;
  description?: string;
  isEnabled: boolean;
  tripCreateLimit: number;
  tripParticipantLimit: number;
  aiUsageLimit: number;
}

export type UpdateSubscriptionPackagePayload = Partial<CreateSubscriptionPackagePayload>;

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

// ── Subscription API ─────────────────────────────────────────────────

interface BePagedWrapper<T> {
  success: boolean;
  data: {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

interface BeWrapper<T> {
  success: boolean;
  data: T;
}

export async function fetchSubscriptionPackages(
  pageNumber = 1,
  pageSize = 10,
  includeDisabled = true
): Promise<BePagedWrapper<SubscriptionPackage>> {
  return request<BePagedWrapper<SubscriptionPackage>>(
    `${API_ROUTES.ADMIN_SUBSCRIPTIONS}?pageNumber=${pageNumber}&pageSize=${pageSize}&includeDisabled=${includeDisabled}`
  );
}

export async function createSubscriptionPackage(
  payload: CreateSubscriptionPackagePayload
): Promise<BeWrapper<SubscriptionPackage>> {
  return request<BeWrapper<SubscriptionPackage>>(API_ROUTES.ADMIN_SUBSCRIPTIONS, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSubscriptionPackage(
  id: string,
  payload: UpdateSubscriptionPackagePayload
): Promise<BeWrapper<SubscriptionPackage>> {
  return request<BeWrapper<SubscriptionPackage>>(
    `${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteSubscriptionPackage(id: string): Promise<void> {
  await request(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`, { method: "DELETE" });
}
