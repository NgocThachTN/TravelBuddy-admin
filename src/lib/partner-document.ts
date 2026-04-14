export type PartnerDocumentKind = "image" | "pdf" | "unknown";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "heic",
  "heif",
  "avif",
]);

function toExtension(url: string): string {
  const normalized = url.trim().split("#")[0].split("?")[0].toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === normalized.length - 1) {
    return "";
  }
  return normalized.slice(dotIndex + 1);
}

export function normalizePartnerDocumentUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const withoutQuotes = trimmed.replace(/^['"]+|['"]+$/g, "");
  const unescapedSlashes = withoutQuotes.replace(/\\\//g, "/");

  if (unescapedSlashes.startsWith("//")) {
    return `https:${unescapedSlashes}`;
  }

  if (/^http:\/\//i.test(unescapedSlashes)) {
    return unescapedSlashes.replace(/^http:\/\//i, "https://");
  }

  if (/^[a-z]+:\/\//i.test(unescapedSlashes)) {
    return unescapedSlashes;
  }

  if (/^res\.cloudinary\.com\//i.test(unescapedSlashes)) {
    return `https://${unescapedSlashes}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(unescapedSlashes)) {
    return `https://${unescapedSlashes}`;
  }

  return unescapedSlashes;
}

export function detectPartnerDocumentKind(
  url: string,
  mediaType?: string | null,
): PartnerDocumentKind {
  const extension = toExtension(url);
  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  if (extension === "pdf") {
    return "pdf";
  }

  const normalizedMediaType = mediaType?.trim().toLowerCase() ?? "";
  if (
    normalizedMediaType.includes("image") ||
    normalizedMediaType === "photo"
  ) {
    return "image";
  }

  if (
    normalizedMediaType.includes("pdf") ||
    normalizedMediaType.includes("application/pdf") ||
    normalizedMediaType === "file"
  ) {
    return "pdf";
  }

  return "unknown";
}

export function toPdfPreviewUrl(url: string): string {
  if (/\.pdf(?:$|[?#])/i.test(url)) {
    return url;
  }

  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}
