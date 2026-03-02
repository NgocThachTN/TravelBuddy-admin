import Link from "next/link";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        {/* Status */}
        <p className="text-sm font-semibold uppercase tracking-widest text-destructive mb-2">
          403 — Không có quyền truy cập
        </p>

        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Truy cập bị từ chối
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị
          viên hoặc quay lại trang chủ.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang tổng quan
          </Link>
        </div>
      </div>
    </div>
  );
}
