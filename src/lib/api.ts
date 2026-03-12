import { api } from "./axios";
import { API_ROUTES } from "./constants";
import type {
  UserListItem,
  UserDetail,
  GetUsersParams,
  CreateModeratorPayload,
  CreateModeratorResponse,
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
  TripListItem,
  TripDetail,
  GetTripsParams,
  ReviewTripModerationPayload,
  TripModerationDecisionResponse,
  ReportListItem,
  ReportDetail,
  GetReportsParams,
  ProcessReportPayload,
  ReportReasonDto,
} from "@/types";

// Re-export types so existing consumers that import from "@/lib/api" still work
export type {
  UserListItem,
  UserDetail,
  GetUsersParams,
  CreateModeratorPayload,
  CreateModeratorResponse,
  SubscriptionPackage,
  SubscriptionPackagesResponse,
  CreateSubscriptionPackagePayload,
  UpdateSubscriptionPackagePayload,
} from "@/types";
// Backward-compat alias
export type { UserListItem as User } from "@/types";

// ── User API ──────────────────────────────────────────────────────────

export async function fetchUsers(
  params: GetUsersParams = {},
): Promise<BePagedWrapper<UserListItem>> {
  const { data } = await api.get<BePagedWrapper<UserListItem>>(
    API_ROUTES.ADMIN_USERS,
    { params },
  );
  return data;
}

export async function fetchUserById(userId: string): Promise<BeWrapper<UserDetail>> {
  const { data } = await api.get<BeWrapper<UserDetail>>(
    API_ROUTES.ADMIN_USERS_DETAIL(userId),
  );
  return data;
}

export async function lockUser(
  userId: string,
  reason: string,
): Promise<void> {
  await api.patch(API_ROUTES.ADMIN_USERS_LOCK(userId), { reason });
}

export async function unlockUser(userId: string): Promise<void> {
  await api.patch(API_ROUTES.ADMIN_USERS_UNLOCK(userId), {});
}

export async function createModerator(
  payload: CreateModeratorPayload,
): Promise<BeWrapper<CreateModeratorResponse>> {
  const { data } = await api.post<BeWrapper<CreateModeratorResponse>>(
    API_ROUTES.ADMIN_USERS_MODERATORS,
    payload,
  );
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

// ── Trip API ──────────────────────────────────────────────────────────

export async function fetchTrips(
  params: GetTripsParams = {},
): Promise<BePagedWrapper<TripListItem>> {
  const { data } = await api.get<BePagedWrapper<TripListItem>>(
    API_ROUTES.ADMIN_TRIPS,
    { params },
  );
  return data;
}

export async function fetchTripById(
  tripId: string,
): Promise<BeWrapper<TripDetail>> {
  const { data } = await api.get<BeWrapper<TripDetail>>(
    API_ROUTES.ADMIN_TRIPS_DETAIL(tripId),
  );
  return data;
}

export async function reviewTrip(
  taskId: string,
  payload: ReviewTripModerationPayload,
): Promise<BeWrapper<TripModerationDecisionResponse>> {
  const { data } = await api.post<BeWrapper<TripModerationDecisionResponse>>(
    API_ROUTES.ADMIN_TRIP_MODERATION_DECISION(taskId),
    payload,
  );
  return data;
}

export async function deleteTrip(tripId: string): Promise<void> {
  await api.delete(API_ROUTES.ADMIN_TRIPS_DETAIL(tripId));
}

// ── Report API (Admin scope: User, ServicePartner) ────────────────────

export async function fetchReports(
  params: GetReportsParams = {},
): Promise<BePagedWrapper<ReportListItem>> {
  const { data } = await api.get<BePagedWrapper<ReportListItem>>(
    API_ROUTES.ADMIN_REPORTS,
    { params },
  );
  return data;
}

export async function fetchReportById(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.get<BeWrapper<ReportDetail>>(
    API_ROUTES.ADMIN_REPORTS_DETAIL(reportId),
  );
  return data;
}

export async function processAdminReport(
  reportId: string,
  payload: ProcessReportPayload,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.patch<BeWrapper<ReportDetail>>(
    API_ROUTES.ADMIN_REPORTS_PROCESS(reportId),
    payload,
  );
  return data;
}

export async function fetchReportReasons(): Promise<BeWrapper<ReportReasonDto[]>> {
  const { data } = await api.get<BeWrapper<ReportReasonDto[]>>(
    API_ROUTES.ADMIN_REPORT_REASONS,
  );
  return data;
}

// ── Moderation Report API (Moderator scope: Trip, Post, etc.) ─────────

export async function fetchModerationReports(
  params: GetReportsParams = {},
): Promise<BePagedWrapper<ReportListItem>> {
  const { data } = await api.get<BePagedWrapper<ReportListItem>>(
    API_ROUTES.MODERATION_REPORTS,
    { params },
  );
  return data;
}

export async function fetchModerationReportById(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.get<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_DETAIL(reportId),
  );
  return data;
}

export async function processModerationReport(
  reportId: string,
  payload: ProcessReportPayload,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.patch<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_PROCESS(reportId),
    payload,
  );
  return data;
}

export async function claimReport(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.post<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_CLAIM(reportId),
  );
  return data;
}
