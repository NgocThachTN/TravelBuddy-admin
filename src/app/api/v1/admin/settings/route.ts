import { NextRequest, NextResponse } from "next/server";
import { logAndExtract } from "@/lib/api-error";
import { verifyAdminToken } from "@/lib/auth";
import { backendApi } from "@/lib/axios";
import { COOKIE_NAME } from "@/lib/constants";

const BACKEND_ROUTE = "/api/v1/admin/settings";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

function buildQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};

  if (searchParams.has("pageNumber")) {
    params.PageNumber = searchParams.get("pageNumber")!;
  }
  if (searchParams.has("pageSize")) {
    params.PageSize = searchParams.get("pageSize")!;
  }
  if (searchParams.has("search")) {
    params.Search = searchParams.get("search")!;
  }

  return params;
}

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  try {
    const { data } = await backendApi.get(BACKEND_ROUTE, {
      params: buildQueryParams(searchParams),
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET admin system settings");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { data } = await backendApi.put(BACKEND_ROUTE, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "PUT admin system setting");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
