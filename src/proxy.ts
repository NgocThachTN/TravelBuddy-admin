import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "tb_admin_session";
const LOGIN_PATH = "/login";

// Backend JWT role claim (ASP.NET Core Identity)
const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValidAdminToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  const exp = typeof payload.exp === "number" ? payload.exp : null;
  if (exp && Date.now() / 1000 > exp) return false;
  return payload[ROLE_CLAIM] === "Admin";
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const isAuthenticated = !!token && isValidAdminToken(token);

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
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};

