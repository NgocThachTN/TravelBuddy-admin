import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { AxiosError } from "axios";

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

export async function GET() {
  try {
    const { data } = await backendApi.get(
      "/api/v1/trip-metadata/expense-categories"
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message ?? "Lỗi server";
      return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  try {
    const { data } = await backendApi.post(
      "/api/v1/trip-metadata/expense-categories",
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message ?? "Tạo danh mục chi phí thất bại";
      return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
    }
    return NextResponse.json({ error: "Tạo danh mục chi phí thất bại" }, { status: 500 });
  }
}
