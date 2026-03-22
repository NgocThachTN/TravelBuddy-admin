"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  CarFront,
  Clock3,
  Filter,
  Image as ImageIcon,
  MapPin,
  Route,
  RefreshCw,
  Search,
  Shield,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import {
  fetchTripById,
  fetchTripModerationTaskDetail,
  fetchTripModerationTasks,
} from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  GetTripModerationTasksParams,
  TripDetail,
  TripModerationTaskDetail,
  TripModerationTaskListItem,
} from "@/types";
import {
  AI_MODERATION_STATUS_CODES,
  aiModerationStatusLabel,
  moderationStatusLabel,
  PARTICIPANT_STATUS_LABELS,
  SCAN_STATUS_LABELS,
  tripRoleLabel,
  tripStatusLabel,
  TRIP_STATUS_CODES,
} from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControl from "@/components/pagination-control";
import TripCheckpointMap from "./TripCheckpointMap";
import { checkpointLabelVi, checkpointMetaByType } from "./checkpoint-meta";

const PAGE_SIZE = 15;

type TaskStatusFilter = "openQueue" | "all" | "Open" | "Assigned" | "InReview" | "Resolved" | "Dismissed" | "Failed";
type ScanFilter = "all" | "Clean" | "Flagged" | "Error";

const TASK_STATUS_STYLES: Record<string, string> = {
  Open: "bg-blue-100 text-blue-700 border-blue-200",
  Assigned: "bg-indigo-100 text-indigo-700 border-indigo-200",
  InReview: "bg-amber-100 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Dismissed: "bg-gray-100 text-gray-600 border-gray-200",
  Failed: "bg-red-100 text-red-700 border-red-200",
};

const SCAN_STATUS_STYLES: Record<string, string> = {
  Clean: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Flagged: "bg-amber-100 text-amber-700 border-amber-200",
  Error: "bg-red-100 text-red-700 border-red-200",
  NotScanned: "bg-gray-100 text-gray-600 border-gray-200",
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getTaskStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500 border-gray-200";
  const key = typeof status === "number" ? AI_MODERATION_STATUS_CODES[status] : status;
  return TASK_STATUS_STYLES[key] ?? "bg-gray-100 text-gray-500 border-gray-200";
}

function scanStatusLabel(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") return SCAN_STATUS_LABELS[value] ?? `${value}`;
  const n = value.toLowerCase();
  if (n === "clean") return "Sạch";
  if (n === "flagged") return "Cảnh báo";
  if (n === "error") return "Lỗi";
  if (n === "notscanned") return "Chưa quét";
  return value;
}

function getScanStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500 border-gray-200";
  if (typeof status === "number") {
    return status === 1
      ? SCAN_STATUS_STYLES.Clean
      : status === 2
        ? SCAN_STATUS_STYLES.Flagged
        : status === 3
          ? SCAN_STATUS_STYLES.Error
          : SCAN_STATUS_STYLES.NotScanned;
  }
  const key = status.toLowerCase();
  if (key === "clean") return SCAN_STATUS_STYLES.Clean;
  if (key === "flagged") return SCAN_STATUS_STYLES.Flagged;
  if (key === "error") return SCAN_STATUS_STYLES.Error;
  if (key === "notscanned") return SCAN_STATUS_STYLES.NotScanned;
  return "bg-gray-100 text-gray-500 border-gray-200";
}

function getTripStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500";
  const code = typeof status === "number" ? TRIP_STATUS_CODES[status] : status;
  const styles: Record<string, string> = {
    Draft: "bg-gray-100 text-gray-700",
    Processing: "bg-sky-100 text-sky-700",
    Recruiting: "bg-emerald-100 text-emerald-700",
    AlmostFull: "bg-amber-100 text-amber-700",
    Full: "bg-orange-100 text-orange-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Ongoing: "bg-indigo-100 text-indigo-700",
    Completed: "bg-gray-100 text-gray-600",
    Cancelled: "bg-red-100 text-red-700",
    Hidden: "bg-gray-100 text-gray-500",
    InReview: "bg-yellow-100 text-yellow-700",
  };
  return (code && styles[code]) || "bg-gray-100 text-gray-500";
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatScore(score: number | null) {
  if (score === null || score === undefined) return "—";
  return `${Math.round(score * 100)}%`;
}

function formatVnd(amount: number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

function formatDistance(distanceM: number | null | undefined) {
  if (distanceM === null || distanceM === undefined || Number.isNaN(distanceM)) return "—";
  return `${(distanceM / 1000).toFixed(1)} km`;
}

function formatDuration(durationS: number | null | undefined) {
  if (durationS === null || durationS === undefined || Number.isNaN(durationS)) return "—";
  const totalMinutes = Math.round(durationS / 60);
  if (totalMinutes < 60) return `${totalMinutes} phút`;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return minute > 0 ? `${hour}h ${minute}p` : `${hour}h`;
}

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function findingSeverityStyle(severity: string | null | undefined) {
  const normalized = severity?.toLowerCase();
  if (normalized === "high") return "bg-red-100 text-red-700 border-red-200";
  if (normalized === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  if (normalized === "low") return "bg-sky-100 text-sky-700 border-sky-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export default function TripModerationTaskTable() {
  const [items, setItems] = useState<TripModerationTaskListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("openQueue");
  const [scanFilter, setScanFilter] = useState<ScanFilter>("all");
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailTripError, setDetailTripError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TripModerationTaskDetail | null>(null);
  const [detailTrip, setDetailTrip] = useState<TripDetail | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, scanFilter]);

  const loadTasks = useCallback(async (currentPage = page) => {
    try {
      setLoading(true);
      const params: GetTripModerationTasksParams = {
        pageNumber: currentPage,
        pageSize: PAGE_SIZE,
        sortBy: "Priority",
        sortDirection: "asc",
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter === "openQueue") params.status = "Open,Assigned,InReview";
      else if (statusFilter !== "all") params.status = statusFilter;
      if (scanFilter !== "all") params.scanStatus = scanFilter;

      const result = await fetchTripModerationTasks(params);
      setItems(result.data.items);
      setTotalCount(result.data.totalCount);
      setTotalPages(result.data.totalPages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách task kiểm duyệt");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, scanFilter]);

  useEffect(() => {
    loadTasks(page);
  }, [loadTasks, page]);

  const openTaskDetail = useCallback(async (taskId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailTripError(null);
    setSelectedTask(null);
    setDetailTrip(null);

    try {
      const taskResult = await fetchTripModerationTaskDetail(taskId);
      const taskDetail = taskResult.data;
      setSelectedTask(taskDetail);

      if (taskDetail.tripExists && !taskDetail.isTripDeleted) {
        try {
          const tripResult = await fetchTripById(taskDetail.tripId);
          setDetailTrip(tripResult.data);
        } catch (tripErr) {
          setDetailTripError(tripErr instanceof Error ? tripErr.message : "Không thể tải đầy đủ dữ liệu trip.");
        }
      }
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Không thể tải chi tiết task");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const resolvedTitle = useMemo(
    () => detailTrip?.title || selectedTask?.tripTitle || selectedTask?.safeNormalizedPreview?.title || "(Không có tiêu đề)",
    [detailTrip, selectedTask],
  );

  const resolvedDescription = useMemo(
    () => detailTrip?.description || selectedTask?.tripDescription || selectedTask?.safeNormalizedPreview?.description || null,
    [detailTrip, selectedTask],
  );

  const resolvedRule = useMemo(
    () => detailTrip?.rule || selectedTask?.tripRule || selectedTask?.safeNormalizedPreview?.rule || null,
    [detailTrip, selectedTask],
  );

  const resolvedItemRequired = useMemo(
    () => detailTrip?.itemRequired || selectedTask?.tripItemRequired || selectedTask?.safeNormalizedPreview?.itemRequired || null,
    [detailTrip, selectedTask],
  );

  const sortedCheckpoints = useMemo(
    () => detailTrip?.checkpoints
      ? [...detailTrip.checkpoints].sort((a, b) => {
          if (a.sequenceNo !== b.sequenceNo) return a.sequenceNo - b.sequenceNo;
          return checkpointMetaByType(a.tripCheckpointType).sortOrder - checkpointMetaByType(b.tripCheckpointType).sortOrder;
        })
      : [],
    [detailTrip],
  );

  const tripLevelExpenses = useMemo(
    () => (detailTrip?.expenseCategories ?? []).filter((expense) => !expense.tripCheckpointId),
    [detailTrip],
  );

  const totalEstimatedCost = useMemo(
    () => (detailTrip?.expenseCategories ?? []).reduce((sum, expense) => sum + (expense.estimatedCost ?? 0), 0),
    [detailTrip],
  );

  if (loading && items.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 border-b px-4 py-3.5 last:border-0">
              <Skeleton className="h-8 w-36 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => loadTasks(page)}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo taskId, tripId, tiêu đề trip..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 bg-background pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatusFilter)}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Trạng thái task" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="openQueue">Queue mở (Open/Assigned/InReview)</SelectItem>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Assigned">Assigned</SelectItem>
              <SelectItem value="InReview">InReview</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Dismissed">Dismissed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={scanFilter} onValueChange={(value) => setScanFilter(value as ScanFilter)}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue placeholder="Kết quả AI scan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả scan</SelectItem>
              <SelectItem value="Clean">Clean</SelectItem>
              <SelectItem value="Flagged">Flagged</SelectItem>
              <SelectItem value="Error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => loadTasks(page)} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Tổng cộng <span className="font-semibold text-foreground">{totalCount}</span> task</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Chuyến đi</TableHead>
              <TableHead>AI scan</TableHead>
              <TableHead>Ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead>Phụ trách</TableHead>
              <TableHead className="text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted"><Shield className="h-5 w-5 text-muted-foreground" /></div>
                  <p className="text-sm font-medium">Không có task kiểm duyệt phù hợp</p>
                  <p className="mt-1 text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((task) => (
                <TableRow key={task.taskId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{task.taskId.slice(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground">Trip: {task.tripId.slice(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="max-w-[220px] truncate text-sm font-medium">{task.tripTitle || "(Không có tiêu đề)"}</p>
                      <p className="max-w-[220px] truncate text-xs text-muted-foreground">{task.tripOwnerName || "Không rõ chủ trip"}</p>
                      <p className="text-xs text-muted-foreground">Trip status: {tripStatusLabel(task.tripCurrentStatus)} / Moderation: {moderationStatusLabel(task.tripModerationStatus)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className={cn("text-[11px]", getScanStatusStyle(task.aiStatus))}>{scanStatusLabel(task.aiStatus)}</Badge>
                      <p className="text-xs text-muted-foreground">Score: {formatScore(task.aiScore)}</p>
                      <p className="max-w-[200px] truncate text-xs text-muted-foreground">{task.aiLabels || "Không có nhãn"}</p>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-[11px]">P{task.priority}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={cn("text-[11px]", getTaskStatusStyle(task.status))}>{aiModerationStatusLabel(task.status)}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(task.createdAt)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{task.assignedToName || "Chưa gán"}</TableCell>
                  <TableCell><div className="flex items-center justify-center"><Button size="sm" variant="outline" onClick={() => openTaskDetail(task.taskId)}>Xem trip</Button></div></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="border-t p-4"><PaginationControl currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        )}
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{resolvedTitle}</DialogTitle>
            <DialogDescription>Chi tiết duyệt thủ công: hiển thị đầy đủ thông tin chuyến đi và đánh giá AI.</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {detailLoading && (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            )}

            {!detailLoading && detailError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{detailError}</div>
            )}

            {!detailLoading && !detailError && selectedTask && (
              <>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={cn("text-[11px]", getTaskStatusStyle(selectedTask.status))}>{aiModerationStatusLabel(selectedTask.status)}</Badge>
                    <Badge variant="outline" className={cn("text-[11px]", getScanStatusStyle(selectedTask.aiStatus))}>{scanStatusLabel(selectedTask.aiStatus)}</Badge>
                    <Badge variant="outline">Ưu tiên P{selectedTask.priority}</Badge>
                    {selectedTask.aiScore !== null && <Badge variant="outline">Score {formatScore(selectedTask.aiScore)}</Badge>}
                    {selectedTask.aiConfidence !== null && <Badge variant="outline">Confidence {selectedTask.aiConfidence}%</Badge>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Task tạo lúc {formatDateTime(selectedTask.createdAt)}</p>
                </div>

                {detailTripError && <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{detailTripError}</div>}

                {!detailTrip && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p className="font-medium">Không tìm thấy đầy đủ bản ghi trip gốc.</p>
                        <p className="text-xs">Hệ thống đang hiển thị snapshot nội dung từ AI scan để moderator vẫn có thể duyệt.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4 text-muted-foreground" />Thông tin chuyến đi</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Bắt đầu</span><span className="font-medium">{formatDateTime(detailTrip?.startTime ?? selectedTask.tripStartTime)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Kết thúc</span><span className="font-medium">{formatDateTime(detailTrip?.endTime ?? selectedTask.tripEndTime)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Quay về</span><span className="font-medium">{formatDateTime(detailTrip?.backTime)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Hạn đăng ký</span><span className="font-medium">{formatDateTime(detailTrip?.registrationDeadline ?? selectedTask.tripRegistrationDeadline)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tiền cọc</span><span className="font-medium">{formatVnd(detailTrip?.depositAmount)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Trip status</span><Badge variant="outline" className={cn("text-[11px]", getTripStatusStyle(detailTrip?.currentStatus ?? selectedTask.tripCurrentStatus))}>{tripStatusLabel(detailTrip?.currentStatus ?? selectedTask.tripCurrentStatus)}</Badge></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Moderation status</span><span className="font-medium">{moderationStatusLabel(detailTrip?.moderationStatus ?? selectedTask.tripModerationStatus)}</span></div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-muted-foreground" />Chủ trip & Thống kê</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {detailTrip?.owner?.avatarUrl && <AvatarImage src={detailTrip.owner.avatarUrl} alt="Owner" />}
                          <AvatarFallback className={cn("text-xs font-semibold", getAvatarColor(detailTrip?.owner?.userId ?? "owner"))}>
                            {detailTrip?.owner ? (((detailTrip.owner.firstName?.[0] || "") + (detailTrip.owner.lastName?.[0] || "")).toUpperCase() || "??") : "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{detailTrip?.owner ? ([detailTrip.owner.firstName, detailTrip.owner.lastName].filter(Boolean).join(" ") || "(Chưa đặt tên)") : selectedTask.tripOwnerName || "Không rõ chủ trip"}</p>
                          {detailTrip?.owner?.experienceLevel !== null && detailTrip?.owner?.experienceLevel !== undefined && <p className="text-xs text-muted-foreground">Level: {detailTrip.owner.experienceLevel}</p>}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Số người tham gia</span><span className="font-medium">{detailTrip?.participantCount ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tối thiểu</span><span className="font-medium">{detailTrip?.minParticipants ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Tối đa</span><span className="font-medium">{detailTrip?.maxParticipants ?? "—"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Scan status</span><span className="font-medium">{scanStatusLabel(detailTrip?.scanStatus ?? selectedTask.aiStatus)}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {detailTrip && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold">Phân loại chuyến đi & Chi phí dự kiến</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <Tag className="h-3.5 w-3.5" />
                          Loại chuyến đi
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(detailTrip.tripTypes ?? []).length === 0
                            ? <span className="text-sm text-muted-foreground">—</span>
                            : (detailTrip.tripTypes ?? []).map((item) => (
                              <Badge key={item.tripTypeId} variant="outline" className="text-[11px]">
                                {item.tripType || "Không rõ"}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <CarFront className="h-3.5 w-3.5" />
                          Phương tiện
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(detailTrip.tripVehicles ?? []).length === 0
                            ? <span className="text-sm text-muted-foreground">—</span>
                            : (detailTrip.tripVehicles ?? []).map((item) => (
                              <Badge key={item.tripVehicleId} variant="outline" className="text-[11px]">
                                {item.vehicleType || "Không rõ"}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="rounded-lg border bg-muted/20 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Wallet className="h-3.5 w-3.5" />
                            Chi phí cấp chuyến
                          </p>
                          <span className="text-sm font-semibold">{formatVnd(totalEstimatedCost)}</span>
                        </div>
                        {tripLevelExpenses.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Không có chi phí chung ở cấp chuyến.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {tripLevelExpenses.map((expense) => (
                              <div key={expense.tripExpenseCategoryId} className="flex items-center justify-between gap-2 text-sm">
                                <span className="text-muted-foreground">{expense.expenseType || "Chi phí khác"}</span>
                                <span className="font-medium">{formatVnd(expense.estimatedCost)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Nội dung mô tả</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div><p className="mb-1 text-xs text-muted-foreground">Mô tả</p><p className="whitespace-pre-wrap">{resolvedDescription || "—"}</p></div>
                    <div><p className="mb-1 text-xs text-muted-foreground">Quy định</p><p className="whitespace-pre-wrap">{resolvedRule || "—"}</p></div>
                    <div><p className="mb-1 text-xs text-muted-foreground">Vật dụng cần mang</p><p className="whitespace-pre-wrap">{resolvedItemRequired || "—"}</p></div>
                  </CardContent>
                </Card>

                {!detailTrip && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Lộ trình
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        Bản ghi trip gốc không còn tồn tại nên không thể hiển thị routing/mapbox.
                      </div>
                    </CardContent>
                  </Card>
                )}

                {sortedCheckpoints.length ? (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-muted-foreground" />Lộ trình ({sortedCheckpoints.length} điểm)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-2.5">
                        <Badge variant="outline" className="text-[11px]">{sortedCheckpoints.length} checkpoint</Badge>
                        <Badge variant="outline" className="text-[11px]">Quãng đường: {formatDistance(detailTrip?.itinerary?.distanceM)}</Badge>
                        <Badge variant="outline" className="text-[11px]">Thời gian: {formatDuration(detailTrip?.itinerary?.durationS)}</Badge>
                        {detailTrip?.itinerary?.travelMode && (
                          <Badge variant="outline" className="text-[11px]">Mode: {detailTrip.itinerary.travelMode}</Badge>
                        )}
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
                        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                          {sortedCheckpoints.map((cp, index) => {
                            const typeMeta = checkpointMetaByType(cp.tripCheckpointType);
                            const TypeIcon = typeMeta.icon;
                            const costs = cp.costs ?? [];
                            return (
                              <div key={cp.tripCheckpointId} className="rounded-lg border bg-background p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[11px]">Điểm {index + 1}</Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-[11px]"
                                        style={{ borderColor: `${typeMeta.color}60`, color: typeMeta.color }}
                                      >
                                        <TypeIcon className="mr-1 h-3 w-3" />
                                        {checkpointLabelVi(cp.tripCheckpointType)}
                                      </Badge>
                                    </div>
                                    <p className="text-sm font-semibold">{cp.locationName || cp.displayAddress || "—"}</p>
                                    {cp.locationName && cp.displayAddress && (
                                      <p className="text-xs text-muted-foreground">{cp.displayAddress}</p>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">#{cp.sequenceNo}</span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                                  <span className="inline-flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5">
                                    <Clock3 className="h-3 w-3" />
                                    {formatDateTime(cp.plannedAt)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5">
                                    <Route className="h-3 w-3" />
                                    {Number.isFinite(cp.lat) && Number.isFinite(cp.lng)
                                      ? `${cp.lat.toFixed(6)}, ${cp.lng.toFixed(6)}`
                                      : "Chưa có tọa độ"}
                                  </span>
                                </div>

                                {cp.note && (
                                  <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                                    {cp.note}
                                  </div>
                                )}

                                {costs.length > 0 && (
                                  <div className="mt-2 rounded-md border bg-amber-50/50 p-2">
                                    <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                                      <Wallet className="h-3 w-3" />
                                      Chi phí tại điểm
                                    </p>
                                    <div className="space-y-1">
                                      {costs.map((cost) => (
                                        <div key={cost.tripExpenseCategoryId} className="flex items-center justify-between gap-2 text-[11px]">
                                          <span className="truncate text-muted-foreground">{cost.expenseType || "Chi phí khác"}</span>
                                          <span className="font-medium">{formatVnd(cost.estimatedCost)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <TripCheckpointMap checkpoints={sortedCheckpoints} itinerary={detailTrip?.itinerary} />
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {detailTrip?.participants?.length ? (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-muted-foreground" />Thành viên ({detailTrip.participants.length})</CardTitle></CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader><TableRow><TableHead>Thành viên</TableHead><TableHead>Vai trò</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {detailTrip.participants.map((p) => {
                            const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || "(Chưa đặt tên)";
                            const initials = (((p.firstName?.[0] || "") + (p.lastName?.[0] || "")).toUpperCase() || "??");
                            return (
                              <TableRow key={p.tripParticipantId}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-7 w-7">
                                      {p.avatarUrl && <AvatarImage src={p.avatarUrl} alt={name} />}
                                      <AvatarFallback className={cn("text-[10px] font-semibold", getAvatarColor(p.userId || p.tripParticipantId))}>{initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm">{name}</span>
                                  </div>
                                </TableCell>
                                <TableCell><Badge variant="secondary" className="text-[11px]">{tripRoleLabel(p.roleInTrip)}</Badge></TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {p.participantStatusId !== null && p.participantStatusId !== undefined
                                    ? (typeof p.participantStatusId === "number"
                                        ? PARTICIPANT_STATUS_LABELS[p.participantStatusId] ?? `${p.participantStatusId}`
                                        : String(p.participantStatusId))
                                    : "—"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : null}

                {detailTrip?.mediaAttachments?.length ? (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><ImageIcon className="h-4 w-4 text-muted-foreground" />Hình ảnh & Media ({detailTrip.mediaAttachments.length})</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {detailTrip.mediaAttachments.map((m) => (
                          <div key={m.mediaAttachmentId} className="overflow-hidden rounded-lg border">
                            {m.mediaType === "Image" || m.mediaType === 0
                              ? <img src={m.mediaUrl} alt="" className="aspect-video w-full object-cover" />
                              : <div className="flex aspect-video items-center justify-center bg-muted"><span className="text-xs text-muted-foreground">{m.mediaType}</span></div>}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Đánh giá AI</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTask.aiSummary ? <p className="rounded-md bg-muted/30 p-3 text-sm">{selectedTask.aiSummary}</p> : <p className="text-sm text-muted-foreground">Không có tóm tắt từ AI.</p>}

                    {selectedTask.aiLabels && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.aiLabels.split(",").map((x) => x.trim()).filter(Boolean).map((label) => (
                          <Badge key={label} variant="outline" className="text-[11px]">{label}</Badge>
                        ))}
                      </div>
                    )}

                    {selectedTask.scanErrorMessage && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">Lỗi scan: {selectedTask.scanErrorMessage}</p>}

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Findings ({selectedTask.aiFindings.length})</h4>
                      {selectedTask.aiFindings.length === 0 ? <p className="text-sm text-muted-foreground">Không có finding chi tiết.</p> : (
                        <div className="space-y-2">
                          {selectedTask.aiFindings.map((f, index) => (
                            <div key={`${f.field}-${f.label}-${index}`} className="rounded-md border p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="text-[11px]">{f.field || "unknown-field"}</Badge>
                                <Badge variant="outline" className="text-[11px]">{f.label || "unknown-label"}</Badge>
                                <Badge variant="outline" className={cn("text-[11px]", findingSeverityStyle(f.severity))}>{f.severity || "unknown"}</Badge>
                              </div>
                              <p className="mt-2 text-sm">{f.reason || "Không có reason"}</p>
                              {f.evidence && <p className="mt-1 text-xs text-muted-foreground">Evidence: {f.evidence}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {detailTrip && (
                  <div className="flex justify-end">
                    <Button asChild size="sm"><Link href={`${ROUTES.TRIPS}/${detailTrip.tripId}?taskId=${selectedTask.taskId}`}>Mở trang duyệt đầy đủ</Link></Button>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
