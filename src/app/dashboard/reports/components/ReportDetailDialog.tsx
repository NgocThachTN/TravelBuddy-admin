"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchModerationReportById,
  fetchReportById,
  fetchTripById,
} from "@/lib/api";
import type { ReportDetail, TripDetail } from "@/types";
import {
  reportPriorityLabel,
  reportStatusLabel,
  reportTargetTypeLabel,
  reportedPartyTypeLabel,
  resolvedActionsLabel,
  tripStatusLabel,
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

function isTripTargetType(targetType: number | string | null | undefined): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 0;
  }
  return targetType === "Trip";
}

function isPostTargetType(targetType: number | string | null | undefined): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 1;
  }
  return targetType === "Post";
}

interface PostMediaMetadataItem {
  mediaAttachmentId?: string;
  mediaUrl?: string;
  mediaType?: number | string;
  isRemoved?: boolean;
  sortOrder?: number | null;
}

interface PostTargetMetadata {
  mediaAttachments?: PostMediaMetadataItem[];
  lat?: number | null;
  lng?: number | null;
}

function parsePostTargetMetadata(raw: string | null | undefined): PostTargetMetadata | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PostTargetMetadata;
  } catch {
    return null;
  }
}

function mediaTypeLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "Khac";
  }
  if (typeof value === "number") {
    return (["Image", "Video", "Audio", "File", "Other"] as const)[value] ?? `Type ${value}`;
  }
  return value;
}

function getTripOwnerDisplayName(trip: TripDetail | null): string {
  if (!trip?.owner) {
    return "-";
  }

  const fullName = [trip.owner.lastName, trip.owner.firstName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || "-";
}

export default function ReportDetailDialog({
  reportId,
  scope = "admin",
  onClose,
}: ReportDetailDialogProps) {
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [tripDetail, setTripDetail] = useState<TripDetail | null>(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);

  useEffect(() => {
    const currentReportId = reportId;
    if (!currentReportId) {
      setReport(null);
      setTripDetail(null);
      setError(null);
      setTripError(null);
      return;
    }

    let active = true;

    async function load() {
      try {
        const reportIdValue = currentReportId;
        if (!reportIdValue) {
          return;
        }

        setLoading(true);
        setError(null);
        const fetcher =
          scope === "admin" ? fetchReportById : fetchModerationReportById;
        const result = await fetcher(reportIdValue);
        if (!active) {
          return;
        }
        setReport(result.data);
      } catch (err) {
        if (!active) {
          return;
        }
        setError(
          err instanceof Error ? err.message : "Không thể tải chi tiết báo cáo",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [reportId, scope, reloadKey]);

  useEffect(() => {
    if (!report || !isTripTargetType(report.targetType)) {
      setTripDetail(null);
      setTripError(null);
      setTripLoading(false);
      return;
    }

    const targetTripId = (
      report.targetDetail?.relatedTripId ??
      report.targetPk ??
      ""
    ).trim();

    if (!targetTripId) {
      setTripDetail(null);
      setTripError("Không tìm thấy mã chuyến đi trong báo cáo.");
      setTripLoading(false);
      return;
    }

    let active = true;

    async function loadTripDetail() {
      try {
        setTripLoading(true);
        setTripError(null);
        const result = await fetchTripById(targetTripId);
        if (!active) {
          return;
        }
        setTripDetail(result.data);
      } catch (err) {
        if (!active) {
          return;
        }
        setTripError(
          err instanceof Error ? err.message : "Không thể tải chi tiết chuyến đi.",
        );
      } finally {
        if (active) {
          setTripLoading(false);
        }
      }
    }

    loadTripDetail();
    return () => {
      active = false;
    };
  }, [report]);

  const reporterName = report
    ? report.reporterName ||
      [report.reporterFirstName, report.reporterLastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "(Ẩn danh)"
    : "";

  const initials = report
    ? (report.reporterFirstName?.[0] ?? "") +
        (report.reporterLastName?.[0] ?? "") || "?"
    : "?";

  const postMetadata = parsePostTargetMetadata(report?.targetDetail?.metadataJson);
  const postMediaAttachments = postMetadata?.mediaAttachments ?? [];
  const resolvedActionValues = report
    ? report.resolvedActions && report.resolvedActions.length > 0
      ? report.resolvedActions
      : report.resolvedAction !== null && report.resolvedAction !== undefined
        ? [report.resolvedAction]
        : []
    : [];

  return (
    <Dialog
      open={!!reportId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
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
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setReloadKey((x) => x + 1)}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Thử lại
            </Button>
          </div>
        )}

        {report && !loading && !error && (
          <div className="space-y-5">
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

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Loại đối tượng</p>
                <p className="font-medium">
                  {reportTargetTypeLabel(report.targetType)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mã đối tượng</p>
                <p className="break-all font-mono text-xs font-medium">
                  {report.targetPk}
                </p>
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
                <p className="font-medium">
                  {reportedPartyTypeLabel(report.reportedPartyType)}
                </p>
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

            <div>
              <p className="mb-1 text-xs text-muted-foreground">Lý do báo cáo</p>
              <p className="text-sm">
                {report.reason?.displayName || report.reasonDisplayName || "-"}
              </p>
              {report.reasonText && (
                <p className="mt-1 text-sm text-muted-foreground">{report.reasonText}</p>
              )}
            </div>

            {report.evidenceNote && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Bằng chứng</p>
                <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                  {report.evidenceNote}
                </p>
              </div>
            )}

            {report.targetDetail && (
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Thông tin đối tượng bị báo cáo
                </p>
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
                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-sm">
                      {report.targetDetail.content}
                    </p>
                  </div>
                )}
              </div>
            )}

            {isTripTargetType(report.targetType) && (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Chi tiết chuyến đi bị báo cáo
                  </p>
                  {tripDetail?.tripId && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/trips/${tripDetail.tripId}`} target="_blank">
                        Mở trang chi tiết
                      </Link>
                    </Button>
                  )}
                </div>

                {tripLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                )}

                {tripError && <p className="text-sm text-destructive">{tripError}</p>}

                {tripDetail && !tripLoading && !tripError && (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Tên chuyến đi</p>
                        <p className="font-medium">{tripDetail.title || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trạng thái</p>
                        <p className="font-medium">
                          {tripStatusLabel(tripDetail.currentStatus)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Chủ chuyến đi</p>
                        <p className="font-medium">
                          {getTripOwnerDisplayName(tripDetail)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Thành viên</p>
                        <p className="font-medium">
                          {tripDetail.participantCount}/{tripDetail.maxParticipants ?? "-"}
                        </p>
                      </div>
                    </div>

                    {(tripDetail.startTime || tripDetail.endTime) && (
                      <div className="rounded-md bg-muted p-2">
                        <p className="text-xs text-muted-foreground">Thời gian</p>
                        <p className="font-medium">
                          {tripDetail.startTime
                            ? new Date(tripDetail.startTime).toLocaleString("vi-VN")
                            : "-"}
                          {" → "}
                          {tripDetail.endTime
                            ? new Date(tripDetail.endTime).toLocaleString("vi-VN")
                            : "-"}
                        </p>
                      </div>
                    )}

                    {tripDetail.description && (
                      <div>
                        <p className="text-xs text-muted-foreground">Mô tả</p>
                        <p className="whitespace-pre-wrap rounded-md bg-muted p-2">
                          {tripDetail.description}
                        </p>
                      </div>
                    )}

                    {tripDetail.rule && (
                      <div>
                        <p className="text-xs text-muted-foreground">Quy định</p>
                        <p className="whitespace-pre-wrap rounded-md bg-muted p-2">
                          {tripDetail.rule}
                        </p>
                      </div>
                    )}

                    {tripDetail.checkpoints.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">Checkpoint</p>
                        <div className="space-y-1">
                          {tripDetail.checkpoints.slice(0, 5).map((checkpoint, index) => (
                            <p
                              key={checkpoint.tripCheckpointId}
                              className="rounded-md bg-muted px-2 py-1 text-xs"
                            >
                              {index + 1}.{" "}
                              {checkpoint.locationName ||
                                checkpoint.displayAddress ||
                                `${checkpoint.lat}, ${checkpoint.lng}`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isPostTargetType(report.targetType) && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Chi ti\u1ebft b\u00e0i vi\u1ebft b\u1ecb b\u00e1o c\u00e1o
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">T\u00e1c gi\u1ea3</p>
                    <p className="font-medium">
                      {report.targetDetail?.ownerName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tr\u1ea1ng th\u00e1i</p>
                    <p className="font-medium">
                      {report.targetDetail?.status || "-"}
                    </p>
                  </div>
                  {(postMetadata?.lat !== undefined || postMetadata?.lng !== undefined) && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">To\u1ea1 \u0111\u1ed9</p>
                      <p className="font-medium">
                        {postMetadata?.lat ?? "-"}, {postMetadata?.lng ?? "-"}
                      </p>
                    </div>
                  )}
                </div>

                {report.targetDetail?.content && (
                  <div>
                    <p className="text-xs text-muted-foreground">N\u1ed9i dung b\u00e0i vi\u1ebft</p>
                    <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-sm">
                      {report.targetDetail.content}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Media \u0111\u00ednh k\u00e8m ({postMediaAttachments.length})
                  </p>
                  {postMediaAttachments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Kh\u00f4ng c\u00f3 media \u0111\u00ednh k\u00e8m.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {postMediaAttachments.map((media, index) => {
                        const mediaUrl = media.mediaUrl?.trim();
                        const mediaLabel = mediaTypeLabel(media.mediaType);
                        const isImage =
                          mediaLabel === "Image" ||
                          mediaUrl?.match(/\.(png|jpg|jpeg|gif|webp)$/i);

                        return (
                          <div
                            key={media.mediaAttachmentId || `${mediaUrl}-${index}`}
                            className="overflow-hidden rounded-md border bg-muted/20"
                          >
                            {mediaUrl ? (
                              isImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={mediaUrl}
                                  alt={mediaLabel}
                                  className="aspect-video w-full object-cover"
                                />
                              ) : (
                                <div className="aspect-video p-2 text-xs text-muted-foreground">
                                  <p className="line-clamp-2">{mediaLabel}</p>
                                  <a
                                    href={mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary underline"
                                  >
                                    M\u1edf media
                                  </a>
                                </div>
                              )
                            ) : (
                              <div className="flex aspect-video items-center justify-center text-xs text-muted-foreground">
                                Kh\u00f4ng c\u00f3 URL media
                              </div>
                            )}
                            {media.isRemoved && (
                              <p className="border-t px-2 py-1 text-[11px] text-destructive">
                                Media \u0111\u00e3 b\u1ecb g\u1ee1
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {report.resolvedAt && (
              <div className="space-y-2 rounded-lg border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Kết quả xử lý
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Hành động</p>
                    <p className="font-medium">
                      {resolvedActionsLabel(resolvedActionValues)}
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


