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

// GET /api/admin/moderation/trips/[taskId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const { data } = await backendApi.get(`/api/v1/moderation/trips/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET trip moderation task detail");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
