import { NextRequest, NextResponse } from "next/server";
import { backendApi } from "@/lib/axios";
import { verifyAdminToken } from "@/lib/auth";
import { logAndExtract } from "@/lib/api-error";
import { COOKIE_NAME } from "@/lib/constants";

const BACKEND_ROUTE = "/api/v1/admin/wallet-withdrawals/settings";

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

  try {
    const { data } = await backendApi.get(BACKEND_ROUTE, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET admin wallet withdrawal settings");
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
    const e = logAndExtract(err, "PUT admin wallet withdrawal settings");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
