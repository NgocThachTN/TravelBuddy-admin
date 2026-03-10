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

// ── GET /api/admin/trips ─────────────────────────────────────────────
// Query params: pageNumber, pageSize, search, sortBy, sortDirection

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const params: Record<string, string> = {};
  if (searchParams.has("pageNumber")) params.pageNumber = searchParams.get("pageNumber")!;
  if (searchParams.has("pageSize")) params.pageSize = searchParams.get("pageSize")!;
  if (searchParams.has("search")) params.search = searchParams.get("search")!;
  if (searchParams.has("sortBy")) params.sortBy = searchParams.get("sortBy")!;
  if (searchParams.has("sortDirection")) params.sortDirection = searchParams.get("sortDirection")!;

  try {
    const { data } = await backendApi.get("/api/v1/trips", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET trips");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
