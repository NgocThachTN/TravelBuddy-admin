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

// ── GET /api/admin/trips/[tripId] ────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  try {
    const { data } = await backendApi.get(`/api/v1/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET trip detail");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// ── DELETE /api/admin/trips/[tripId] ─────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  try {
    const { data } = await backendApi.delete(`/api/v1/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "DELETE trip");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// —— PATCH /api/admin/trips/[tripId] ——————————————————————————————————

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId } = await params;

  try {
    const payload = await req.json();
    const { data } = await backendApi.patch(`/api/v1/admin/trips/${tripId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "PATCH admin trip");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
