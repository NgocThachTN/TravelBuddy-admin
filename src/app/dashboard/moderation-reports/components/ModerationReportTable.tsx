"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchModerationReports,
  processModerationReport,
  claimReport,
} from "@/lib/api";
import type {
  ReportListItem,
  GetReportsParams,
  ResolvedActionCode,
  ReportDecisionCode,
  ProcessReportPayload,
} from "@/types";
import {
  RESOLVED_ACTION_CODES,
  RESOLVED_ACTION_LABELS,
  REPORT_DECISION_CODES,
  REPORT_DECISION_LABELS,
  reportStatusLabel,
  reportTargetTypeLabel,
  reportPriorityLabel,
  reportedPartyTypeLabel,
} from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  Shield,
  AlertTriangle,
  Map,
  MessageSquare,
  LifeBuoy,
  MapPin,
  HandMetal,
} from "lucide-react";
import PaginationControl from "@/components/pagination-control";
import ReportDetailDialog from "../../reports/components/ReportDetailDialog";

const PAGE_SIZE = 15;
const TARGET_TYPE_CODES = [
  "Trip",
  "DirectMessage",
  "Post",
  "PostComment",
  "ServicePartner",
  "RescueRequest",
  "RescueRequestMessage",
  "TripMessage",
  "SocialCheckpoint",
  "User",
  "Other",
] as const;

const MODERATION_TARGET_TYPES = [
  "Trip",
  "DirectMessage",
  "Post",
  "PostComment",
  "RescueRequest",
  "RescueRequestMessage",
  "TripMessage",
  "SocialCheckpoint",
] as const;

type StatusFilter =
  | "all"
  | "Pending"
  | "Reviewing"
  | "Resolved"
  | "Rejected"
  | "Duplicate";
type TargetTypeFilter = "all" | string;

/* -- Helpers -- */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getReporterName(item: ReportListItem) {
  const full = [item.reporterFirstName, item.reporterLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || "(Ẩn danh)";
}

function getInitials(item: ReportListItem) {
  const first = item.reporterFirstName?.trim();
  const last = item.reporterLastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return "?";
}

function resolveReporterName(item: ReportListItem) {
  const baseName = getReporterName(item);
  return (
    item.reporterName ||
    item.reporterEmail ||
    (baseName === "(Ẩn danh)" ? "(Ẩn danh)" : baseName)
  );
}

function resolveReporterInitials(item: ReportListItem) {
  const source = resolveReporterName(item);
  const baseInitials = getInitials(item);
  if (source === "(Ẩn danh)") return baseInitials === "?" ? "?" : baseInitials;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || baseInitials || "?";
}

function statusBadgeVariant(
  status: number | string,
): "default" | "secondary" | "destructive" | "outline" {
  const s =
    typeof status === "number"
      ? (
          ["Pending", "Reviewing", "Resolved", "Rejected", "Duplicate"] as const
        )[status]
      : status;
  switch (s) {
    case "Pending":
      return "destructive";
    case "Reviewing":
      return "secondary";
    case "Resolved":
      return "default";
    case "Rejected":
      return "outline";
    case "Duplicate":
      return "outline";
    default:
      return "secondary";
  }
}

function toTargetTypeCode(targetType: number | string): string {
  if (typeof targetType === "number") {
    return TARGET_TYPE_CODES[targetType] ?? "Other";
  }
  return targetType;
}

function targetTypeIcon(targetType: number | string) {
  const t = toTargetTypeCode(targetType);
  switch (t) {
    case "Trip":
      return <Map className="h-3.5 w-3.5" />;
    case "DirectMessage":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "Post":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "PostComment":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "RescueRequest":
      return <LifeBuoy className="h-3.5 w-3.5" />;
    case "RescueRequestMessage":
      return <LifeBuoy className="h-3.5 w-3.5" />;
    case "TripMessage":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "SocialCheckpoint":
      return <MapPin className="h-3.5 w-3.5" />;
    default:
      return <AlertTriangle className="h-3.5 w-3.5" />;
  }
}

function getAvailableResolvedActions(
  targetType: number | string,
): ResolvedActionCode[] {
  const code = toTargetTypeCode(targetType);

  if (code === "Trip") {
    return ["None", "Warn", "RemoveContent", "LockUser"];
  }

  if (code === "RescueRequest") {
    return ["None", "Warn", "CancelRescueRequest"];
  }

  if (code === "Post") {
    return ["None", "Warn", "RemoveContent", "LockUser"];
  }

  if (
    code === "DirectMessage" ||
    code === "PostComment" ||
    code === "TripMessage" ||
    code === "RescueRequestMessage" ||
    code === "SocialCheckpoint"
  ) {
    return ["None", "Warn", "RemoveContent"];
  }

  return ["None", "Warn"];
}

const ACTION_DESCRIPTIONS: Partial<Record<ResolvedActionCode, string>> = {
  None: "Không áp dụng biện pháp nào, chỉ lưu kết quả xác minh.",
  Warn: "Gửi nhắc nhở để người dùng điều chỉnh hành vi.",
  RemoveContent: "Ẩn hoặc gỡ nội dung vi phạm khỏi hệ thống.",
  LockUser: "Khóa tài khoản để ngăn tái phạm ngay.",
  CancelRescueRequest: "Huỷ yêu cầu cứu hộ vi phạm quy định.",
};

/* -- Process Dialog (unified resolve/reject/duplicate) -- */
interface ProcessDialogProps {
  report: ReportListItem | null;
  onClose: () => void;
  onConfirm: (payload: ProcessReportPayload) => Promise<void>;
  loading: boolean;
}

function ProcessDialog({
  report,
  onClose,
  onConfirm,
  loading,
}: ProcessDialogProps) {
  return (
    <Dialog
      open={!!report}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        {report && (
          <ProcessForm
            report={report}
            onClose={onClose}
            onConfirm={onConfirm}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProcessForm({
  report,
  onClose,
  onConfirm,
  loading,
}: {
  report: ReportListItem;
  onClose: () => void;
  onConfirm: (payload: ProcessReportPayload) => Promise<void>;
  loading: boolean;
}) {
  const availableActions = getAvailableResolvedActions(report.targetType);
  const defaultSelectedAction: ResolvedActionCode = availableActions.includes(
    "Warn",
  )
    ? "Warn"
    : availableActions[0];
  const [decision, setDecision] = useState<ReportDecisionCode>("Resolved");
  const [selectedActions, setSelectedActions] = useState<ResolvedActionCode[]>([
    defaultSelectedAction,
  ]);
  const [note, setNote] = useState("");
  const [createStrike, setCreateStrike] = useState(false);
  const [strikeExpiresAt, setStrikeExpiresAt] = useState("");

  const decisionIndex = REPORT_DECISION_CODES.indexOf(decision);
  const normalizedSelectedActions = selectedActions.filter((action) =>
    availableActions.includes(action),
  );

  function toggleAction(action: ResolvedActionCode) {
    setSelectedActions((current) => {
      const normalizedCurrent = current.filter((value) =>
        availableActions.includes(value),
      );

      if (action === "None") {
        return normalizedCurrent.includes("None") ? [] : ["None"];
      }

      const withoutNone = normalizedCurrent.filter((value) => value !== "None");
      if (withoutNone.includes(action)) {
        return withoutNone.filter((value) => value !== action);
      }

      return [...withoutNone, action];
    });
  }

  function handleSubmit() {
    const payload: ProcessReportPayload = {
      decision: decisionIndex,
    };
    if (decision === "Resolved") {
      const resolvedActionIndexes = normalizedSelectedActions
        .map((action) => RESOLVED_ACTION_CODES.indexOf(action))
        .filter((value) => value >= 0);
      if (resolvedActionIndexes.length > 0) {
        payload.resolvedActions = resolvedActionIndexes;
        payload.resolvedAction = resolvedActionIndexes[0];
      }
    }
    if (note) payload.resolvedNote = note;
    if (createStrike) {
      payload.createStrike = true;
      if (strikeExpiresAt)
        payload.strikeExpiresAt = new Date(strikeExpiresAt).toISOString();
    }
    onConfirm(payload);
  }

  const disableSubmit =
    decision === "Resolved" && normalizedSelectedActions.length === 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>Xử lý báo cáo</DialogTitle>
        <DialogDescription>
          Báo cáo từ{" "}
          <span className="font-semibold">{resolveReporterName(report)}</span>
          {" — "}
          {reportTargetTypeLabel(report.targetType)}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        {/* Decision */}
        <div className="space-y-2">
          <Label>{"Quyết định"}</Label>
          <Select
            value={decision}
            onValueChange={(v) => setDecision(v as ReportDecisionCode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_DECISION_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {REPORT_DECISION_LABELS[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resolved Action (only when Resolved) */}
        {decision === "Resolved" && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label>Hành động xử lý (có thể chọn nhiều)</Label>
            <div className="space-y-2">
              {availableActions.map((action) => {
                const isChecked = normalizedSelectedActions.includes(action);
                return (
                  <label
                    key={action}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border p-2",
                      isChecked
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAction(action)}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium">
                        {RESOLVED_ACTION_LABELS[action]}
                      </span>
                      {ACTION_DESCRIPTIONS[action] && (
                        <span className="block text-xs text-muted-foreground">
                          {ACTION_DESCRIPTIONS[action]}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            {normalizedSelectedActions.length === 0 && (
              <p className="text-xs text-destructive">
                Vui lòng chọn ít nhất 1 hành động xử lý.
              </p>
            )}
          </div>
        )}

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="process-note">Ghi chú</Label>
          <Textarea
            id="process-note"
            placeholder="Nhập ghi chú xử lý..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
          />
          <p className="text-right text-xs text-muted-foreground">
            {note.length}/2000
          </p>
        </div>

        {/* Strike */}
        {decision === "Resolved" && (
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mod-create-strike"
                checked={createStrike}
                onChange={(e) => setCreateStrike(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="mod-create-strike" className="cursor-pointer">
                Ghi nhận vi phạm cho người dùng
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Ghi nhận vi phạm giúp hệ thống theo dõi lịch sử tái phạm để xử lý
              mạnh hơn khi cần.
            </p>
            {createStrike && (
              <div className="space-y-2">
                <Label htmlFor="mod-strike-expires">
                  {"Hết hạn strike (không bắt buộc)"}
                </Label>
                <Input
                  id="mod-strike-expires"
                  type="datetime-local"
                  value={strikeExpiresAt}
                  onChange={(e) => setStrikeExpiresAt(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Huỷ
        </Button>
        <Button
          variant={decision === "Rejected" ? "destructive" : "default"}
          disabled={loading || disableSubmit}
          onClick={handleSubmit}
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Xác nhận
        </Button>
      </DialogFooter>
    </>
  );
}

/* -- Main Moderation Report Table -- */
export default function ModerationReportTable() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [targetTypeFilter, setTargetTypeFilter] =
    useState<TargetTypeFilter>("all");
  const [page, setPage] = useState(1);

  // Debounce
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const targetTypeFromQuery = searchParams.get("targetType");

  useEffect(() => {
    if (
      targetTypeFromQuery &&
      MODERATION_TARGET_TYPES.includes(
        targetTypeFromQuery as (typeof MODERATION_TARGET_TYPES)[number],
      )
    ) {
      setTargetTypeFilter(targetTypeFromQuery);
      return;
    }

    setTargetTypeFilter("all");
  }, [targetTypeFromQuery]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(
      () => setDebouncedSearch(search),
      400,
    );
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, targetTypeFilter]);

  // Dialogs
  const [processTarget, setProcessTarget] = useState<ReportListItem | null>(
    null,
  );
  const [dialogLoading, setDialogLoading] = useState(false);
  const [detailReport, setDetailReport] = useState<ReportListItem | null>(null);

  const loadReports = useCallback(
    async (p = page) => {
      try {
        setLoading(true);
        const params: GetReportsParams = {
          pageNumber: p,
          pageSize: PAGE_SIZE,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "all") params.status = statusFilter;
        if (targetTypeFilter !== "all") params.targetType = targetTypeFilter;

        const result = await fetchModerationReports(params);
        setReports(result.data.items);
        setTotalCount(result.data.totalCount);
        setTotalPages(result.data.totalPages);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách báo cáo",
        );
      } finally {
        setLoading(false);
      }
    },
    [page, debouncedSearch, statusFilter, targetTypeFilter],
  );

  useEffect(() => {
    loadReports(page);
  }, [loadReports, page]);

  async function handleProcess(payload: ProcessReportPayload) {
    if (!processTarget) return;
    try {
      setDialogLoading(true);
      await processModerationReport(processTarget.reportId, payload);
      setProcessTarget(null);
      await loadReports(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xử lý báo cáo thất bại");
    } finally {
      setDialogLoading(false);
    }
  }

  async function handleClaim(report: ReportListItem) {
    try {
      setDialogLoading(true);
      await claimReport(report.reportId);
      await loadReports(page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nhận xử lý báo cáo thất bại");
    } finally {
      setDialogLoading(false);
    }
  }

  /* -- Loading Skeleton -- */
  if (loading && reports.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  /* -- Error State -- */
  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => loadReports(page)}
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ProcessDialog
        report={processTarget}
        onClose={() => setProcessTarget(null)}
        onConfirm={handleProcess}
        loading={dialogLoading}
      />
      <ReportDetailDialog
        reportId={detailReport?.reportId ?? null}
        reportPreview={detailReport}
        scope="moderation"
        onClose={() => setDetailReport(null)}
      />

      <Card className="overflow-hidden">
        {/* -- Toolbar -- */}
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm báo cáo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 bg-background"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ xử lý</SelectItem>
              <SelectItem value="Reviewing">Đang xem xét</SelectItem>
              <SelectItem value="Resolved">Đã giải quyết</SelectItem>
              <SelectItem value="Rejected">{"Đã từ chối"}</SelectItem>
              <SelectItem value="Duplicate">Trùng lặp</SelectItem>
            </SelectContent>
          </Select>

          {/* Target Type Filter */}
          <Select
            value={targetTypeFilter}
            onValueChange={(v) => setTargetTypeFilter(v as TargetTypeFilter)}
          >
            <SelectTrigger className="h-9 w-[190px]">
              <SelectValue placeholder={"Loại đối tượng"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="Trip">{"Chuyến đi"}</SelectItem>
              <SelectItem value="DirectMessage">Tin nhắn chat</SelectItem>
              <SelectItem value="Post">Bài viết</SelectItem>
              <SelectItem value="PostComment">Bình luận</SelectItem>
              <SelectItem value="TripMessage">
                {"Tin nhắn chuyến đi"}
              </SelectItem>
              <SelectItem value="RescueRequest">{"Yêu cầu cứu hộ"}</SelectItem>
              <SelectItem value="RescueRequestMessage">
                {"Tin nhắn cứu hộ"}
              </SelectItem>
              <SelectItem value="SocialCheckpoint">
                {"Điểm cộng đồng"}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 h-9 w-9"
            onClick={() => loadReports(page)}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* -- Count Bar -- */}
        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {"Tổng cộng "}
            <span className="font-semibold text-foreground">{totalCount}</span>
            {" báo cáo"}
          </span>
        </div>

        {/* -- Table -- */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người báo cáo</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>{"Bên bị tố"}</TableHead>
              <TableHead>Lý do</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ưu tiên</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Không tìm thấy báo cáo</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
                const name = resolveReporterName(report);
                const isPending =
                  report.status === 0 || report.status === "Pending";
                const isReviewing =
                  report.status === 1 || report.status === "Reviewing";
                const canAct = isPending || isReviewing;

                return (
                  <TableRow key={report.reportId} className="group">
                    {/* Reporter */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {report.reporterAvatarUrl && (
                            <AvatarImage
                              src={report.reporterAvatarUrl}
                              alt={name}
                            />
                          )}
                          <AvatarFallback
                            className={cn(
                              "text-xs font-semibold",
                              getAvatarColor(report.reporterUserId),
                            )}
                          >
                            {resolveReporterInitials(report)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{name}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Target Type */}
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {targetTypeIcon(report.targetType)}
                        {reportTargetTypeLabel(report.targetType)}
                      </Badge>
                    </TableCell>

                    {/* Reported Party */}
                    <TableCell className="text-sm text-muted-foreground">
                      {reportedPartyTypeLabel(report.reportedPartyType)}
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm">
                        {report.reason?.displayName ||
                          report.reasonDisplayName ||
                          report.reasonText ||
                          "—"}
                      </p>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={statusBadgeVariant(report.status)}>
                        {reportStatusLabel(report.status)}
                      </Badge>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>
                      {report.priority === 1 || report.priority === "High" ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Cao
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {reportPriorityLabel(report.priority)}
                        </span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(report.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleClaim(report)}
                            disabled={dialogLoading}
                          >
                            <HandMetal className="mr-1.5 h-3.5 w-3.5" />
                            Nhận xử lý
                          </Button>
                        )}
                        {canAct && (
                          <Button
                            size="sm"
                            onClick={() => setProcessTarget(report)}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Xử lý
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailReport(report)}
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* -- Pagination -- */}
        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="border-t py-3"
        />
      </Card>
    </>
  );
}
