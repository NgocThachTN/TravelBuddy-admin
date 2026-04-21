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
  UpdateAdminTripPayload,
  GetTripModerationTasksParams,
  TripModerationTaskListItem,
  TripModerationTaskDetail,
  ReviewTripModerationPayload,
  TripModerationDecisionResponse,
  ReportListItem,
  ReportDetail,
  GetReportsParams,
  GetMyReportsParams,
  CreateReportPayload,
  ProcessReportPayload,
  ReportReasonDto,
  PartnerRequestListItem,
  PartnerRequestDetail,
  GetPartnerRequestsParams,
  ReviewPartnerRequestPayload,
  ServicePartnerListItem,
  ServicePartnerDetail,
  GetServicePartnersParams,
  ServicePartnerFee,
  CreateServicePartnerFeePayload,
  UpdateServicePartnerFeePayload,
  GetServicePartnerFeesParams,
  GetAdminTransactionsParams,
  AdminTransactionRecord,
  AdminWalletWithdrawalRecord,
  GetAdminWalletWithdrawalsParams,
  MarkWalletWithdrawalProcessingPayload,
  ApproveWalletWithdrawalPayload,
  RejectWalletWithdrawalPayload,
  MyProfileData,
  DashboardOverviewData,
  RescueCommissionRevenueData,
  RescueCommissionPartnerSummaryItem,
  GetRescueCommissionPartnerSummaryParams,
  ModeratorDashboardOverviewData,
  GetRescueRequestsParams,
  RescueRequestListItem,
  RescueRequestDetail,
  UpdateModeratorRescueRequestStatusPayload,
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
  GetAdminTransactionsParams,
  AdminTransactionRecord,
  AdminWalletWithdrawalRecord,
  GetAdminWalletWithdrawalsParams,
  MarkWalletWithdrawalProcessingPayload,
  ApproveWalletWithdrawalPayload,
  RejectWalletWithdrawalPayload,
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

export async function getMyProfile(): Promise<BeWrapper<MyProfileData>> {
  const { data } = await api.get<BeWrapper<MyProfileData>>(
    API_ROUTES.AUTH_PROFILE,
  );
  return data;
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  relativePhone?: string;
  gender?: string;
  dateOfBirth?: string;
}): Promise<BeWrapper<MyProfileData>> {
  const { data } = await api.put<BeWrapper<MyProfileData>>(
    API_ROUTES.AUTH_PROFILE,
    payload,
  );
  return data;
}

export async function changePassword(payload: {
  oldPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.post(API_ROUTES.AUTH_CHANGE_PASSWORD, payload);
}

export async function fetchAdminDashboardOverview(
  windowDays = 30,
): Promise<BeWrapper<DashboardOverviewData>> {
  const { data } = await api.get<BeWrapper<DashboardOverviewData>>(
    API_ROUTES.ADMIN_DASHBOARD_OVERVIEW,
    { params: { windowDays } },
  );
  return data;
}

export async function fetchAdminRescueCommissionRevenue(params: {
  fromUtc: string;
  toUtc: string;
}): Promise<BeWrapper<RescueCommissionRevenueData>> {
  const { data } = await api.get<BeWrapper<RescueCommissionRevenueData>>(
    API_ROUTES.ADMIN_DASHBOARD_RESCUE_COMMISSION_REVENUE,
    { params },
  );
  return data;
}

export async function fetchAdminRescueCommissionRevenuePartners(
  params: GetRescueCommissionPartnerSummaryParams = {},
): Promise<BePagedWrapper<RescueCommissionPartnerSummaryItem>> {
  const { data } = await api.get<BePagedWrapper<RescueCommissionPartnerSummaryItem>>(
    API_ROUTES.ADMIN_DASHBOARD_RESCUE_COMMISSION_REVENUE_PARTNERS,
    { params },
  );
  return data;
}

export async function fetchModeratorDashboardOverview(): Promise<
  BeWrapper<ModeratorDashboardOverviewData>
> {
  const { data } = await api.get<BeWrapper<ModeratorDashboardOverviewData>>(
    API_ROUTES.MODERATION_DASHBOARD_OVERVIEW,
  );
  return data;
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

export async function fetchAdminDepositTransactions(
  params: GetAdminTransactionsParams = {},
): Promise<BePagedWrapper<AdminTransactionRecord>> {
  const { data } = await api.get<BePagedWrapper<AdminTransactionRecord>>(
    API_ROUTES.ADMIN_TRANSACTIONS_DEPOSITS,
    { params },
  );
  return data;
}

export async function fetchAdminUserSubscriptionTransactions(
  params: GetAdminTransactionsParams = {},
): Promise<BePagedWrapper<AdminTransactionRecord>> {
  const { data } = await api.get<BePagedWrapper<AdminTransactionRecord>>(
    API_ROUTES.ADMIN_TRANSACTIONS_USER_SUBSCRIPTIONS,
    { params },
  );
  return data;
}

export async function fetchAdminWalletWithdrawalWorkQueue(
  params: GetAdminWalletWithdrawalsParams = {},
): Promise<BePagedWrapper<AdminWalletWithdrawalRecord>> {
  const { data } = await api.get<BePagedWrapper<AdminWalletWithdrawalRecord>>(
    API_ROUTES.ADMIN_WALLET_WITHDRAWALS_WORK_QUEUE,
    { params },
  );
  return data;
}

export async function markAdminWalletWithdrawalProcessing(
  withdrawalId: string,
  payload: MarkWalletWithdrawalProcessingPayload = {},
): Promise<BeWrapper<AdminWalletWithdrawalRecord>> {
  const { data } = await api.post<BeWrapper<AdminWalletWithdrawalRecord>>(
    API_ROUTES.ADMIN_WALLET_WITHDRAWALS_PROCESSING(withdrawalId),
    payload,
  );
  return data;
}

export async function approveAdminWalletWithdrawal(
  withdrawalId: string,
  payload: ApproveWalletWithdrawalPayload,
): Promise<BeWrapper<AdminWalletWithdrawalRecord>> {
  const { data } = await api.post<BeWrapper<AdminWalletWithdrawalRecord>>(
    API_ROUTES.ADMIN_WALLET_WITHDRAWALS_APPROVE(withdrawalId),
    payload,
  );
  return data;
}

export async function rejectAdminWalletWithdrawal(
  withdrawalId: string,
  payload: RejectWalletWithdrawalPayload,
): Promise<BeWrapper<AdminWalletWithdrawalRecord>> {
  const { data } = await api.post<BeWrapper<AdminWalletWithdrawalRecord>>(
    API_ROUTES.ADMIN_WALLET_WITHDRAWALS_REJECT(withdrawalId),
    payload,
  );
  return data;
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

export async function updateTripByAdmin(
  tripId: string,
  payload: UpdateAdminTripPayload,
): Promise<BeWrapper<TripDetail>> {
  const { data } = await api.patch<BeWrapper<TripDetail>>(
    API_ROUTES.ADMIN_TRIPS_DETAIL(tripId),
    payload,
  );
  return data;
}

export async function overrideTripByAdmin(
  tripId: string,
  payload: UpdateAdminTripPayload,
): Promise<BeWrapper<TripDetail>> {
  const { data } = await api.patch<BeWrapper<TripDetail>>(
    API_ROUTES.ADMIN_TRIPS_OVERRIDE(tripId),
    payload,
  );
  return data;
}

export async function fetchTripModerationTasks(
  params: GetTripModerationTasksParams = {},
): Promise<BePagedWrapper<TripModerationTaskListItem>> {
  const { data } = await api.get<BePagedWrapper<TripModerationTaskListItem>>(
    API_ROUTES.ADMIN_TRIP_MODERATION_TASKS,
    { params },
  );
  return data;
}

export async function fetchTripModerationTaskDetail(
  taskId: string,
): Promise<BeWrapper<TripModerationTaskDetail>> {
  const { data } = await api.get<BeWrapper<TripModerationTaskDetail>>(
    API_ROUTES.ADMIN_TRIP_MODERATION_TASK_DETAIL(taskId),
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

export async function fetchRescueRequests(
  params: GetRescueRequestsParams = {},
): Promise<BePagedWrapper<RescueRequestListItem>> {
  const normalizedParams = {
    ...params,
    search: params.search?.trim() || undefined,
    status: params.status === "all" ? undefined : params.status,
  };
  const { data } = await api.get<BePagedWrapper<RescueRequestListItem>>(
    API_ROUTES.RESCUE_REQUESTS,
    { params: normalizedParams },
  );
  return data;
}

export async function fetchRescueRequestById(
  id: string,
): Promise<BeWrapper<RescueRequestDetail>> {
  const { data } = await api.get<BeWrapper<RescueRequestDetail>>(
    API_ROUTES.RESCUE_REQUESTS_DETAIL(id),
  );
  return data;
}

export async function updateRescueRequestStatusByModerator(
  id: string,
  payload: UpdateModeratorRescueRequestStatusPayload,
): Promise<BeWrapper<RescueRequestDetail>> {
  const { data } = await api.patch<BeWrapper<RescueRequestDetail>>(
    API_ROUTES.RESCUE_REQUESTS_MODERATOR_STATUS(id),
    payload,
  );
  return data;
}

function normalizeReportListItem(report: ReportListItem): ReportListItem {
  const fullName = [report.reporterFirstName, report.reporterLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const reporterName =
    report.reporterName?.trim() || fullName || report.reporterEmail?.trim() || null;
  const reason = report.reason;
  const reasonId = reason?.reasonId ?? report.reasonId ?? null;
  const reasonKey = reason?.reasonKey ?? report.reasonKey ?? null;
  const reasonDisplayName = reason?.displayName ?? report.reasonDisplayName ?? null;

  return {
    ...report,
    reporterFirstName: report.reporterFirstName ?? null,
    reporterLastName: report.reporterLastName ?? null,
    reporterAvatarUrl: report.reporterAvatarUrl ?? null,
    reporterName,
    reporterEmail: report.reporterEmail ?? null,
    reportedPartyType: report.reportedPartyType ?? null,
    reason:
      reason ??
      (reasonId !== null && reasonKey && reasonDisplayName
        ? {
            reasonId,
            reasonKey,
            displayName: reasonDisplayName,
          }
        : null),
    reasonId,
    reasonKey,
    reasonDisplayName,
    assignedToUserId: report.assignedToUserId ?? null,
    assignedToName: report.assignedToName ?? null,
    priority: report.priority ?? null,
    resolvedAt: report.resolvedAt ?? null,
  };
}

function normalizeReportDetail(report: ReportDetail): ReportDetail {
  const normalizedListItem = normalizeReportListItem(report);

  return {
    ...normalizedListItem,
    evidenceNote: report.evidenceNote ?? null,
    targetSnapshot: report.targetSnapshot ?? null,
    resolvedAction: report.resolvedAction ?? null,
    resolvedActions:
      report.resolvedActions ??
      (report.resolvedAction !== null && report.resolvedAction !== undefined
        ? [report.resolvedAction]
        : null),
    resolvedNote: report.resolvedNote ?? null,
    updatedAt: report.updatedAt ?? null,
    strikeExpiresAt: report.strikeExpiresAt ?? null,
    targetDetail: report.targetDetail ?? null,
  };
}

// ── Report API (Admin scope: User, ServicePartner) ────────────────────

export async function fetchReports(
  params: GetReportsParams = {},
): Promise<BePagedWrapper<ReportListItem>> {
  const { data } = await api.get<BePagedWrapper<ReportListItem>>(
    API_ROUTES.ADMIN_REPORTS,
    { params },
  );
  return {
    ...data,
    data: {
      ...data.data,
      items: data.data.items.map(normalizeReportListItem),
    },
  };
}

export async function fetchReportById(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.get<BeWrapper<ReportDetail>>(
    API_ROUTES.ADMIN_REPORTS_DETAIL(reportId),
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

export async function processAdminReport(
  reportId: string,
  payload: ProcessReportPayload,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.patch<BeWrapper<ReportDetail>>(
    API_ROUTES.ADMIN_REPORTS_PROCESS(reportId),
    payload,
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

export async function fetchReportReasons(): Promise<BeWrapper<ReportReasonDto[]>> {
  const { data } = await api.get<BeWrapper<ReportReasonDto[]>>(
    API_ROUTES.ADMIN_REPORT_REASONS,
  );
  return data;
}

export async function fetchUserReportReasons(
  targetType?: string,
): Promise<BeWrapper<ReportReasonDto[]>> {
  const { data } = await api.get<BeWrapper<ReportReasonDto[]>>(
    API_ROUTES.REPORTS_REASONS,
    {
      params: targetType ? { targetType } : undefined,
    },
  );
  return data;
}

export async function createReport(
  payload: CreateReportPayload,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.post<BeWrapper<ReportDetail>>(
    API_ROUTES.REPORTS,
    payload,
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

export async function fetchMyReports(
  params: GetMyReportsParams = {},
): Promise<BePagedWrapper<ReportListItem>> {
  const { data } = await api.get<BePagedWrapper<ReportListItem>>(
    API_ROUTES.MY_REPORTS,
    { params },
  );
  return {
    ...data,
    data: {
      ...data.data,
      items: data.data.items.map(normalizeReportListItem),
    },
  };
}

export async function fetchMyReportById(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.get<BeWrapper<ReportDetail>>(
    API_ROUTES.MY_REPORTS_DETAIL(reportId),
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

// ── Moderation Report API (Moderator scope: Trip, Post, etc.) ─────────

export async function fetchModerationReports(
  params: GetReportsParams = {},
): Promise<BePagedWrapper<ReportListItem>> {
  const { data } = await api.get<BePagedWrapper<ReportListItem>>(
    API_ROUTES.MODERATION_REPORTS,
    { params },
  );
  return {
    ...data,
    data: {
      ...data.data,
      items: data.data.items.map(normalizeReportListItem),
    },
  };
}

export async function fetchModerationReportById(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.get<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_DETAIL(reportId),
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

export async function processModerationReport(
  reportId: string,
  payload: ProcessReportPayload,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.patch<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_PROCESS(reportId),
    payload,
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

export async function claimReport(
  reportId: string,
): Promise<BeWrapper<ReportDetail>> {
  const { data } = await api.post<BeWrapper<ReportDetail>>(
    API_ROUTES.MODERATION_REPORTS_CLAIM(reportId),
  );
  return {
    ...data,
    data: normalizeReportDetail(data.data),
  };
}

// ── Partner Review API ────────────────────────────────────────────────

export async function fetchPartnerRequests(
  params: GetPartnerRequestsParams = {},
): Promise<BePagedWrapper<PartnerRequestListItem>> {
  const { data } = await api.get<BePagedWrapper<PartnerRequestListItem>>(
    API_ROUTES.ADMIN_PARTNER_REVIEWS,
    { params },
  );
  return data;
}

export async function fetchPartnerRequestById(
  id: string,
): Promise<BeWrapper<PartnerRequestDetail>> {
  const { data } = await api.get<BeWrapper<PartnerRequestDetail>>(
    API_ROUTES.ADMIN_PARTNER_REVIEWS_DETAIL(id),
  );
  return data;
}

export async function reviewPartnerRequest(
  id: string,
  payload: ReviewPartnerRequestPayload,
): Promise<BeWrapper<PartnerRequestDetail>> {
  const { data } = await api.post<BeWrapper<PartnerRequestDetail>>(
    API_ROUTES.ADMIN_PARTNER_REVIEWS_DECISION(id),
    payload,
  );
  return data;
}

// ── Service Partner API ───────────────────────────────────────────────

export async function fetchCacheInvalidationConnectionInfo(): Promise<{
  accessToken: string;
  hubUrl: string;
}> {
  const { data } = await api.get<{ accessToken: string; hubUrl: string }>(
    API_ROUTES.REALTIME_CACHE_INVALIDATION,
  );
  return data;
}

export async function fetchServicePartners(
  params: GetServicePartnersParams = {},
): Promise<BePagedWrapper<ServicePartnerListItem>> {
  const { data } = await api.get<BePagedWrapper<ServicePartnerListItem>>(
    API_ROUTES.ADMIN_SERVICE_PARTNERS,
    { params },
  );
  return data;
}

export async function fetchServicePartnerById(
  id: string,
): Promise<BeWrapper<ServicePartnerDetail>> {
  const { data } = await api.get<BeWrapper<ServicePartnerDetail>>(
    API_ROUTES.ADMIN_SERVICE_PARTNERS_DETAIL(id),
  );
  return data;
}

// ── Service Partner Fee API ───────────────────────────────────────────

export async function fetchServicePartnerFees(
  params: GetServicePartnerFeesParams = {},
): Promise<BePagedWrapper<ServicePartnerFee>> {
  const { data } = await api.get<BePagedWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES,
    { params },
  );
  return data;
}

export async function fetchServicePartnerFeeById(
  id: string,
): Promise<BeWrapper<ServicePartnerFee>> {
  const { data } = await api.get<BeWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES_DETAIL(id),
  );
  return data;
}

export async function createServicePartnerFee(
  payload: CreateServicePartnerFeePayload,
): Promise<BeWrapper<ServicePartnerFee>> {
  const { data } = await api.post<BeWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES,
    payload,
  );
  return data;
}

export async function updateServicePartnerFee(
  id: string,
  payload: UpdateServicePartnerFeePayload,
): Promise<BeWrapper<ServicePartnerFee>> {
  const { data } = await api.put<BeWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES_DETAIL(id),
    payload,
  );
  return data;
}

export async function deleteServicePartnerFee(id: string): Promise<void> {
  await api.delete(API_ROUTES.ADMIN_SERVICE_PARTNER_FEES_DETAIL(id));
}

export async function activateServicePartnerFee(
  id: string,
): Promise<BeWrapper<ServicePartnerFee>> {
  const { data } = await api.patch<BeWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES_ACTIVATE(id),
  );
  return data;
}

export async function deactivateServicePartnerFee(
  id: string,
): Promise<BeWrapper<ServicePartnerFee>> {
  const { data } = await api.patch<BeWrapper<ServicePartnerFee>>(
    API_ROUTES.ADMIN_SERVICE_PARTNER_FEES_DEACTIVATE(id),
  );
  return data;
}
