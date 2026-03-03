import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use PNG, JPG, WebP, SVG, or GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 2 MB." },
        { status: 400 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "travelbuddy/icons";

    // Cloudinary requires a signature over alphabetically-sorted params
    const signaturePayload = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash("sha1").update(signaturePayload).digest("hex");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", API_KEY);
    uploadForm.append("timestamp", String(timestamp));
    uploadForm.append("folder", folder);
    uploadForm.append("signature", signature);

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
          : "Upload to Cloudinary failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
