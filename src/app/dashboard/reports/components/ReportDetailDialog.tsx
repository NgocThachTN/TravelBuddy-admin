"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchModerationReportById,
  fetchMyReportById,
  fetchReportById,
  fetchTripById,
} from "@/lib/api";
import type { ReportDetail, ReportListItem, TripDetail } from "@/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarClock,
  CarFront,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  RefreshCw,
  Route,
  Shield,
  Users,
  Wallet,
} from "lucide-react";

interface ReportDetailDialogProps {
  reportId: string | null;
  reportPreview?: ReportListItem | null;
  scope?: "admin" | "moderation" | "mine";
  onClose: () => void;
}

function toReportDetailFallback(report: ReportListItem): ReportDetail {
  return {
    ...report,
    evidenceNote: null,
    mediaAttachments: [],
    targetSnapshot: null,
    resolvedAction: null,
    resolvedActions: null,
    resolvedNote: null,
    updatedAt: null,
    strikeExpiresAt: null,
    targetDetail: null,
  };
}

function buildReporterName(
  report: Pick<
    ReportDetail,
    "reporterName" | "reporterFirstName" | "reporterLastName" | "reporterEmail"
  >,
): string {
  const full = [report.reporterFirstName, report.reporterLastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return report.reporterName || full || report.reporterEmail || "(Ẩn danh)";
}

function buildReporterInitials(
  report: Pick<
    ReportDetail,
    "reporterName" | "reporterFirstName" | "reporterLastName" | "reporterEmail"
  >,
): string {
  const source = buildReporterName(report);
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }

  return parts[0]?.slice(0, 2).toUpperCase() || "?";
}

function isTripTargetType(
  targetType: number | string | null | undefined,
): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 0;
  }
  return targetType === "Trip";
}

function isPostTargetType(
  targetType: number | string | null | undefined,
): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 2;
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

function parsePostTargetMetadata(
  raw: string | null | undefined,
): PostTargetMetadata | null {
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
  const labels = ["Hình ảnh", "Video", "Âm thanh", "Tệp", "Khác"] as const;
  if (value === null || value === undefined) {
    return "Khác";
  }
  if (typeof value === "number") {
    return labels[value] ?? `Loại ${value}`;
  }

  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case "image":
      return labels[0];
    case "video":
      return labels[1];
    case "audio":
      return labels[2];
    case "file":
      return labels[3];
    case "other":
      return labels[4];
    default:
      return value;
  }
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

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatDistance(distanceM: number | null | undefined): string {
  if (distanceM === null || distanceM === undefined || Number.isNaN(distanceM))
    return "-";
  return `${(distanceM / 1000).toFixed(1)} km`;
}

function tripMediaIsImage(
  mediaType: number | string | null | undefined,
  url?: string,
): boolean {
  if (typeof mediaType === "number") {
    return mediaType === 0;
  }
  const normalized = mediaType?.toString().trim().toLowerCase();
  return normalized === "image" || !!url?.match(/\.(png|jpg|jpeg|gif|webp)$/i);
}

export default function ReportDetailDialog({
  reportId,
  reportPreview = null,
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
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);

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
        if (reportPreview && reportPreview.reportId === reportIdValue) {
          setReport(toReportDetailFallback(reportPreview));
        }
        const fetcher =
          scope === "admin"
            ? fetchReportById
            : scope === "mine"
              ? fetchMyReportById
              : fetchModerationReportById;
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
  }, [reportId, reportPreview, scope, reloadKey]);

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
          err instanceof Error
            ? err.message
            : "Không thể tải chi tiết chuyến đi.",
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

  const reporterName = report ? buildReporterName(report) : "";
  const initials = report ? buildReporterInitials(report) : "?";
  const tripCheckpoints = [...(tripDetail?.checkpoints ?? [])].sort(
    (a, b) => a.sequenceNo - b.sequenceNo,
  );
  const tripMediaAttachments = [...(tripDetail?.mediaAttachments ?? [])].sort(
    (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999),
  );
  const reportMediaAttachments = [...(report?.mediaAttachments ?? [])].sort(
    (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999),
  );
  const tripCover = tripMediaAttachments.find((media) =>
    tripMediaIsImage(media.mediaType, media.mediaUrl),
  );

  const postMetadata = parsePostTargetMetadata(
    report?.targetDetail?.metadataJson,
  );
  const postMediaAttachments = postMetadata?.mediaAttachments ?? [];
  const resolvedActionValues = report
    ? report.resolvedActions && report.resolvedActions.length > 0
      ? report.resolvedActions
      : report.resolvedAction !== null && report.resolvedAction !== undefined
        ? [report.resolvedAction]
        : []
    : [];

  return (
    <>
      <Dialog
        open={!!reportId}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
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

          {error && !report && (
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

          {report && !loading && (
            <div className="space-y-5">
              {error && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {report.reporterAvatarUrl && (
                    <AvatarImage
                      src={report.reporterAvatarUrl}
                      alt={reporterName}
                    />
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
                  <p className="text-xs text-muted-foreground">
                    Loại đối tượng
                  </p>
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
                  <Badge variant="secondary">
                    {reportStatusLabel(report.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ưu tiên</p>
                  <p className="font-medium">
                    {reportPriorityLabel(report.priority)}
                  </p>
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
                <p className="mb-1 text-xs text-muted-foreground">
                  Lý do báo cáo
                </p>
                <p className="text-sm">
                  {report.reason?.displayName ||
                    report.reasonDisplayName ||
                    "-"}
                </p>
                {report.reasonText && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.reasonText}
                  </p>
                )}
              </div>

              {report.evidenceNote && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Bằng chứng
                  </p>
                  <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                    {report.evidenceNote}
                  </p>
                </div>
              )}

              {reportMediaAttachments.length > 0 && (
                <div className="space-y-2">
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Ảnh bằng chứng ({reportMediaAttachments.length})
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {reportMediaAttachments.map((media) => (
                      <button
                        key={media.mediaAttachmentId}
                        type="button"
                        className="overflow-hidden rounded-md border bg-muted/20 text-left"
                        onClick={() => setSelectedMediaUrl(media.mediaUrl)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={media.mediaUrl}
                          alt="Ảnh bằng chứng báo cáo"
                          className="aspect-square w-full object-cover transition hover:opacity-90"
                        />
                      </button>
                    ))}
                  </div>
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
                        <p className="font-medium">
                          {report.targetDetail.displayName}
                        </p>
                      </div>
                    )}
                    {report.targetDetail.status && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Trạng thái
                        </p>
                        <p className="font-medium">
                          {report.targetDetail.status}
                        </p>
                      </div>
                    )}
                    {report.targetDetail.ownerName && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Chủ sở hữu
                        </p>
                        <p className="font-medium">
                          {report.targetDetail.ownerName}
                        </p>
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
                <div className="overflow-hidden rounded-lg border bg-background">
                  <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
                    <div className="relative min-h-56 bg-muted">
                      {tripCover ? (
                        <button
                          type="button"
                          className="h-full w-full"
                          onClick={() =>
                            setSelectedMediaUrl(tripCover.mediaUrl)
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tripCover.mediaUrl}
                            alt={tripDetail?.title ?? "Chuyến đi"}
                            className="h-full min-h-56 w-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="flex h-full min-h-56 items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-9 w-9" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <Badge className="bg-background/90 text-foreground shadow-sm">
                          {tripDetail
                            ? tripStatusLabel(tripDetail.currentStatus)
                            : "Chuyến đi"}
                        </Badge>
                        {tripMediaAttachments.length > 0 && (
                          <Badge className="bg-background/90 text-foreground shadow-sm">
                            {tripMediaAttachments.length} media
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase text-muted-foreground">
                            Chi tiết chuyến đi bị báo cáo
                          </p>
                          <h3 className="mt-1 text-lg font-semibold leading-snug">
                            {tripDetail?.title ||
                              report.targetDetail?.displayName ||
                              "-"}
                          </h3>
                        </div>
                        {tripDetail?.tripId && (
                          <Button asChild size="sm" variant="outline">
                            <Link
                              href={`/dashboard/trips/${tripDetail.tripId}`}
                              target="_blank"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Mở chi tiết
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

                      {tripError && (
                        <p className="text-sm text-destructive">{tripError}</p>
                      )}

                      {tripDetail && !tripLoading && !tripError && (
                        <>
                          <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div className="rounded-md bg-muted/40 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                Chủ chuyến đi
                              </p>
                              <p className="mt-1 font-medium">
                                {getTripOwnerDisplayName(tripDetail)}
                              </p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5" />
                                Thành viên
                              </p>
                              <p className="mt-1 font-medium">
                                {tripDetail.participantCount}/
                                {tripDetail.maxParticipants ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                Thời gian
                              </p>
                              <p className="mt-1 font-medium">
                                {formatDateTime(tripDetail.startTime)}
                                {" - "}
                                {formatDateTime(tripDetail.endTime)}
                              </p>
                            </div>
                            <div className="rounded-md bg-muted/40 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Route className="h-3.5 w-3.5" />
                                Lộ trình
                              </p>
                              <p className="mt-1 font-medium">
                                {tripCheckpoints.length} điểm
                                {tripDetail.itinerary?.distanceM
                                  ? ` - ${formatDistance(tripDetail.itinerary.distanceM)}`
                                  : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {tripDetail.tripTypes.map((item) => (
                              <Badge key={item.tripTypeId} variant="outline">
                                {item.tripType || "Loại chuyến đi"}
                              </Badge>
                            ))}
                            {tripDetail.tripVehicles.map((item) => (
                              <Badge key={item.tripVehicleId} variant="outline">
                                <CarFront className="mr-1 h-3 w-3" />
                                {item.vehicleType || "Phương tiện"}
                              </Badge>
                            ))}
                            {tripDetail.depositAmount !== null && (
                              <Badge variant="outline">
                                <Wallet className="mr-1 h-3 w-3" />
                                Cọc {formatMoney(tripDetail.depositAmount)}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {tripDetail && !tripLoading && !tripError && (
                    <div className="space-y-4 border-t p-4">
                      {tripDetail.description && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Mô tả
                          </p>
                          <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                            {tripDetail.description}
                          </p>
                        </div>
                      )}

                      <div className="grid gap-3 md:grid-cols-2">
                        {tripDetail.rule && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              Quy định
                            </p>
                            <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                              {tripDetail.rule}
                            </p>
                          </div>
                        )}
                        {tripDetail.itemRequired && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                              Vật dụng cần mang
                            </p>
                            <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                              {tripDetail.itemRequired}
                            </p>
                          </div>
                        )}
                      </div>

                      {tripCheckpoints.length > 0 && (
                        <div>
                          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            Lộ trình ({tripCheckpoints.length} điểm)
                          </p>
                          <div className="grid gap-2 md:grid-cols-2">
                            {tripCheckpoints
                              .slice(0, 6)
                              .map((checkpoint, index) => (
                                <div
                                  key={checkpoint.tripCheckpointId}
                                  className="rounded-md border bg-muted/20 p-2 text-xs"
                                >
                                  <div className="flex items-start gap-2">
                                    <Badge
                                      variant="secondary"
                                      className="shrink-0 text-[10px]"
                                    >
                                      {index + 1}
                                    </Badge>
                                    <div className="min-w-0">
                                      <p className="font-medium">
                                        {checkpoint.locationName ||
                                          checkpoint.displayAddress ||
                                          `${checkpoint.lat}, ${checkpoint.lng}`}
                                      </p>
                                      {checkpoint.displayAddress &&
                                        checkpoint.locationName && (
                                          <p className="mt-0.5 text-muted-foreground">
                                            {checkpoint.displayAddress}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {tripMediaAttachments.length > 0 && (
                        <div>
                          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Hình ảnh & media ({tripMediaAttachments.length})
                          </p>
                          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            {tripMediaAttachments.slice(0, 8).map((media) => (
                              <button
                                key={media.mediaAttachmentId}
                                type="button"
                                className="overflow-hidden rounded-md border bg-muted/20 text-left"
                                onClick={() =>
                                  setSelectedMediaUrl(media.mediaUrl)
                                }
                              >
                                {tripMediaIsImage(
                                  media.mediaType,
                                  media.mediaUrl,
                                ) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={media.mediaUrl}
                                    alt="Media chuyến đi"
                                    className="aspect-video w-full object-cover transition hover:opacity-90"
                                  />
                                ) : (
                                  <div className="flex aspect-video items-center justify-center text-xs text-muted-foreground">
                                    {mediaTypeLabel(media.mediaType)}
                                  </div>
                                )}
                              </button>
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
                    Chi tiết bài viết bị báo cáo
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Tác giả</p>
                      <p className="font-medium">
                        {report.targetDetail?.ownerName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Trạng thái
                      </p>
                      <p className="font-medium">
                        {report.targetDetail?.status || "-"}
                      </p>
                    </div>
                    {(postMetadata?.lat !== undefined ||
                      postMetadata?.lng !== undefined) && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Toạ độ</p>
                        <p className="font-medium">
                          {postMetadata?.lat ?? "-"}, {postMetadata?.lng ?? "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  {report.targetDetail?.content && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Nội dung bài viết
                      </p>
                      <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-sm">
                        {report.targetDetail.content}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Tệp đính kèm ({postMediaAttachments.length})
                    </p>
                    {postMediaAttachments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Không có tệp đính kèm.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {postMediaAttachments.map((media, index) => {
                          const mediaUrl = media.mediaUrl?.trim();
                          const mediaLabel = mediaTypeLabel(media.mediaType);
                          const isImage =
                            mediaLabel === "Hình ảnh" ||
                            mediaUrl?.match(/\.(png|jpg|jpeg|gif|webp)$/i);

                          return (
                            <div
                              key={
                                media.mediaAttachmentId ||
                                `${mediaUrl}-${index}`
                              }
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
                                      Mở tệp
                                    </a>
                                  </div>
                                )
                              ) : (
                                <div className="flex aspect-video items-center justify-center text-xs text-muted-foreground">
                                  Không có đường dẫn tệp
                                </div>
                              )}
                              {media.isRemoved && (
                                <p className="border-t px-2 py-1 text-[11px] text-destructive">
                                  Tệp đã bị gỡ
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
                      <p className="text-xs text-muted-foreground">
                        Ngày xử lý
                      </p>
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
                      <p className="text-xs text-muted-foreground">
                        Điểm phạt hết hạn
                      </p>
                      <p className="text-sm">
                        {new Date(report.strikeExpiresAt).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedMediaUrl}
        onOpenChange={(open) => {
          if (!open) setSelectedMediaUrl(null);
        }}
      >
        <DialogContent className="max-w-[92vw] border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Xem ảnh</DialogTitle>
          {selectedMediaUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selectedMediaUrl}
              alt="Ảnh chi tiết"
              className="mx-auto max-h-[88vh] max-w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
