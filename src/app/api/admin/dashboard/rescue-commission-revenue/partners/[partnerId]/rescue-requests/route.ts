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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partnerId } = await params;
  const { searchParams } = new URL(req.url);
  const query: Record<string, string> = {};

  const keys = [
    "pageNumber",
    "pageSize",
    "search",
    "sortBy",
    "sortDirection",
    "windowDays",
    "fromUtc",
    "toUtc",
  ] as const;

  for (const key of keys) {
    const value = searchParams.get(key);
    if (value) {
      query[key] = value;
    }
  }

  try {
    const { data } = await backendApi.get(
      `/api/v1/admin/dashboard/rescue-commission-revenue/partners/${encodeURIComponent(
        partnerId,
      )}/rescue-requests`,
      {
        params: query,
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET admin partner rescue commission requests");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
