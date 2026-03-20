import type { Role } from "@/types";

export type { Role } from "@/types";

// Paths that MODERATOR is NOT allowed to access
const ADMIN_ONLY_PREFIXES: string[] = [
  "/dashboard/admin",
  "/dashboard/users",
  "/dashboard/audit-logs",
  "/dashboard/settings",
  "/dashboard/transactions",
  "/dashboard/subscriptions",
  "/dashboard/categories",
  "/dashboard/partners",
  "/dashboard/reports",
];

export function canAccess(role: Role, pathname: string): boolean {
  if (role === "ADMIN") return true;
  return !ADMIN_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** Map BE role strings ("Admin", "Moderator") to internal Role type */
export function mapBERole(beRole: string): Role | null {
  if (beRole === "Admin") return "ADMIN";
  if (beRole === "Moderator") return "MODERATOR";
  return null;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  MODERATOR: "Kiểm duyệt viên",
};
