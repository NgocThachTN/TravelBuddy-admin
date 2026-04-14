import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/constants";

const PUBLIC_ALLOWED_HOSTS = [
  "res.cloudinary.com",
];

async function getToken(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifyAdminToken(token);
  return session ? token : null;
}

function toBackendHost() {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    return null;
  }

  try {
    return new URL(backendApiUrl).host.toLowerCase();
  } catch {
    return null;
  }
}

function isHostMatched(host: string, expectedHost: string) {
  if (host === expectedHost) {
    return true;
  }

  return host.endsWith(`.${expectedHost}`);
}

function isAllowedTargetHost(host: string, backendHost: string | null) {
  if (backendHost && isHostMatched(host, backendHost)) {
    return true;
  }

  return PUBLIC_ALLOWED_HOSTS.some((allowedHost) => isHostMatched(host, allowedHost));
}

export async function GET(req: NextRequest) {
  const token = await getToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawTargetUrl = req.nextUrl.searchParams.get("url");
  if (!rawTargetUrl) {
    return NextResponse.json({ error: "Missing url query." }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(rawTargetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid target url." }, { status: 400 });
  }

  const protocol = targetUrl.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return NextResponse.json({ error: "Unsupported target protocol." }, { status: 400 });
  }

  const backendHost = toBackendHost();
  const targetHost = targetUrl.host.toLowerCase();
  if (!isAllowedTargetHost(targetHost, backendHost)) {
    return NextResponse.json({ error: "Target host is not allowed." }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    if (backendHost && isHostMatched(targetHost, backendHost)) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get<ArrayBuffer>(targetUrl.toString(), {
      responseType: "arraybuffer",
      headers,
      maxRedirects: 5,
    });

    const contentType = response.headers["content-type"] ?? "application/octet-stream";
    const contentDisposition = response.headers["content-disposition"] ?? "inline";
    const cacheControl = response.headers["cache-control"];

    const outgoingHeaders = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition,
    });
    if (cacheControl) {
      outgoingHeaders.set("Cache-Control", cacheControl);
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers: outgoingHeaders,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: `Fetch file failed (${error.response.status}).` },
        { status: error.response.status },
      );
    }

    return NextResponse.json({ error: "Failed to open document." }, { status: 500 });
  }
}
