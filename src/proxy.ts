import { NextRequest, NextResponse } from "next/server";
import type { Role } from "./lib/rbac";

const COOKIE_NAME = "tb_admin_session";
const LOGIN_PATH = "/login";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

// Inline to avoid edge-runtime import issues with @/ alias
function mapBERole(beRole: string): Role | null {
  if (beRole === "Admin") return "ADMIN";
  if (beRole === "Moderator") return "MODERATOR";
  return null;
}

// MODERATOR-blocked path prefixes (inline copy of rbac.ts logic)
const ADMIN_ONLY_PREFIXES: string[] = [
  "/dashboard/admin",
  "/dashboard/users",
  "/dashboard/audit-logs",
  "/dashboard/settings",
  "/dashboard/transactions",
  "/dashboard/subscriptions",
  "/dashboard/partners",
  "/dashboard/trips",
];

function canAccess(role: Role, pathname: string): boolean {
  if (role === "ADMIN") return true;
  return !ADMIN_ONLY_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function decodeSession(token: string): { role: Role } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));

    const exp = typeof payload.exp === "number" ? payload.exp : null;
    if (exp && Date.now() / 1000 > exp) return null;

    const beRole = payload[ROLE_CLAIM] as string | undefined;
    if (!beRole) return null;

    const role = mapBERole(beRole);
    if (!role) return null;

    return { role };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? decodeSession(token) : null;
  const isAuthenticated = session !== null;

  // Root → redirect based on auth status
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : LOGIN_PATH, req.url)
    );
  }

  // Login page: already authenticated → go to dashboard
  if (pathname === LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protect /dashboard and all sub-routes
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL(LOGIN_PATH, req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // RBAC: check role-based access
    if (!canAccess(session.role, pathname)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};

