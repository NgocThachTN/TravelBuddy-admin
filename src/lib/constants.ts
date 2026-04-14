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
  MODERATION: "/dashboard/moderation",
  MODERATION_REPORTS: "/dashboard/moderation-reports",
  MODERATION_MY_REPORTS: "/dashboard/moderation-reports/my-reports",
  MODERATION_REPORTS_BY_TYPE: (targetType?: string) =>
    targetType
      ? `/dashboard/moderation-reports?targetType=${encodeURIComponent(targetType)}`
      : "/dashboard/moderation-reports",
  REPORTS: "/dashboard/reports",
  TRANSACTIONS: "/dashboard/transactions",
  TRANSACTIONS_DEPOSITS: "/dashboard/transactions/deposits",
  TRANSACTIONS_WALLET_WITHDRAWALS: "/dashboard/transactions/wallet-withdrawals",
  TRANSACTIONS_USER_SUBSCRIPTIONS: "/dashboard/transactions/user-subscriptions",
  SUBSCRIPTIONS: "/dashboard/subscriptions",
  SUBSCRIPTIONS_USERS: "/dashboard/subscriptions/users",
  SUBSCRIPTIONS_PARTNER_COMMISSIONS: "/dashboard/subscriptions/partner-commissions",
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
  ADMIN_DASHBOARD_OVERVIEW: "/api/admin/dashboard/overview",
  MODERATION_DASHBOARD_OVERVIEW: "/api/moderation/dashboard/overview",
  ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
  ADMIN_TRANSACTIONS_DEPOSITS: "/api/admin/transactions/deposits",
  ADMIN_WALLET_WITHDRAWALS_WORK_QUEUE: "/api/admin/wallet-withdrawals/work-queue",
  ADMIN_WALLET_WITHDRAWALS_PROCESSING: (withdrawalId: string) =>
    `/api/admin/wallet-withdrawals/${withdrawalId}/processing`,
  ADMIN_WALLET_WITHDRAWALS_APPROVE: (withdrawalId: string) =>
    `/api/admin/wallet-withdrawals/${withdrawalId}/approve`,
  ADMIN_WALLET_WITHDRAWALS_REJECT: (withdrawalId: string) =>
    `/api/admin/wallet-withdrawals/${withdrawalId}/reject`,
  ADMIN_TRANSACTIONS_USER_SUBSCRIPTIONS:
    "/api/admin/transactions/user-subscriptions",
  ADMIN_TRIP_TYPE_CATEGORIES: "/api/admin/trip-metadata/trip-type-categories",
  ADMIN_VEHICLE_CATEGORIES: "/api/admin/trip-metadata/vehicle-categories",
  ADMIN_EXPENSE_CATEGORIES: "/api/admin/trip-metadata/expense-categories",
  ADMIN_TRIPS: "/api/admin/trips",
  ADMIN_TRIPS_DETAIL: (tripId: string) => `/api/admin/trips/${tripId}`,
  ADMIN_TRIPS_OVERRIDE: (tripId: string) => `/api/admin/trips/${tripId}/override`,
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
  REPORTS: "/api/reports",
  REPORTS_REASONS: "/api/reports/reasons",
  MY_REPORTS: "/api/reports/me",
  MY_REPORTS_DETAIL: (reportId: string) => `/api/reports/me/${reportId}`,
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
  ADMIN_PARTNER_REVIEWS_DECISION: (id: string) =>
    `/api/admin/partners/requests/${id}/decision`,
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
  SYSTEM_RULES_RESCUE_PRICING: "/api/v1/system-rules/rescue-pricing",
  ADMIN_SYSTEM_RULES_RESCUE_PRICING: "/api/v1/admin/system-rules/rescue-pricing",
} as const;
