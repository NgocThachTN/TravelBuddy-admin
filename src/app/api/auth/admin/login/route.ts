import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

function extractUpstreamErrorMessage(data: unknown, status?: number) {
  const fallback = status ? `Đăng nhập thất bại (HTTP ${status})` : "Đăng nhập thất bại";

  if (!data) return fallback;

  if (typeof data === "string") {
    const trimmed = data.trim();
    const lowered = trimmed.toLowerCase();
    const isHtmlPayload =
      lowered.startsWith("<!doctype html") || lowered.includes("<html");

    if (isHtmlPayload) {
      if (status === 502 || status === 503 || status === 504) {
        return `Hệ thống backend đang lỗi gateway (${status}). Vui lòng thử lại sau.`;
      }
      return status
        ? `Hệ thống backend tạm thời lỗi (HTTP ${status}). Vui lòng thử lại sau.`
        : "Hệ thống backend tạm thời lỗi. Vui lòng thử lại sau.";
    }

    return trimmed || fallback;
  }

  if (data && typeof data === "object") {
    const payload = data as {
      detail?: string;
      message?: string;
      title?: string;
      error?: string | { message?: string };
    };

    if (payload.detail) return payload.detail;
    if (payload.message) return payload.message;
    if (typeof payload.error === "string") return payload.error;
    if (
      payload.error &&
      typeof payload.error === "object" &&
      typeof payload.error.message === "string"
    ) {
      return payload.error.message;
    }
    if (payload.title) return payload.title;
  }

  return fallback;
}

function extractNetworkErrorMessage(err: AxiosError) {
  const code = err.code?.toUpperCase();
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "EHOSTUNREACH") {
    return "Không kết nối được backend. Vui lòng kiểm tra BACKEND_API_URL và trạng thái server.";
  }

  if (code === "ETIMEDOUT" || code === "ECONNABORTED") {
    return "Kết nối backend bị timeout. Vui lòng thử lại sau.";
  }

  return "Không kết nối được backend. Vui lòng thử lại sau.";
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email và mật khẩu là bắt buộc" },
        { status: 400 },
      );
    }

    const { data } = await backendApi.post("/api/v1/auth/login/email-password", {
      email,
      password,
    });

    if (!data.success) {
      return NextResponse.json(
        { error: data.message ?? "Đăng nhập thất bại" },
        { status: 400 },
      );
    }

    if (data.data?.user?.role !== "Admin" && data.data?.user?.role !== "Moderator") {
      return NextResponse.json(
        { error: "Bạn không có quyền truy cập trang quản trị" },
        { status: 403 },
      );
    }

    const { accessToken, refreshToken, expiresIn } = data.data;

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Phản hồi đăng nhập không hợp lệ từ backend" },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn ?? 3600,
    });

    response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      const hasUpstreamStatus = typeof status === "number";
      const msg = hasUpstreamStatus
        ? extractUpstreamErrorMessage(err.response?.data, status)
        : extractNetworkErrorMessage(err);
      const resStatus =
        hasUpstreamStatus && status >= 400 && status <= 599 ? status : 503;
      const body: { error: string; upstreamStatus?: number } = { error: msg };

      if (hasUpstreamStatus) {
        body.upstreamStatus = status;
      }

      return NextResponse.json(body, { status: resStatus });
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[login/route] Error:", err);
    return NextResponse.json(
      { error: "Lỗi máy chủ nội bộ", detail: message },
      { status: 500 },
    );
  }
}
