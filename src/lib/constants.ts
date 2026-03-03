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
  ADMIN_SUBSCRIPTIONS: "/api/admin/subscriptions",
  ADMIN_TRIP_TYPE_CATEGORIES: "/api/admin/trip-metadata/trip-type-categories",
  ADMIN_VEHICLE_CATEGORIES: "/api/admin/trip-metadata/vehicle-categories",
  ADMIN_EXPENSE_CATEGORIES: "/api/admin/trip-metadata/expense-categories",
} as const;
