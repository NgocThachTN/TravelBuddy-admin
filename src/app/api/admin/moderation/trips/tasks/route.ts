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

// GET /api/admin/moderation/trips/tasks
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
  if (searchParams.has("scanStatus")) params.ScanStatus = searchParams.get("scanStatus")!;
  if (searchParams.has("search")) params.Search = searchParams.get("search")!;
  if (searchParams.has("sortBy")) params.SortBy = searchParams.get("sortBy")!;
  if (searchParams.has("sortDirection")) params.SortDirection = searchParams.get("sortDirection")!;

  try {
    const { data } = await backendApi.get("/api/v1/moderation/trips/tasks", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET trip moderation tasks");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
