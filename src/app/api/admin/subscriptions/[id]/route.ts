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

type Params = { params: Promise<{ id: string }> };

// ── GET /api/admin/subscriptions/[id] ────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const beRes = await fetch(
    `${BACKEND_API_URL}/api/v1/admin/subscription-packages/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await beRes.json().catch(() => ({}));
  if (!beRes.ok) {
    return NextResponse.json({ error: data.message ?? "Không tìm thấy gói đăng ký" }, { status: beRes.status });
  }
  return NextResponse.json(data);
}

// ── PUT /api/admin/subscriptions/[id] ────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const beRes = await fetch(
    `${BACKEND_API_URL}/api/v1/admin/subscription-packages/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await beRes.json().catch(() => ({}));
  if (!beRes.ok) {
    return NextResponse.json({ error: data.message ?? "Cập nhật thất bại" }, { status: beRes.status });
  }
  return NextResponse.json(data);
}

// ── DELETE /api/admin/subscriptions/[id] ─────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const beRes = await fetch(
    `${BACKEND_API_URL}/api/v1/admin/subscription-packages/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (beRes.status === 204) return new NextResponse(null, { status: 204 });

  const data = await beRes.json().catch(() => ({}));
  return NextResponse.json({ error: data.message ?? "Xóa thất bại" }, { status: beRes.status });
}
