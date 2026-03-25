import { NextResponse } from "next/server";
import { COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const expiredCookie = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(COOKIE_NAME, "", expiredCookie);
  response.cookies.set(REFRESH_COOKIE_NAME, "", expiredCookie);

  return response;
}
