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

// ── GET /api/auth/profile ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await backendApi.get("/api/v1/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET auth/profile");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}

// ── PUT /api/auth/profile ────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { data } = await backendApi.put("/api/v1/auth/profile", body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "PUT auth/profile");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
