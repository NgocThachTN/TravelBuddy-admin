import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { logAndExtract } from "@/lib/api-error";

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

  try {
    const { data } = await backendApi.get(
      `/api/v1/admin/subscription-packages/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, `GET subscriptions/${id}`);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// ── PUT /api/admin/subscriptions/[id] ────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const { data } = await backendApi.put(
      `/api/v1/admin/subscription-packages/${id}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, `PUT subscriptions/${id}`);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// ── DELETE /api/admin/subscriptions/[id] ─────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const res = await backendApi.delete(
      `/api/v1/admin/subscription-packages/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(res.data);
  } catch (err) {
    const e = logAndExtract(err, `DELETE subscriptions/${id}`);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
