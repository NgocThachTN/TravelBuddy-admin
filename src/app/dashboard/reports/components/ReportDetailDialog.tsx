"use client";

import { useEffect, useState } from "react";
import { fetchReportById, fetchModerationReportById } from "@/lib/api";
import type { ReportDetail } from "@/types";
import {
  reportStatusLabel,
  reportTargetTypeLabel,
  reportPriorityLabel,
  reportedPartyTypeLabel,
  resolvedActionLabel,
} from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";

interface ReportDetailDialogProps {
  reportId: string | null;
  scope?: "admin" | "moderation";
  onClose: () => void;
}

export default function ReportDetailDialog({ reportId, scope = "admin", onClose }: ReportDetailDialogProps) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      return;
    }

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const fetcher = scope === "admin" ? fetchReportById : fetchModerationReportById;
        const result = await fetcher(reportId!);
        setReport(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể tải chi tiết báo cáo");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [reportId, scope]);

  const reporterName = report
    ? (report.reporterName
      || [report.reporterFirstName, report.reporterLastName].filter(Boolean).join(" ").trim()
      || "(Ẩn danh)")
    : "";

  const initials = report
    ? (report.reporterFirstName?.[0] ?? "") + (report.reporterLastName?.[0] ?? "") || "?"
    : "?";

  return (
    <Dialog open={!!reportId} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết báo cáo</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => reportId && setReport(null)}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Thử lại
            </Button>
          </div>
        )}

        {report && !loading && !error && (
          <div className="space-y-5">
            {/* Reporter */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {report.reporterAvatarUrl && (
                  <AvatarImage src={report.reporterAvatarUrl} alt={reporterName} />
                )}
                <AvatarFallback className="text-xs font-semibold">
                  {initials.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{reporterName}</p>
                <p className="text-xs text-muted-foreground">Người báo cáo</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Loại đối tượng</p>
                <p className="font-medium">{reportTargetTypeLabel(report.targetType)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mã đối tượng</p>
                <p className="font-medium font-mono text-xs break-all">{report.targetPk}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Trạng thái</p>
                <Badge variant="secondary">{reportStatusLabel(report.status)}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ưu tiên</p>
                <p className="font-medium">{reportPriorityLabel(report.priority)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bên bị tố cáo</p>
                <p className="font-medium">{reportedPartyTypeLabel(report.reportedPartyType)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="font-medium">
                  {new Date(report.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {report.assignedToName && (
                <div>
                  <p className="text-xs text-muted-foreground">Người xử lý</p>
                  <p className="font-medium">{report.assignedToName}</p>
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Lý do báo cáo</p>
              <p className="text-sm">
                {report.reason?.displayName || report.reasonDisplayName || "—"}
              </p>
              {report.reasonText && (
                <p className="mt-1 text-sm text-muted-foreground">{report.reasonText}</p>
              )}
            </div>

            {/* Evidence */}
            {report.evidenceNote && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bằng chứng</p>
                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3">
                  {report.evidenceNote}
                </p>
              </div>
            )}

            {/* Target Detail */}
            {report.targetDetail && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Thông tin đối tượng bị báo cáo</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {report.targetDetail.displayName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Tên</p>
                      <p className="font-medium">{report.targetDetail.displayName}</p>
                    </div>
                  )}
                  {report.targetDetail.status && (
                    <div>
                      <p className="text-xs text-muted-foreground">Trạng thái</p>
                      <p className="font-medium">{report.targetDetail.status}</p>
                    </div>
                  )}
                  {report.targetDetail.ownerName && (
                    <div>
                      <p className="text-xs text-muted-foreground">Chủ sở hữu</p>
                      <p className="font-medium">{report.targetDetail.ownerName}</p>
                    </div>
                  )}
                </div>
                {report.targetDetail.content && (
                  <div>
                    <p className="text-xs text-muted-foreground">Nội dung</p>
                    <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-2 mt-1">
                      {report.targetDetail.content}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Resolution */}
            {report.resolvedAt && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Kết quả xử lý</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Hành động</p>
                    <p className="font-medium">
                      {resolvedActionLabel(report.resolvedAction)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày xử lý</p>
                    <p className="font-medium">
                      {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
                {report.resolvedNote && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ghi chú</p>
                    <p className="text-sm">{report.resolvedNote}</p>
                  </div>
                )}
                {report.strikeExpiresAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Strike hết hạn</p>
                    <p className="text-sm">
                      {new Date(report.strikeExpiresAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
