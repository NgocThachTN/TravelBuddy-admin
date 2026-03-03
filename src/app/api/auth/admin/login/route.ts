import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

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

    const { data } = await backendApi.post(
      "/api/v1/auth/login/phone-password",
      { phoneNumber: normalizedPhone, password }
    );

    if (!data.success) {
      return NextResponse.json(
        { error: data.message ?? "Đăng nhập thất bại" },
        { status: 400 }
      );
    }

    if (data.data?.user?.role !== "Admin" && data.data?.user?.role !== "Moderator") {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập trang quản trị" },
        { status: 403 }
      );
    }

    const { accessToken, expiresIn } = data.data;

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn ?? 3600,
    });

    return response;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const msg = err.response?.data?.message ?? "Đăng nhập thất bại";
      return NextResponse.json(
        { error: msg },
        { status: status === 401 ? 401 : 400 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[login/route] Error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ", detail: message },
      { status: 500 }
    );
  }
}
