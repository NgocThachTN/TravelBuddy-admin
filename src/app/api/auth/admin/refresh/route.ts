import { NextRequest, NextResponse } from "next/server";
import { AxiosError } from "axios";
import { backendApi } from "@/lib/axios";
import { COOKIE_NAME, REFRESH_COOKIE_NAME } from "@/lib/constants";

type RefreshTokenData = {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAtUtc?: string;
  refreshTokenExpiresAtUtc?: string;
};

type RefreshTokenResponse = {
  success?: boolean;
  message?: string;
  data?: RefreshTokenData;
};

function computeMaxAge(expiryUtc?: string, fallbackSeconds = 3600): number {
  if (!expiryUtc) return fallbackSeconds;
  const expiresAtMs = Date.parse(expiryUtc);
  if (Number.isNaN(expiresAtMs)) return fallbackSeconds;
  const seconds = Math.floor((expiresAtMs - Date.now()) / 1000);
  return seconds > 0 ? seconds : 0;
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get(COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      { success: false, error: "Thiếu token để làm mới phiên đăng nhập" },
      { status: 401 },
    );
  }

  try {
    const { data } = await backendApi.post<RefreshTokenResponse>(
      "/api/v1/auth/refresh-token",
      { accessToken, refreshToken },
    );

    if (!data?.success || !data.data?.accessToken || !data.data?.refreshToken) {
      return NextResponse.json(
        { success: false, error: data?.message ?? "Không thể làm mới phiên đăng nhập" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, data.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: computeMaxAge(data.data.accessTokenExpiresAtUtc),
    });

    response.cookies.set(REFRESH_COOKIE_NAME, data.data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: computeMaxAge(data.data.refreshTokenExpiresAtUtc, 60 * 60 * 24 * 30),
    });

    return response;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status;
      return NextResponse.json(
        { success: false, error: "Làm mới phiên đăng nhập thất bại" },
        { status: status && status >= 400 && status <= 599 ? status : 401 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ nội bộ khi làm mới phiên đăng nhập" },
      { status: 500 },
    );
  }
}
