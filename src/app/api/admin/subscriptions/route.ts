import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:5000";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

// ── GET /api/admin/subscriptions ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pageNumber = searchParams.get("pageNumber") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const includeDisabled = searchParams.get("includeDisabled") ?? "true";

  const beRes = await fetch(
    `${BACKEND_API_URL}/api/v1/admin/subscription-packages?PageNumber=${pageNumber}&PageSize=${pageSize}&includeDisabled=${includeDisabled}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await beRes.json().catch(() => ({}));

  if (!beRes.ok) {
    return NextResponse.json(
      { error: data.message ?? "Lỗi server" },
      { status: beRes.status }
    );
  }

  return NextResponse.json(data);
}

// ── POST /api/admin/subscriptions ────────────────────────────────────
export async function POST(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const beRes = await fetch(
    `${BACKEND_API_URL}/api/v1/admin/subscription-packages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await beRes.json().catch(() => ({}));

  if (!beRes.ok) {
    return NextResponse.json(
      { error: data.message ?? "Tạo gói đăng ký thất bại" },
      { status: beRes.status }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
