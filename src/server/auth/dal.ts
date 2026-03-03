/**
 * Server-only Data Access Layer for authentication.
 * Import only from Server Components, Route Handlers, and Server Actions.
 */
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import type { Role } from "@/types";

export type { Role };

export async function getSession() {
  return getAdminSession();
}

/** Returns session or redirects to /login */
export async function requireSession() {
  const session = await getAdminSession();
  if (!session) redirect("/login");
  return session;
}

/** Requires exact role or redirects to /403 */
export async function requireRole(role: Role) {
  const session = await requireSession();
  if (session.role !== role) redirect("/403");
  return session;
}

/** Requires one of the provided roles or redirects to /403 */
export async function requireAnyRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect("/403");
  return session;
}
