"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h2 className="text-lg font-bold">Đã xảy ra lỗi</h2>
      <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
        {error.message || "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại."}
      </p>
      <Button onClick={reset} className="mt-6">
        <RefreshCw className="mr-2 h-4 w-4" />
        Thử lại
      </Button>
    </div>
  );
}
