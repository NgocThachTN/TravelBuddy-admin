import { AxiosError } from "axios";

/**
 * Extract the most useful error message from an AxiosError.
 * Handles common backend formats: ASP.NET ProblemDetails, plain { message },
 * { errors: [...] }, { error: { message } }, and string bodies.
 */
export function extractApiError(
  err: unknown,
  fallback = "Lỗi máy chủ",
): { message: string; status: number; data: unknown } {
  if (!(err instanceof AxiosError) || !err.response) {
    const msg = err instanceof Error ? err.message : fallback;
    return { message: msg, status: 500, data: null };
  }

  const { status, data } = err.response;

  if (!data) {
    return { message: `HTTP ${status}`, status, data: null };
  }

  if (typeof data === "string") {
    return { message: data || fallback, status, data };
  }

  // ASP.NET ProblemDetails: { title, detail, errors }
  // Generic: { message }, { error: "..." }, { error: { message } }
  const msg =
    data.detail ??
    data.message ??
    (typeof data.error === "string" ? data.error : data.error?.message) ??
    data.title ??
    (Array.isArray(data.errors)
      ? data.errors.map((e: { message?: string }) => e.message ?? JSON.stringify(e)).join("; ")
      : null) ??
    (typeof data.errors === "object" && data.errors !== null
      ? Object.entries(data.errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("; ")
      : null) ??
    fallback;

  return { message: String(msg), status, data };
}

/**
 * Log full error detail to the server console and return a NextResponse-ready object.
 */
export function logAndExtract(
  err: unknown,
  context: string,
  fallback?: string,
) {
  const extracted = extractApiError(err, fallback);

  console.error(`[${context}] ${extracted.status} — ${extracted.message}`);
  if (extracted.data) {
    console.error(`[${context}] response body:`, JSON.stringify(extracted.data, null, 2));
  }

  return extracted;
}
