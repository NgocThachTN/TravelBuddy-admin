import { NextRequest, NextResponse } from "next/server";
import { backendApi } from "@/lib/axios";
import { verifyAdminToken } from "@/lib/auth";
import { logAndExtract } from "@/lib/api-error";
import { COOKIE_NAME } from "@/lib/constants";

const BACKEND_ROUTE = "/api/v1/admin/wallet-withdrawals/work-queue";

function nonEmpty(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildQueryParams(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {
    PageNumber: searchParams.get("pageNumber") ?? "1",
    PageSize: searchParams.get("pageSize") ?? "10",
  };

  const search = nonEmpty(searchParams.get("search"));
  if (search) {
    params.Search = search;
  }

  const status = nonEmpty(searchParams.get("status"));
  if (status) {
    params.Status = status;
  }

  return params;
}

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
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
    const e = logAndExtract(err, "GET admin wallet withdrawal work-queue");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
