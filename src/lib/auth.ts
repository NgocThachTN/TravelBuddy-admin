import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";
import { mapBERole } from "./rbac";
import type { Role, AdminSession } from "@/types";

export type { AdminSession, AdminPayload } from "@/types";

// Backend JWT claim keys (ASP.NET Core Identity convention)
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

/**
 * Decode a JWT payload without verifying the signature.
 * The signature is verified by the backend; we only check role and expiry here.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Decode the backend JWT and return the session, or null if invalid/expired/unknown role */
export async function verifyAdminToken(
  token: string
): Promise<AdminSession | null> {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Check expiry
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp && Date.now() / 1000 > exp) return null;

  // Map BE role string → internal Role
  const beRole = payload[ROLE_CLAIM] as string | undefined;
  if (!beRole) return null;
  const role = mapBERole(beRole);
  if (!role) return null; // Unknown/unauthorized role

  return {
    phone: (payload[NAME_CLAIM] as string | undefined) ?? "",
    role,
  };
}

/** Read the admin session from the request cookies */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
