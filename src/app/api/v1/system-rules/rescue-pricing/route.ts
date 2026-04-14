import { NextResponse } from "next/server";
import { backendApi } from "@/lib/axios";
import { logAndExtract } from "@/lib/api-error";

export async function GET() {
  try {
    const { data } = await backendApi.get("/api/v1/system-rules/rescue-pricing");
    return NextResponse.json(data);
  } catch (err) {
    const e = logAndExtract(err, "GET rescue-pricing rules");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
}
