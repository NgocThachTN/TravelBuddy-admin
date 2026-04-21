import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const session = await verifyAdminToken(token);
  return session ? token : null;
}

function buildHubUrl() {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    throw new Error("BACKEND_API_URL is not configured.");
  }

  return new URL("/hubs/cache-invalidation", backendApiUrl).toString();
}

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json({
      accessToken: token,
      hubUrl: buildHubUrl(),
    });
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "Không thể khởi tạo cấu hình realtime.";

    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
