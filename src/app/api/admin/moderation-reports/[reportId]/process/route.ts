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

// ── PATCH /api/admin/moderation-reports/[reportId]/process ───────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = await params;
  const body = await req.json();

  try {
    const { data } = await backendApi.patch(
      `/api/v1/moderation/reports/${encodeURIComponent(reportId)}/process`,
      body,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "PATCH process moderation report");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
