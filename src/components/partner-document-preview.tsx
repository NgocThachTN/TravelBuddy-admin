"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  detectPartnerDocumentKind,
  normalizePartnerDocumentUrl,
} from "@/lib/partner-document";

export type PartnerDocumentItem = {
  url?: string | null;
  mediaType?: string | null;
};

function buildDocumentProxyUrl(url: string) {
  return `/api/admin/partners/documents/open?url=${encodeURIComponent(url)}`;
}

function FilePreview({
  title,
  item,
  emptyText,
}: {
  title: string;
  item?: PartnerDocumentItem;
  emptyText: string;
}) {
  const normalizedUrl = normalizePartnerDocumentUrl(item?.url);
  const kind = normalizedUrl
    ? detectPartnerDocumentKind(normalizedUrl, item?.mediaType)
    : "unknown";
  const proxiedUrl = normalizedUrl ? buildDocumentProxyUrl(normalizedUrl) : null;

  const previewFrameClass =
    "relative w-full overflow-hidden rounded-md border bg-muted/20 aspect-[16/9]";

  if (!proxiedUrl) {
    return (
      <div className="space-y-3">
        <Label>{title}</Label>
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label>{title}</Label>
      <div className="space-y-3">
        {kind === "image" && (
          <div className={previewFrameClass}>
            <Image
              src={proxiedUrl}
              alt={title}
              fill
              unoptimized
              className="object-contain p-2"
            />
          </div>
        )}
        {kind === "unknown" && (
          <div className={`${previewFrameClass} flex items-center justify-center border-dashed p-3 text-sm text-muted-foreground`}>
            Tệp này không hỗ trợ xem nhanh trực tiếp.
          </div>
        )}
        <div className="grid gap-2">
          <Button asChild variant="outline" className="w-full">
            <a href={proxiedUrl} target="_blank" rel="noreferrer">
              Mở tệp trong tab mới
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DocumentGroupPreview({
  title,
  documents,
  emptyText,
}: {
  title: string;
  documents: PartnerDocumentItem[];
  emptyText: string;
}) {
  if (documents.length === 0) {
    return (
      <div className="space-y-3">
        <Label>{title}</Label>
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((item, index) => (
        <FilePreview
          key={`${title}-${index}-${item.url ?? "missing"}`}
          title={`${title} ${documents.length > 1 ? `#${index + 1}` : ""}`.trim()}
          item={item}
          emptyText={emptyText}
        />
      ))}
    </div>
  );
}
