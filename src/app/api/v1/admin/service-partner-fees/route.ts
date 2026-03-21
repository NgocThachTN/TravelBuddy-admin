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

// ── GET /api/v1/admin/service-partner-fees ───────────────────────────
export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pageNumber = searchParams.get("pageNumber") ?? "1";
  const pageSize = searchParams.get("pageSize") ?? "10";

  try {
    const { data } = await backendApi.get(
      "/api/v1/admin/service-partner-fees",
      {
        params: {
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET service-partner-fees");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// ── POST /api/v1/admin/service-partner-fees ──────────────────────────
export async function POST(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { data } = await backendApi.post(
      "/api/v1/admin/service-partner-fees",
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const e = logAndExtract(err, "POST service-partner-fees");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
