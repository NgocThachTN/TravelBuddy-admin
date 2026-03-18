import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { backendApi } from "@/lib/axios";
import { COOKIE_NAME } from "@/lib/constants";
import { logAndExtract } from "@/lib/api-error";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;

  try {
    const { data } = await backendApi.get(
      `/api/v1/admin/partner-reviews/${requestId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, `GET partner review request ${requestId}`);
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
