import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { backendApi } from "@/lib/axios";
import { logAndExtract } from "@/lib/api-error";
import { COOKIE_NAME } from "@/lib/constants";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

export async function POST(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await backendApi.post(
      "/api/v1/moderation/trips/scan/dispatch-now",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return NextResponse.json(data);
  } catch (err) {
    const error = logAndExtract(err, "POST dispatch trip moderation scan now");
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}
