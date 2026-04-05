export const COOKIE_NAME = "tb_admin_session";
export const REFRESH_COOKIE_NAME = "tb_admin_refresh_session";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/dashboard/users",
  USERS_MODERATORS: "/dashboard/users/moderators",
  TRIPS: "/dashboard/trips",
  PARTNERS: "/dashboard/partners",
  PARTNER_REQUESTS: "/dashboard/partners/requests",
  PARTNER_REQUESTS_DETAIL: (id: string) => `/dashboard/partners/requests/${id}`,
  ACTIVE_PARTNERS: "/dashboard/partners/active",
  ACTIVE_PARTNERS_DETAIL: (id: string) => `/dashboard/partners/active/${id}`,
  PARTNER_FEES: "/dashboard/partners/fees",
  MODERATION: "/dashboard/moderation",
  MODERATION_REPORTS: "/dashboard/moderation-reports",
  MODERATION_REPORTS_BY_TYPE: (targetType?: string) =>
    targetType
      ? `/dashboard/moderation-reports?targetType=${encodeURIComponent(targetType)}`
      : "/dashboard/moderation-reports",
  REPORTS: "/dashboard/reports",
  TRANSACTIONS: "/dashboard/transactions",
  TRANSACTIONS_DEPOSITS: "/dashboard/transactions/deposits",
  TRANSACTIONS_USER_SUBSCRIPTIONS: "/dashboard/transactions/user-subscriptions",
  TRANSACTIONS_PARTNER_SUBSCRIPTIONS:
    "/dashboard/transactions/partner-subscriptions",
  SUBSCRIPTIONS: "/dashboard/subscriptions",
  SUBSCRIPTIONS_PARTNERS: "/dashboard/subscriptions/partners",
  SUBSCRIPTIONS_USERS: "/dashboard/subscriptions/users",
  CATEGORIES: "/dashboard/categories",
  SUPPORT: "/dashboard/support",
  AUDIT_LOGS: "/dashboard/audit-logs",
  SETTINGS: "/dashboard/settings",
  PROFILE: "/dashboard/profile",
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/admin/login",
  AUTH_LOGOUT: "/api/auth/admin/logout",
  AUTH_REFRESH: "/api/auth/admin/refresh",
  AUTH_PROFILE: "/api/auth/profile",
  AUTH_CHANGE_PASSWORD: "/api/auth/change-password",
  ADMIN_USERS: "/api/admin/users",
  /** Truyền userId vào: `${API_ROUTES.ADMIN_USERS}/${userId}` */
  ADMIN_USERS_DETAIL: (userId: string) => `/api/admin/users/${userId}`,
  ADMIN_USERS_LOCK: (userId: string) => `/api/admin/users/${userId}/lock`,
  ADMIN_USERS_UNLOCK: (userId: string) => `/api/admin/users/${userId}/unlock`,
  ADMIN_USERS_MODERATORS: "/api/admin/users/moderators",
  ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
  ADMIN_TRANSACTIONS_DEPOSITS: "/api/admin/transactions/deposits",
  ADMIN_TRANSACTIONS_USER_SUBSCRIPTIONS:
    "/api/admin/transactions/user-subscriptions",
  ADMIN_TRIP_TYPE_CATEGORIES: "/api/admin/trip-metadata/trip-type-categories",
  ADMIN_VEHICLE_CATEGORIES: "/api/admin/trip-metadata/vehicle-categories",
  ADMIN_EXPENSE_CATEGORIES: "/api/admin/trip-metadata/expense-categories",
  ADMIN_TRIPS: "/api/admin/trips",
  ADMIN_TRIPS_DETAIL: (tripId: string) => `/api/admin/trips/${tripId}`,
  ADMIN_TRIP_MODERATION_TASKS: "/api/admin/moderation/trips/tasks",
  ADMIN_TRIP_MODERATION_TASK_DETAIL: (taskId: string) =>
    `/api/admin/moderation/trips/${taskId}`,
  ADMIN_TRIP_MODERATION_DECISION: (taskId: string) =>
    `/api/admin/moderation/trips/${taskId}/decision`,
  ADMIN_REPORTS: "/api/admin/reports",
  ADMIN_REPORTS_DETAIL: (reportId: string) => `/api/admin/reports/${reportId}`,
  ADMIN_REPORTS_PROCESS: (reportId: string) =>
    `/api/admin/reports/${reportId}/process`,
  ADMIN_REPORT_REASONS: "/api/admin/report-reasons",
  MODERATION_REPORTS: "/api/admin/moderation-reports",
  MODERATION_REPORTS_DETAIL: (reportId: string) =>
    `/api/admin/moderation-reports/${reportId}`,
  MODERATION_REPORTS_PROCESS: (reportId: string) =>
    `/api/admin/moderation-reports/${reportId}/process`,
  MODERATION_REPORTS_CLAIM: (reportId: string) =>
    `/api/admin/moderation-reports/${reportId}/claim`,
  ADMIN_PARTNER_REVIEWS: "/api/admin/partners/requests",
  ADMIN_PARTNER_REVIEWS_DETAIL: (id: string) =>
    `/api/admin/partners/requests/${id}`,
  ADMIN_PARTNER_REVIEWS_APPROVE: (id: string) =>
    `/api/admin/partners/requests/${id}/approve`,
  ADMIN_PARTNER_REVIEWS_REJECT: (id: string) =>
    `/api/admin/partners/requests/${id}/reject`,
  ADMIN_PARTNER_REVIEWS_RESUBMIT: (id: string) =>
    `/api/admin/partners/requests/${id}/request-resubmission`,
  ADMIN_SERVICE_PARTNERS: "/api/admin/partners/service-partners",
  ADMIN_SERVICE_PARTNERS_DETAIL: (id: string) =>
    `/api/admin/partners/service-partners/${id}`,
  ADMIN_SERVICE_PARTNER_FEES: "/api/v1/admin/service-partner-fees",
  ADMIN_SERVICE_PARTNER_FEES_DETAIL: (id: string) =>
    `/api/v1/admin/service-partner-fees/${id}`,
  ADMIN_SERVICE_PARTNER_FEES_ACTIVATE: (id: string) =>
    `/api/v1/admin/service-partner-fees/${id}/activate`,
  ADMIN_SERVICE_PARTNER_FEES_DEACTIVATE: (id: string) =>
    `/api/v1/admin/service-partner-fees/${id}/deactivate`,
} as const;
