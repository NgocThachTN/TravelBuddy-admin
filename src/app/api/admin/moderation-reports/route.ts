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

// ── GET /api/admin/moderation-reports ────────────────────────────────
export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const params: Record<string, string> = {};
  if (searchParams.has("pageNumber")) params.PageNumber = searchParams.get("pageNumber")!;
  if (searchParams.has("pageSize")) params.PageSize = searchParams.get("pageSize")!;
  if (searchParams.has("status")) params.Status = searchParams.get("status")!;
  if (searchParams.has("targetType")) params.TargetType = searchParams.get("targetType")!;
  if (searchParams.has("priority")) params.Priority = searchParams.get("priority")!;
  if (searchParams.has("fromDate")) params.FromDate = searchParams.get("fromDate")!;
  if (searchParams.has("toDate")) params.ToDate = searchParams.get("toDate")!;

  try {
    const { data } = await backendApi.get("/api/v1/moderation/reports", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET moderation reports");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
