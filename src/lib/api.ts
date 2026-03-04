import { api } from "./axios";
import { API_ROUTES } from "./constants";
import type {
  User,
  SubscriptionPackage,
  CreateSubscriptionPackagePayload,
  UpdateSubscriptionPackagePayload,
  BePagedWrapper,
  BeWrapper,
  TripTypeCategoryDto,
  VehicleCategoryDto,
  ExpenseCategoryDto,
  CreateTripTypeCategoryBatchPayload,
  UpdateTripTypeCategoryPayload,
  CreateVehicleCategoryBatchPayload,
  UpdateVehicleCategoryPayload,
  CreateExpenseCategoryBatchPayload,
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
  action: "lock" | "unlock",
): Promise<User> {
  const { data } = await api.patch<User>(API_ROUTES.ADMIN_USERS, {
    userId,
    action,
  });
  return data;
}

// ── Auth API ──────────────────────────────────────────────────────────

export async function loginAdmin(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  const { data } = await api.post<{ success: boolean; error?: string }>(
    API_ROUTES.AUTH_LOGIN,
    { email, password },
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
  includeDisabled = true,
): Promise<BePagedWrapper<SubscriptionPackage>> {
  const { data } = await api.get<BePagedWrapper<SubscriptionPackage>>(
    API_ROUTES.ADMIN_SUBSCRIPTIONS,
    { params: { pageNumber, pageSize, includeDisabled } },
  );
  return data;
}

export async function createSubscriptionPackage(
  payload: CreateSubscriptionPackagePayload,
): Promise<BeWrapper<SubscriptionPackage>> {
  const { data } = await api.post<BeWrapper<SubscriptionPackage>>(
    API_ROUTES.ADMIN_SUBSCRIPTIONS,
    payload,
  );
  return data;
}

export async function updateSubscriptionPackage(
  id: string,
  payload: UpdateSubscriptionPackagePayload,
): Promise<BeWrapper<SubscriptionPackage>> {
  const { data } = await api.put<BeWrapper<SubscriptionPackage>>(
    `${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`,
    payload,
  );
  return data;
}

export async function deleteSubscriptionPackage(id: string): Promise<void> {
  await api.delete(`${API_ROUTES.ADMIN_SUBSCRIPTIONS}/${id}`);
}

// ── Trip Metadata API ─────────────────────────────────────────────────

export async function fetchTripTypeCategories(): Promise<
  BeWrapper<TripTypeCategoryDto[]>
> {
  const { data } = await api.get<BeWrapper<TripTypeCategoryDto[]>>(
    API_ROUTES.ADMIN_TRIP_TYPE_CATEGORIES,
  );
  return data;
}

export async function createTripTypeCategories(
  payload: CreateTripTypeCategoryBatchPayload,
): Promise<BeWrapper<TripTypeCategoryDto[]>> {
  const { data } = await api.post<BeWrapper<TripTypeCategoryDto[]>>(
    API_ROUTES.ADMIN_TRIP_TYPE_CATEGORIES,
    payload,
  );
  return data;
}

export async function updateTripTypeCategory(
  id: number,
  payload: UpdateTripTypeCategoryPayload,
): Promise<BeWrapper<TripTypeCategoryDto>> {
  const { data } = await api.put<BeWrapper<TripTypeCategoryDto>>(
    `${API_ROUTES.ADMIN_TRIP_TYPE_CATEGORIES}/${id}`,
    payload,
  );
  return data;
}

export async function fetchVehicleCategories(): Promise<
  BeWrapper<VehicleCategoryDto[]>
> {
  const { data } = await api.get<BeWrapper<VehicleCategoryDto[]>>(
    API_ROUTES.ADMIN_VEHICLE_CATEGORIES,
  );
  return data;
}

export async function createVehicleCategories(
  payload: CreateVehicleCategoryBatchPayload,
): Promise<BeWrapper<VehicleCategoryDto[]>> {
  const { data } = await api.post<BeWrapper<VehicleCategoryDto[]>>(
    API_ROUTES.ADMIN_VEHICLE_CATEGORIES,
    payload,
  );
  return data;
}

export async function updateVehicleCategory(
  id: number,
  payload: UpdateVehicleCategoryPayload,
): Promise<BeWrapper<VehicleCategoryDto>> {
  const { data } = await api.put<BeWrapper<VehicleCategoryDto>>(
    `${API_ROUTES.ADMIN_VEHICLE_CATEGORIES}/${id}`,
    payload,
  );
  return data;
}

export async function fetchExpenseCategories(): Promise<
  BeWrapper<ExpenseCategoryDto[]>
> {
  const { data } = await api.get<BeWrapper<ExpenseCategoryDto[]>>(
    API_ROUTES.ADMIN_EXPENSE_CATEGORIES,
  );
  return data;
}

export async function createExpenseCategories(
  payload: CreateExpenseCategoryBatchPayload,
): Promise<BeWrapper<ExpenseCategoryDto[]>> {
  const { data } = await api.post<BeWrapper<ExpenseCategoryDto[]>>(
    API_ROUTES.ADMIN_EXPENSE_CATEGORIES,
    payload,
  );
  return data;
}
