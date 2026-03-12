export const COOKIE_NAME = "tb_admin_session";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/dashboard/users",
  TRIPS: "/dashboard/trips",
  PARTNERS: "/dashboard/partners",
  MODERATION: "/dashboard/moderation",
  REPORTS: "/dashboard/reports",
  TRANSACTIONS: "/dashboard/transactions",
  SUBSCRIPTIONS: "/dashboard/subscriptions",
  CATEGORIES: "/dashboard/categories",
  SUPPORT: "/dashboard/support",
  AUDIT_LOGS: "/dashboard/audit-logs",
  SETTINGS: "/dashboard/settings",
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/admin/login",
  AUTH_LOGOUT: "/api/auth/admin/logout",
  ADMIN_USERS: "/api/admin/users",
  /** Truyền userId vào: `${API_ROUTES.ADMIN_USERS}/${userId}` */
  ADMIN_USERS_DETAIL: (userId: string) => `/api/admin/users/${userId}`,
  ADMIN_USERS_LOCK: (userId: string) => `/api/admin/users/${userId}/lock`,
  ADMIN_USERS_UNLOCK: (userId: string) => `/api/admin/users/${userId}/unlock`,
  ADMIN_USERS_MODERATORS: "/api/admin/users/moderators",
  ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
  ADMIN_TRIP_TYPE_CATEGORIES: "/api/admin/trip-metadata/trip-type-categories",
  ADMIN_VEHICLE_CATEGORIES: "/api/admin/trip-metadata/vehicle-categories",
  ADMIN_EXPENSE_CATEGORIES: "/api/admin/trip-metadata/expense-categories",
  ADMIN_TRIPS: "/api/admin/trips",
  ADMIN_TRIPS_DETAIL: (tripId: string) => `/api/admin/trips/${tripId}`,
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
} as const;
