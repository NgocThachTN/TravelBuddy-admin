import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return NextResponse.json(
        { error: "Thiếu cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME hoặc CLOUDINARY_UPLOAD_PRESET)." },
        { status: 500 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không có tệp được gửi lên." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Định dạng tệp không hợp lệ. Chỉ chấp nhận PNG, JPG, WebP, SVG hoặc GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Tệp quá lớn. Kích thước tối đa là 2 MB." },
        { status: 400 },
      );
    }

    const folder = "travelbuddy/avatars";

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("upload_preset", UPLOAD_PRESET);
    uploadForm.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: uploadForm },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("Cloudinary upload failed:", body);
      const detail = (body as Record<string, unknown>)?.error;
      const message =
        typeof detail === "object" && detail !== null && "message" in detail
          ? (detail as { message: string }).message
          : "Tải ảnh lên Cloudinary thất bại.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Lỗi hệ thống khi tải ảnh lên." }, { status: 500 });
  }
}
