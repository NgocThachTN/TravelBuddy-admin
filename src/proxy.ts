import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tb_admin_session";
const LOGIN_PATH = "/login";

/** Các path thuộc dashboard cần bảo vệ */
const PROTECTED_PATHS = [
  "/dashboard",
];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page — if already authenticated, redirect to dashboard
  if (pathname === LOGIN_PATH) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, getSecret());
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch {
        // token invalid — let them see login
      }
    }
    return NextResponse.next();
  }

  // Protect dashboard routes — require auth
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // TODO: Tạm tắt xác thực để phát triển. Bật lại trước khi deploy production.
  return NextResponse.next();
  /*
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }
  */
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
  ],
};
