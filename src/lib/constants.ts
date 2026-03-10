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
} as const;
