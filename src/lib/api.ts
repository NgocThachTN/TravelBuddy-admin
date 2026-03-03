import { api } from "./axios";
import { API_ROUTES } from "./constants";
import type {
  User,
  SubscriptionPackage,
  CreateSubscriptionPackagePayload,
  UpdateSubscriptionPackagePayload,
  BePagedWrapper,
  BeWrapper,
} from "@/types";

// Re-export types so existing consumers that import from "@/lib/api" still work
export type {
  User,
  SubscriptionPackage,
  SubscriptionPackagesResponse,
  CreateSubscriptionPackagePayload,
  UpdateSubscriptionPackagePayload,
} from "@/types";

// ── User API ──────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>(API_ROUTES.ADMIN_USERS);
  return data;
}

export async function updateUserStatus(
  userId: string,
  action: "lock" | "unlock"
): Promise<User> {
  const { data } = await api.patch<User>(API_ROUTES.ADMIN_USERS, {
    userId,
    action,
  });
  return data;
}

// ── Auth API ──────────────────────────────────────────────────────────

export async function loginAdmin(
  phoneNumber: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const { data } = await api.post<{ success: boolean; error?: string }>(
    API_ROUTES.AUTH_LOGIN,
    { phoneNumber, password }
  );
  return data;
}

export async function logoutAdmin(): Promise<void> {
  await api.post(API_ROUTES.AUTH_LOGOUT);
}

// ── Subscription API ─────────────────────────────────────────────────

export async function fetchSubscriptionPackages(
  pageNumber = 1,
  pageSize = 10,
  includeDisabled = true
): Promise<BePagedWrapper<SubscriptionPackage>> {
  const { data } = await api.get<BePagedWrapper<SubscriptionPackage>>(
    API_ROUTES.ADMIN_SUBSCRIPTIONS,
    { params: { pageNumber, pageSize, includeDisabled } }
  );
  return data;
}

export async function createSubscriptionPackage(
  payload: CreateSubscriptionPackagePayload
): Promise<BeWrapper<SubscriptionPackage>> {
  const { data } = await api.post<BeWrapper<SubscriptionPackage>>(
    API_ROUTES.ADMIN_SUBSCRIPTIONS,
    payload
  );
  return data;
}

export async function updateSubscriptionPackage(
  id: string,
  payload: UpdateSubscriptionPackagePayload
): Promise<BeWrapper<SubscriptionPackage>> {
  const { data } = await api.put<BeWrapper<SubscriptionPackage>>(
    `${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`,
    payload
  );
  return data;
}

export async function deleteSubscriptionPackage(id: string): Promise<void> {
  await api.delete(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`);
}
