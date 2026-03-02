import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";

// Backend JWT role claim key (ASP.NET Core Identity convention)
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

export interface AdminPayload {
  phone: string;
  role: "Admin";
}

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

/** Decode the backend JWT and return the admin payload, or null if invalid/expired */
export async function verifyAdminToken(
  token: string
): Promise<AdminPayload | null> {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Check expiry
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp && Date.now() / 1000 > exp) return null;

  // Check role — backend uses "Admin" (capital A)
  const role = payload[ROLE_CLAIM] as string | undefined;
  if (role !== "Admin") return null;

  return {
    phone: (payload[NAME_CLAIM] as string | undefined) ?? "",
    role: "Admin",
  };
}

/** Read the admin session from the request cookies */
export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
