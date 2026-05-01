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
  reportStatusLabel,
  reportTargetTypeLabel,
  reportedPartyTypeLabel,
  resolvedActionsLabel,
  tripStatusLabel,
} from "@/types";
import {
  tripTypeLabelVi,
  vehicleTypeLabelVi,
} from "@/app/dashboard/moderation/components/trip-enum-labels";
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
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  LockKeyhole,
  MapPin,
  RefreshCw,
  Route,
  Shield,
  UserRoundCheck,
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

function isUserTargetType(
  targetType: number | string | null | undefined,
): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 9;
  }
  return targetType === "User";
}

function isSocialCheckpointTargetType(
  targetType: number | string | null | undefined,
): boolean {
  if (targetType === null || targetType === undefined) {
    return false;
  }
  if (typeof targetType === "number") {
    return targetType === 8;
  }
  return targetType === "SocialCheckpoint";
}

interface PostMediaMetadataItem {
  mediaAttachmentId?: string;
  mediaUrl?: string;
  mediaType?: number | string;
  isRemoved?: boolean;
  sortOrder?: number | null;
  capturedAt?: string | null;
  createdAt?: string | null;
  meta?: string | null;
}

interface PostTargetMetadata {
  mediaAttachments?: PostMediaMetadataItem[];
  lat?: number | null;
  lng?: number | null;
}

interface UserTargetMetadata {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
  isEmailVerified?: boolean;
  phone?: string | null;
  isPhoneVerified?: boolean;
  gender?: string | null;
  dateOfBirth?: string | null;
  relativePhone?: string | null;
  totalTripCount?: number | null;
  completedTripCount?: number | null;
  failedTripCount?: number | null;
  experienceLevel?: string | null;
  verifiedLevel?: string | null;
  role?: string | null;
  isLocked?: boolean;
  isNeedUpdateProfile?: boolean;
  userCreatedAt?: string | null;
  userUpdatedAt?: string | null;
  profileCreatedAt?: string | null;
  profileUpdatedAt?: string | null;
}

interface SocialCheckpointContributionMetadata {
  socialCheckpointContributionId?: string;
  contributorUserId?: string;
  contributorName?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  mediaAttachments?: PostMediaMetadataItem[];
}

interface SocialCheckpointTargetMetadata {
  lat?: number | string | null;
  lng?: number | string | null;
  checkpointType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  contributionCount?: number | null;
  contributorCount?: number | null;
  mediaAttachments?: PostMediaMetadataItem[];
  contributions?: SocialCheckpointContributionMetadata[];
}

function recordValue(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return source[key];
    }
  }
  return undefined;
}

function stringValue(
  source: Record<string, unknown>,
  ...keys: string[]
): string | null {
  const value = recordValue(source, ...keys);
  return typeof value === "string" && value.trim().length > 0
    ? value
    : null;
}

function numberValue(
  source: Record<string, unknown>,
  ...keys: string[]
): number | null {
  const value = recordValue(source, ...keys);
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function booleanValue(
  source: Record<string, unknown>,
  ...keys: string[]
): boolean | undefined {
  const value = recordValue(source, ...keys);
  return typeof value === "boolean" ? value : undefined;
}

function mediaTypeValue(
  source: Record<string, unknown>,
): number | string | undefined {
  const value = recordValue(source, "mediaType", "MediaType");
  return typeof value === "number" || typeof value === "string"
    ? value
    : undefined;
}

function normalizeMediaMetadata(raw: unknown): PostMediaMetadataItem | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const source = raw as Record<string, unknown>;
  return {
    mediaAttachmentId:
      stringValue(source, "mediaAttachmentId", "MediaAttachmentId") ??
      undefined,
    mediaUrl: stringValue(source, "mediaUrl", "MediaUrl") ?? undefined,
    mediaType: mediaTypeValue(source),
    isRemoved: booleanValue(source, "isRemoved", "IsRemoved"),
    sortOrder: numberValue(source, "sortOrder", "SortOrder"),
    capturedAt: stringValue(source, "capturedAt", "CapturedAt"),
    createdAt: stringValue(source, "createdAt", "CreatedAt"),
    meta: stringValue(source, "meta", "Meta"),
  };
}

function normalizeMediaMetadataArray(raw: unknown): PostMediaMetadataItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map(normalizeMediaMetadata)
    .filter((item): item is PostMediaMetadataItem => item !== null);
}

function parsePostTargetMetadata(
  raw: string | null | undefined,
): PostTargetMetadata | null {
  if (!raw) {
    return null;
  }

  try {
    const source = JSON.parse(raw) as Record<string, unknown>;
    return {
      lat: numberValue(source, "lat", "Lat"),
      lng: numberValue(source, "lng", "Lng"),
      mediaAttachments: normalizeMediaMetadataArray(
        recordValue(source, "mediaAttachments", "MediaAttachments"),
      ),
    };
  } catch {
    return null;
  }
}

function parseUserTargetMetadata(
  raw: string | null | undefined,
): UserTargetMetadata | null {
  if (!raw) {
    return null;
  }

  try {
    const source = JSON.parse(raw) as Record<string, unknown>;
    return {
      username: stringValue(source, "username", "Username"),
      firstName: stringValue(source, "firstName", "FirstName"),
      lastName: stringValue(source, "lastName", "LastName"),
      avatarUrl: stringValue(source, "avatarUrl", "AvatarUrl"),
      email: stringValue(source, "email", "Email"),
      isEmailVerified: booleanValue(source, "isEmailVerified", "IsEmailVerified"),
      phone: stringValue(source, "phone", "Phone"),
      isPhoneVerified: booleanValue(source, "isPhoneVerified", "IsPhoneVerified"),
      gender: stringValue(source, "gender", "Gender"),
      dateOfBirth: stringValue(source, "dateOfBirth", "DateOfBirth"),
      relativePhone: stringValue(source, "relativePhone", "RelativePhone"),
      totalTripCount: numberValue(source, "totalTripCount", "TotalTripCount"),
      completedTripCount: numberValue(
        source,
        "completedTripCount",
        "CompletedTripCount",
      ),
      failedTripCount: numberValue(source, "failedTripCount", "FailedTripCount"),
      experienceLevel: stringValue(source, "experienceLevel", "ExperienceLevel"),
      verifiedLevel: stringValue(source, "verifiedLevel", "VerifiedLevel"),
      role: stringValue(source, "role", "Role"),
      isLocked: booleanValue(source, "isLocked", "IsLocked"),
      isNeedUpdateProfile: booleanValue(
        source,
        "isNeedUpdateProfile",
        "IsNeedUpdateProfile",
      ),
      userCreatedAt: stringValue(source, "userCreatedAt", "UserCreatedAt"),
      userUpdatedAt: stringValue(source, "userUpdatedAt", "UserUpdatedAt"),
      profileCreatedAt: stringValue(source, "profileCreatedAt", "ProfileCreatedAt"),
      profileUpdatedAt: stringValue(source, "profileUpdatedAt", "ProfileUpdatedAt"),
    };
  } catch {
    return null;
  }
}

function parseSocialCheckpointTargetMetadata(
  raw: string | null | undefined,
): SocialCheckpointTargetMetadata | null {
  if (!raw) {
    return null;
  }

  try {
    const source = JSON.parse(raw) as Record<string, unknown>;
    const rawContributions = recordValue(source, "contributions", "Contributions");
    const contributions = Array.isArray(rawContributions)
      ? rawContributions
          .filter(
            (item): item is Record<string, unknown> =>
              !!item && typeof item === "object" && !Array.isArray(item),
          )
          .map((item) => ({
            socialCheckpointContributionId:
              stringValue(
                item,
                "socialCheckpointContributionId",
                "SocialCheckpointContributionId",
              ) ?? undefined,
            contributorUserId:
              stringValue(item, "contributorUserId", "ContributorUserId") ??
              undefined,
            contributorName: stringValue(item, "contributorName", "ContributorName"),
            description: stringValue(item, "description", "Description"),
            createdAt: stringValue(item, "createdAt", "CreatedAt"),
            updatedAt: stringValue(item, "updatedAt", "UpdatedAt"),
            mediaAttachments: normalizeMediaMetadataArray(
              recordValue(item, "mediaAttachments", "MediaAttachments"),
            ),
          }))
      : [];

    return {
      lat: numberValue(source, "lat", "Lat"),
      lng: numberValue(source, "lng", "Lng"),
      checkpointType: stringValue(source, "checkpointType", "CheckpointType"),
      createdAt: stringValue(source, "createdAt", "CreatedAt"),
      updatedAt: stringValue(source, "updatedAt", "UpdatedAt"),
      contributionCount: numberValue(
        source,
        "contributionCount",
        "ContributionCount",
      ),
      contributorCount: numberValue(source, "contributorCount", "ContributorCount"),
      mediaAttachments: normalizeMediaMetadataArray(
        recordValue(source, "mediaAttachments", "MediaAttachments"),
      ),
      contributions,
    };
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

function formatBoolean(value: boolean | undefined): string {
  if (value === undefined) return "-";
  return value ? "Có" : "Không";
}

function buildTargetUserInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || "?";
}

function formatCoordinate(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(6) : "-";
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
  const userMetadata = parseUserTargetMetadata(
    report?.targetDetail?.metadataJson,
  );
  const targetUserName =
    report?.targetDetail?.displayName ||
    [userMetadata?.lastName, userMetadata?.firstName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    userMetadata?.username ||
    "Người dùng";
  const targetUserInitials = buildTargetUserInitials(targetUserName);
  const wideDetailDialog =
    !!report &&
    (isUserTargetType(report.targetType) ||
      isTripTargetType(report.targetType) ||
      isSocialCheckpointTargetType(report.targetType));
  const socialCheckpointMetadata = parseSocialCheckpointTargetMetadata(
    report?.targetDetail?.metadataJson,
  );
  const socialCheckpointMediaAttachments =
    socialCheckpointMetadata?.mediaAttachments ?? [];
  const socialCheckpointContributions =
    socialCheckpointMetadata?.contributions ?? [];
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
        <DialogContent
          className={`max-h-[90vh] gap-0 overflow-hidden p-0 ${
            wideDetailDialog
              ? "!w-[min(1180px,calc(100vw-2rem))] !max-w-none sm:!max-w-none"
              : "!w-[min(960px,calc(100vw-2rem))] !max-w-none sm:!max-w-none"
          }`}
        >
          <DialogHeader className="border-b bg-muted/30 px-6 py-5 pr-14">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-xl font-bold text-foreground">Chi tiết báo cáo</DialogTitle>
              {report && (
                <Badge
                  variant="secondary"
                  className={`px-3 py-1 text-sm font-semibold shadow-sm ${
                    report.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    report.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400' : ''
                  }`}
                >
                  {reportStatusLabel(report.status)}
                </Badge>
              )}
            </div>
            {report && (
              <p className="mt-1 text-sm text-muted-foreground text-left">
                Mã báo cáo: <span className="font-mono text-xs">{report.reportId}</span>
              </p>
            )}
          </DialogHeader>

          {loading && (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && !report && (
            <div className="flex flex-col items-center p-8">
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
            <div className="max-h-[calc(90vh-5.25rem)] overflow-y-auto p-5">
              {error && (
                <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  {error}
                </div>
              )}
              <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
                {/* Cột trái: Thông tin chung của báo cáo */}
                <aside className="flex flex-col gap-5 lg:sticky lg:top-0 lg:self-start">
                  {/* Người báo cáo */}
                  <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                    <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <UserRoundCheck className="h-4 w-4" />
                      Người báo cáo
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border shadow-sm">
                        {report.reporterAvatarUrl && (
                          <AvatarImage
                            src={report.reporterAvatarUrl}
                            alt={reporterName}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-primary/5 text-sm font-semibold text-primary">
                          {initials.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-foreground">
                          {reporterName}
                        </p>
                        <p className="truncate text-sm font-medium text-muted-foreground">
                          {report.reporterEmail || "Người báo cáo ẩn danh"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thông tin tổng quan báo cáo */}
                  <div className="rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                    <div className="border-b bg-muted/20 px-5 py-3">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Tóm tắt thông tin
                      </p>
                    </div>
                    <div className="flex flex-col divide-y">
                      <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Loại bị báo cáo</span>
                        <span className="text-sm font-semibold text-foreground text-right">{reportTargetTypeLabel(report.targetType)}</span>
                      </div>
                      <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-muted-foreground">ID bị báo cáo</span>
                        <span className="break-all font-mono text-xs font-medium text-foreground text-right">{report.targetPk}</span>
                      </div>
                      <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Luật vi phạm</span>
                        <span className="text-sm font-semibold text-foreground text-right">{reportedPartyTypeLabel(report.reportedPartyType)}</span>
                      </div>
                      <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Thời gian tạo</span>
                        <span className="text-sm font-medium text-foreground text-right">{new Date(report.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                      {report.assignedToName && (
                        <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Người xử lý</span>
                          <span className="text-sm font-semibold text-primary text-right">{report.assignedToName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lý do & Bằng chứng */}
                  <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                    <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Lý do & Nội dung
                    </p>
                    <div className="rounded-lg border-l-4 border-l-amber-400 bg-amber-50/50 p-4 dark:bg-amber-500/10">
                      <p className="text-base font-bold text-foreground">
                        {report.reason?.displayName || report.reasonDisplayName || "Khác / Không rõ"}
                      </p>
                      {report.reasonText && (
                        <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-muted-foreground">
                          {report.reasonText}
                        </p>
                      )}
                    </div>
                  </div>

                  {report.evidenceNote && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Trình bày bằng chứng
                      </p>
                      <div className="rounded-lg bg-muted/30 p-4">
                        <p className="whitespace-pre-wrap text-sm font-medium text-muted-foreground">
                          {report.evidenceNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {reportMediaAttachments.length > 0 && (
                    <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                      <p className="mb-4 flex items-center justify-between text-xs font-bold tracking-wider text-muted-foreground">
                        <span className="flex items-center gap-2 uppercase">
                          <ImageIcon className="h-4 w-4" />
                          Ảnh đính kèm
                        </span>
                        <Badge variant="secondary" className="px-2 py-0">
                          {reportMediaAttachments.length}
                        </Badge>
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {reportMediaAttachments.map((media) => (
                          <button
                            key={media.mediaAttachmentId}
                            type="button"
                            className="group relative overflow-hidden rounded-lg border bg-muted/30 text-left shadow-sm"
                            onClick={() => setSelectedMediaUrl(media.mediaUrl)}
                          >
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                              <ImageIcon className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={media.mediaUrl}
                              alt="Ảnh bằng chứng báo cáo"
                              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>

                <div className="flex min-w-0 flex-col gap-6">

              {report.targetDetail && !isUserTargetType(report.targetType) && !isTripTargetType(report.targetType) && (
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

              {isUserTargetType(report.targetType) && report.targetDetail && (
                <div className="overflow-hidden rounded-xl border bg-background shadow-sm transition-shadow hover:shadow-md">
                  <div className="border-b bg-gradient-to-r from-muted/50 to-background p-6">
                    <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <UserRoundCheck className="h-4 w-4" />
                      Chi tiết hồ sơ bị báo cáo
                    </p>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-5">
                        <Avatar className="h-24 w-24 border-2 border-background bg-muted/50 text-2xl shadow-sm">
                          {userMetadata?.avatarUrl && (
                            <AvatarImage
                              src={userMetadata.avatarUrl}
                              alt={targetUserName}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="text-2xl font-bold tracking-widest text-primary">
                            {targetUserInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="text-2xl font-black tracking-tight text-foreground">
                            {targetUserName}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-muted-foreground">
                            {userMetadata?.username
                              ? `@${userMetadata.username}`
                              : report.targetDetail.targetId}
                          </p>
                          {report.targetDetail.content && (
                            <p className="mt-3 max-w-2xl whitespace-pre-wrap rounded-md bg-muted/30 p-3 text-sm font-medium italic text-muted-foreground border-l-2 border-primary/50">
                              &quot;{report.targetDetail.content}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant={
                            report.targetDetail.status === "Locked"
                              ? "destructive"
                              : "secondary"
                          }
                          className="px-3 py-1.5 text-sm font-semibold shadow-sm"
                        >
                          {report.targetDetail.status || "-"}
                        </Badge>
                        <Badge variant="outline" className="bg-muted/30 px-3 py-1.5 text-sm font-semibold">
                          {userMetadata?.role || "User"}
                        </Badge>
                        {userMetadata?.verifiedLevel && userMetadata.verifiedLevel !== "None" && userMetadata.verifiedLevel !== "-" && (
                          <Badge
                            variant="outline"
                            className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 text-sm font-semibold"
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Xác minh {userMetadata.verifiedLevel}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-3">
                    {/* Basic Info */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground border-b pb-3">
                        Thông tin cơ bản
                      </p>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Họ</span>
                          <span className="font-semibold text-foreground">{userMetadata?.lastName || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Tên</span>
                          <span className="font-semibold text-foreground">{userMetadata?.firstName || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Giới tính</span>
                          <span className="font-semibold text-foreground">{userMetadata?.gender || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Ngày sinh</span>
                          <span className="font-semibold text-foreground">{userMetadata?.dateOfBirth || "-"}</span>
                        </div>
                        {userMetadata?.verifiedLevel && userMetadata.verifiedLevel !== "None" && userMetadata.verifiedLevel !== "-" && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Cấp xác minh</span>
                          <span className="font-semibold text-foreground">{userMetadata?.verifiedLevel}</span>
                        </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground border-b pb-3">
                        Liên hệ
                      </p>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Email</span>
                          <span className="truncate pl-4 font-semibold text-foreground max-w-[150px]" title={userMetadata?.email || "-"}>{userMetadata?.email || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Xác minh Email</span>
                          <Badge variant="outline" className={`h-6 ${userMetadata?.isEmailVerified ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'bg-muted pt-0 pb-0'}`}>
                            {formatBoolean(userMetadata?.isEmailVerified)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Số điện thoại</span>
                          <span className="font-semibold text-foreground">{userMetadata?.phone || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">Xác minh SĐT</span>
                          <Badge variant="outline" className={`h-6 ${userMetadata?.isPhoneVerified ? 'border-blue-200 bg-blue-50 text-blue-600' : 'bg-muted pt-0 pb-0'}`}>
                            {formatBoolean(userMetadata?.isPhoneVerified)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-muted-foreground">SĐT người thân</span>
                          <span className="font-semibold text-foreground">{userMetadata?.relativePhone || "-"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trip Activity */}
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground border-b pb-3">
                        Hoạt động chuyến đi
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-center items-center">
                          <p className="text-2xl font-black text-foreground">
                            {userMetadata?.totalTripCount ?? 0}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            Tổng
                          </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-center items-center">
                          <p className="text-2xl font-black text-foreground">
                            {userMetadata?.completedTripCount ?? 0}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            Hoàn tất
                          </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 p-3 flex flex-col justify-center items-center">
                          <p className="text-2xl font-black text-foreground">
                            {userMetadata?.failedTripCount ?? 0}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                            Thất bại
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 rounded-lg border bg-muted/20 p-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">
                          Cấp kinh nghiệm
                        </span>
                        <Badge variant="secondary">
                          {userMetadata?.experienceLevel || "-"}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-md border bg-background p-5 md:col-span-2 xl:col-span-3">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            Tài khoản và định danh
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Thông tin trạng thái, cấp độ xác minh và thời điểm cập nhật
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Cột 1: Thông tin tài khoản */}
                        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                          <div className="border-b pb-3">
                            <h4 className="text-sm font-semibold">Thông tin tài khoản</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <LockKeyhole className="h-4 w-4" />
                                Trạng thái khóa
                              </span>
                              <Badge
                                variant={userMetadata?.isLocked ? "destructive" : "outline"}
                                className={!userMetadata?.isLocked ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : ""}
                              >
                                {userMetadata?.isLocked ? "Đang bị khóa" : "Hoạt động"}
                              </Badge>
                            </div>
                            {userMetadata?.verifiedLevel && userMetadata.verifiedLevel !== "None" && userMetadata.verifiedLevel !== "-" && (
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4" />
                                Cấp xác minh
                              </span>
                              <span className="text-sm font-semibold text-foreground">
                                {userMetadata?.verifiedLevel}
                              </span>
                            </div>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                Ngày tạo tài khoản
                              </span>
                              <span className="text-sm font-medium">
                                {formatDateTime(userMetadata?.userCreatedAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                Cập nhật lần cuối
                              </span>
                              <span className="text-sm font-medium">
                                {formatDateTime(userMetadata?.userUpdatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cột 2: Hồ sơ cá nhân */}
                        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
                          <div className="border-b pb-3">
                            <h4 className="text-sm font-semibold">Hồ sơ cá nhân</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <UserRoundCheck className="h-4 w-4" />
                                Tình trạng hồ sơ
                              </span>
                              <Badge
                                variant={userMetadata?.isNeedUpdateProfile ? "secondary" : "outline"}
                                className={!userMetadata?.isNeedUpdateProfile ? "border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"}
                              >
                                {userMetadata?.isNeedUpdateProfile ? "Cần cập nhật" : "Đã đầy đủ"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                Ngày tạo hồ sơ
                              </span>
                              <span className="text-sm font-medium">
                                {formatDateTime(userMetadata?.profileCreatedAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                <CalendarClock className="h-4 w-4" />
                                Cập nhật lần cuối
                              </span>
                              <span className="text-sm font-medium">
                                {formatDateTime(userMetadata?.profileUpdatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isTripTargetType(report.targetType) && (
                <div className="overflow-hidden rounded-lg border bg-background">
                  <div>
                    <div className="relative aspect-[16/7] min-h-72 bg-muted">
                      {tripCover ? (
                        <button
                          type="button"
                          className="group h-full w-full overflow-hidden"
                          onClick={() =>
                            setSelectedMediaUrl(tripCover.mediaUrl)
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tripCover.mediaUrl}
                            alt={tripDetail?.title ?? "Chuyến đi"}
                            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                            <ImageIcon className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
                          </span>
                        </button>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge className="bg-background/90 px-3 py-1 text-foreground shadow-sm backdrop-blur">
                          {tripDetail
                            ? tripStatusLabel(tripDetail.currentStatus)
                            : "Chuyến đi"}
                        </Badge>
                        {tripMediaAttachments.length > 0 && (
                          <Badge className="bg-background/90 px-3 py-1 text-foreground shadow-sm backdrop-blur">
                            {tripMediaAttachments.length} ảnh
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                            <Route className="h-4 w-4" />
                            Chi tiết chuyến đi bị báo cáo
                          </p>
                          <h3 className="mt-2 text-2xl font-bold leading-snug">
                            {tripDetail?.title ||
                              report.targetDetail?.displayName ||
                              "Chuyến đi không xác định"}
                          </h3>
                        </div>
                        {tripDetail?.tripId && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="shrink-0"
                          >
                            <Link
                              href={`/dashboard/trips/${tripDetail.tripId}`}
                              target="_blank"
                            >
                              <ExternalLink className="mr-2 h-3.5 w-3.5" />
                              Xem chi tiết
                            </Link>
                          </Button>
                        )}
                      </div>

                      {tripLoading && (
                        <div className="space-y-3">
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-20 w-full" />
                        </div>
                      )}

                      {tripError && (
                        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                          {tripError}
                        </div>
                      )}

                      {tripDetail && !tripLoading && !tripError && (
                        <>
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-md border bg-muted/20 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                Chủ chuyến đi
                              </p>
                              <p className="mt-1 text-base font-semibold">
                                {getTripOwnerDisplayName(tripDetail)}
                              </p>
                            </div>
                            <div className="rounded-md border bg-muted/20 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5" />
                                Thành viên
                              </p>
                              <p className="mt-1 text-base font-semibold">
                                {tripDetail.participantCount}/
                                {tripDetail.maxParticipants ?? "-"}
                              </p>
                            </div>
                            <div className="rounded-md border bg-muted/20 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                Bắt đầu
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {formatDateTime(tripDetail.startTime)}
                              </p>
                            </div>
                            <div className="rounded-md border bg-muted/20 p-3">
                              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CalendarClock className="h-3.5 w-3.5" />
                                Kết thúc
                              </p>
                              <p className="mt-1 text-sm font-semibold">
                                {formatDateTime(tripDetail.endTime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {tripDetail.tripTypes.map((item) => (
                              <Badge key={item.tripTypeId} variant="secondary">
                                {tripTypeLabelVi(item.tripType)}
                              </Badge>
                            ))}
                            {tripDetail.tripVehicles.map((item) => (
                              <Badge key={item.tripVehicleId} variant="outline">
                                <CarFront className="mr-1 h-3 w-3" />
                                {vehicleTypeLabelVi(item.vehicleType)}
                              </Badge>
                            ))}
                            {tripDetail.depositAmount !== null && (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700"
                              >
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
                    <div className="space-y-5 border-t bg-muted/10 p-5">
                      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-md border bg-background p-4">
                          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
                            <Route className="h-4 w-4 text-primary" />
                            Mô tả chuyến đi
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                            {tripDetail.description ||
                              report.targetDetail?.content ||
                              "Chưa có mô tả."}
                          </p>
                        </div>
                        {tripDetail.rule && (
                          <div className="rounded-md border bg-background p-4">
                            <p className="mb-2 text-sm font-semibold">
                              Quy định
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                              {tripDetail.rule}
                            </p>
                          </div>
                        )}
                        {tripDetail.itemRequired && (
                          <div className="rounded-md border bg-background p-4 xl:col-span-2">
                            <p className="mb-2 text-sm font-semibold">
                              Vật dụng cần mang
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                              {tripDetail.itemRequired}
                            </p>
                          </div>
                        )}
                      </div>

                      {tripCheckpoints.length > 0 && (
                        <div className="rounded-md border bg-background p-4">
                          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
                            <MapPin className="h-4 w-4" />
                            Lộ trình ({tripCheckpoints.length} điểm)
                          </p>
                          <div className="grid gap-3 md:grid-cols-2">
                            {tripCheckpoints
                              .slice(0, 6)
                              .map((checkpoint, index) => (
                                <div
                                  key={checkpoint.tripCheckpointId}
                                  className="rounded-md border bg-muted/20 p-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                      {index + 1}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="line-clamp-1 text-sm font-semibold">
                                        {checkpoint.locationName ||
                                          checkpoint.displayAddress ||
                                          `${checkpoint.lat}, ${checkpoint.lng}`}
                                      </p>
                                      {checkpoint.displayAddress &&
                                        checkpoint.locationName && (
                                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
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
                        <div className="rounded-md border bg-background p-4">
                          <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
                            <ImageIcon className="h-4 w-4" />
                            Hình ảnh chuyến đi ({tripMediaAttachments.length})
                          </p>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {tripMediaAttachments.slice(0, 8).map((media) => (
                              <button
                                key={media.mediaAttachmentId}
                                type="button"
                                className="group relative overflow-hidden rounded-md border bg-muted/20 text-left"
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
                                    className="aspect-video w-full object-cover transition group-hover:scale-[1.03]"
                                  />
                                ) : (
                                  <div className="flex aspect-video items-center justify-center text-xs text-muted-foreground">
                                    {mediaTypeLabel(media.mediaType)}
                                  </div>
                                )}
                                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                                  <ImageIcon className="h-5 w-5 text-white opacity-0 transition group-hover:opacity-100" />
                                </span>
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

              {isSocialCheckpointTargetType(report.targetType) && (
                <div className="space-y-3 rounded-lg border p-4">
                  <p className="text-xs font-medium text-muted-foreground">
                    Chi tiết điểm cộng đồng bị báo cáo
                  </p>

                  <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Tên điểm</p>
                      <p className="font-medium">
                        {report.targetDetail?.displayName || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Người tạo</p>
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
                    <div>
                      <p className="text-xs text-muted-foreground">Loại điểm</p>
                      <p className="font-medium">
                        {socialCheckpointMetadata?.checkpointType || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tọa độ</p>
                      <p className="font-medium">
                        {formatCoordinate(socialCheckpointMetadata?.lat)},{" "}
                        {formatCoordinate(socialCheckpointMetadata?.lng)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Đóng góp</p>
                      <p className="font-medium">
                        {socialCheckpointMetadata?.contributionCount ?? 0} từ{" "}
                        {socialCheckpointMetadata?.contributorCount ?? 0} người
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày tạo</p>
                      <p className="font-medium">
                        {formatDateTime(socialCheckpointMetadata?.createdAt)}
                      </p>
                    </div>
                  </div>

                  {report.targetDetail?.content && (
                    <div>
                      <p className="text-xs text-muted-foreground">Mô tả điểm</p>
                      <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted p-2 text-sm">
                        {report.targetDetail.content}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Ảnh/video của điểm ({socialCheckpointMediaAttachments.length})
                    </p>
                    {socialCheckpointMediaAttachments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Không có media trực tiếp trên điểm.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {socialCheckpointMediaAttachments.map((media, index) => {
                          const mediaUrl = media.mediaUrl?.trim();
                          const isImage = tripMediaIsImage(
                            media.mediaType,
                            mediaUrl,
                          );

                          return (
                            <button
                              key={
                                media.mediaAttachmentId ||
                                `${mediaUrl}-${index}`
                              }
                              type="button"
                              className="overflow-hidden rounded-md border bg-muted/20 text-left"
                              disabled={!mediaUrl || !isImage}
                              onClick={() =>
                                mediaUrl && isImage
                                  ? setSelectedMediaUrl(mediaUrl)
                                  : undefined
                              }
                            >
                              {mediaUrl && isImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={mediaUrl}
                                  alt="Media điểm cộng đồng"
                                  className="aspect-video w-full object-cover"
                                />
                              ) : (
                                <div className="flex aspect-video items-center justify-center p-2 text-xs text-muted-foreground">
                                  {mediaTypeLabel(media.mediaType)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Danh sách đóng góp ({socialCheckpointContributions.length})
                    </p>
                    {socialCheckpointContributions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Không có đóng góp nào.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {socialCheckpointContributions.map((contribution, index) => (
                          <div
                            key={
                              contribution.socialCheckpointContributionId ??
                              `${contribution.contributorUserId}-${index}`
                            }
                            className="rounded-md border bg-muted/20 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium">
                                {contribution.contributorName ||
                                  "Người dùng cộng đồng"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(contribution.createdAt)}
                              </p>
                            </div>
                            {contribution.description && (
                              <p className="mt-2 whitespace-pre-wrap text-sm">
                                {contribution.description}
                              </p>
                            )}
                            {(contribution.mediaAttachments ?? []).length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                                {(contribution.mediaAttachments ?? []).map(
                                  (media, mediaIndex) => {
                                    const mediaUrl = media.mediaUrl?.trim();
                                    const isImage = tripMediaIsImage(
                                      media.mediaType,
                                      mediaUrl,
                                    );

                                    return (
                                      <button
                                        key={
                                          media.mediaAttachmentId ||
                                          `${mediaUrl}-${mediaIndex}`
                                        }
                                        type="button"
                                        className="overflow-hidden rounded-md border bg-background text-left"
                                        disabled={!mediaUrl || !isImage}
                                        onClick={() =>
                                          mediaUrl && isImage
                                            ? setSelectedMediaUrl(mediaUrl)
                                            : undefined
                                        }
                                      >
                                        {mediaUrl && isImage ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img
                                            src={mediaUrl}
                                            alt="Media đóng góp điểm cộng đồng"
                                            className="aspect-video w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex aspect-video items-center justify-center p-2 text-xs text-muted-foreground">
                                            {mediaTypeLabel(media.mediaType)}
                                          </div>
                                        )}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        ))}
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
              </div>
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
