import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:5000";

/** Normalize VN phone number to E.164 (+84...) */
function normalizePhone(raw: string): string {
  const s = raw.trim().replace(/\s+/g, "");
  if (s.startsWith("+84")) return s;
  if (s.startsWith("84")) return `+${s}`;
  if (s.startsWith("0")) return `+84${s.slice(1)}`;
  return s;
}

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();

    if (!phoneNumber || !password) {
      return NextResponse.json(
        { error: "Số điện thoại và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phoneNumber);
    const backendRes = await fetch(
      `${BACKEND_API_URL}/api/v1/auth/login/phone-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: normalizedPhone, password }),
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success) {
      return NextResponse.json(
        { error: data.message ?? "Đăng nhập thất bại" },
        { status: backendRes.status === 401 ? 401 : 400 }
      );
    }

    // Only allow Admin role
    if (data.data?.user?.role !== "Admin") {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập trang quản trị" },
        { status: 403 }
      );
    }

    const { accessToken, expiresIn } = data.data;

    const response = NextResponse.json({ success: true });

    // Store the backend JWT as a httpOnly cookie
    response.cookies.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn ?? 3600,
    });

    return response;
  } catch (err) {
    console.error("[login/route] Error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ" },
      { status: 500 }
    );
  }
}
