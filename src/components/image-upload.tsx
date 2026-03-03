"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Chỉ chấp nhận file ảnh");
        return;
      }
      if (file.size > MAX_SIZE) {
        setError("Ảnh quá lớn (tối đa 2 MB)");
        return;
      }

      try {
        setError(null);
        setUploading(true);

        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Upload thất bại");
        }

        onChange(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload thất bại");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onChange],
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  if (value) {
    return (
      <div className={cn("relative group min-w-0", className)}>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Icon preview"
            className="h-12 w-12 shrink-0 rounded-md border object-contain bg-white"
          />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground break-all">
            {value}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          (disabled || uploading) && "pointer-events-none opacity-50",
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Đang tải lên...</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Nhấn hoặc kéo thả ảnh vào đây
            </span>
            <span className="text-[10px] text-muted-foreground/60">
              PNG, JPG, WebP, SVG, GIF — tối đa 2 MB
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />

      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
