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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payload = await req.json();
    const { data } = await backendApi.patch(
      `/api/v1/moderation/rescue-requests/${encodeURIComponent(id)}/status`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "PATCH moderator rescue request status");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
