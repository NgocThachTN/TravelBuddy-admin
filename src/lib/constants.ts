export const COOKIE_NAME = "tb_admin_session";

export const ROUTES = {
  LOGIN: "/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/admin/login",
  AUTH_LOGOUT: "/api/auth/admin/logout",
  ADMIN_USERS: "/api/admin/users",
} as const;
