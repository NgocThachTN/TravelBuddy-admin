import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface AdminPayload {
  email: string;
  role: "admin";
}

/** Sign a JWT with admin payload, 8-hour expiry */
export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" } satisfies AdminPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

/** Verify a JWT and return the admin payload, or null if invalid */
export async function verifyAdminToken(
  token: string
): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

/** Read the admin session from the request cookies */
export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

/** Validate admin credentials against env vars */
export function validateCredentials(email: string, password: string): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}
