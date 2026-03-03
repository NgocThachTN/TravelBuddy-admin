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

type Params = { params: Promise<{ id: string }> };

// ── GET /api/admin/subscriptions/[id] ────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const { data } = await backendApi.get(
      `/api/v1/admin/subscription-packages/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message ?? "Không tìm thấy gói đăng ký";
      return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
    }
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ── PUT /api/admin/subscriptions/[id] ────────────────────────────────
export async function PUT(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const { data } = await backendApi.put(
      `/api/v1/admin/subscription-packages/${id}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message ?? "Cập nhật thất bại";
      return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
    }
    return NextResponse.json({ error: "Cập nhật thất bại" }, { status: 500 });
  }
}

// ── DELETE /api/admin/subscriptions/[id] ─────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const token = await getToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const res = await backendApi.delete(
      `/api/v1/admin/subscription-packages/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    return NextResponse.json(res.data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const msg = err.response?.data?.message ?? "Xóa thất bại";
      return NextResponse.json({ error: msg }, { status: err.response?.status ?? 500 });
    }
    return NextResponse.json({ error: "Xóa thất bại" }, { status: 500 });
  }
}
