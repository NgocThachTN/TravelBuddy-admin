"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CarFront,
  Clock3,
  Clock,
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
  PlayCircle,
  Flag,
  Home,
} from "lucide-react";
import {
  dispatchTripModerationScanNow,
  fetchTripById,
  fetchTripModerationTaskDetail,
  fetchTripModerationTasks,
  reviewTrip,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  GetTripModerationTasksParams,
  MediaAttachment,
  TripDetail,
  TripCheckpoint,
  TripExpenseCategory,
  TripModerationFlaggedItem,
  TripModerationTaskDetail,
  TripModerationTaskListItem,
} from "@/types";
import {
  AI_MODERATION_STATUS_CODES,
  aiModerationStatusLabel,
  moderationStatusLabel,
  PARTICIPANT_STATUS_LABELS,
  tripStatusLabel,
  TRIP_STATUS_CODES,
  MODERATION_STATUS_CODES,
} from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import PaginationControl from "@/components/pagination-control";
import TripCheckpointMap from "./TripCheckpointMap";
import { checkpointLabelVi, checkpointMetaByType } from "./checkpoint-meta";
import {
  expenseTypeLabelVi,
  memberLevelLabelViWithCatalog,
  travelModeLabelVi,
  tripTypeLabelVi,
  vehicleTypeLabelVi,
} from "./trip-enum-labels";
import { useMemberLevelCatalog } from "@/hooks/use-member-level-catalog";

const PAGE_SIZE = 15;

type TaskStatusFilter = "openQueue" | "all" | "Open" | "Assigned" | "InReview" | "Resolved" | "Dismissed" | "Failed";
type ScanFilter = "all" | "Clean" | "Flagged" | "Error";

const TASK_STATUS_FILTER_LABELS: Record<TaskStatusFilter, string> = {
  openQueue: "Hàng chờ mở",
  all: "Tất cả",
  Open: "Mới tạo",
  Assigned: "Đã giao",
  InReview: "Đang duyệt",
  Resolved: "Đã xử lý",
  Dismissed: "Đã đóng",
  Failed: "Lỗi",
};

const TASK_STATUS_STYLES: Record<string, string> = {
  Open: "bg-transparent text-foreground border-border",
  Assigned: "bg-transparent text-foreground border-border",
  InReview: "bg-transparent text-foreground border-border",
  Resolved: "bg-transparent text-foreground border-border",
  Dismissed: "bg-transparent text-muted-foreground border-border",
  Failed: "bg-transparent text-destructive border-border",
};

const FLAGGED_FIELD_LABELS_VI: Record<string, string> = {
  title: "Tiêu đề",
  description: "Mô tả",
  rule: "Quy định",
  checkpoints: "Lộ trình điểm dừng",
  backTime: "Thời gian quay về",
  endTime: "Thời gian kết thúc",
  itemRequired: "Vật dụng cần mang",
};

const AVATAR_COLORS = [
  "bg-secondary text-foreground",
  "bg-secondary text-foreground",
  "bg-secondary text-foreground",
  "bg-secondary text-foreground",
  "bg-muted text-foreground",
];

function getTaskStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-secondary text-foreground border-border";
  const key = typeof status === "number" ? AI_MODERATION_STATUS_CODES[status] : status;
  return TASK_STATUS_STYLES[key] ?? "bg-secondary text-foreground border-border";
}

function isTaskActionable(status: number | string | null | undefined) {
  if (status === null || status === undefined) return false;
  const key = typeof status === "number" ? AI_MODERATION_STATUS_CODES[status] : status;
  return key === "Open" || key === "Assigned" || key === "InReview";
}

function getTripStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-slate-100 text-slate-800 border-slate-200";
  const code = typeof status === "number" ? TRIP_STATUS_CODES[status] : status;
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-800 border-slate-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Recruiting: "bg-indigo-100 text-indigo-800 border-indigo-200",
    AlmostFull: "bg-amber-100 text-amber-800 border-amber-200",
    Full: "bg-orange-100 text-orange-800 border-orange-200",
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Ongoing: "bg-green-100 text-green-800 border-green-200",
    Completed: "bg-teal-100 text-teal-800 border-teal-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Hidden: "bg-zinc-100 text-zinc-800 border-zinc-200",
    InReview: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return (code && styles[code]) || "bg-slate-100 text-slate-800 border-slate-200";
}

function getModerationStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-slate-100 text-slate-800 border-slate-200";
  const code = typeof status === "number" ? MODERATION_STATUS_CODES[status] : status;
  const styles: Record<string, string> = {
    Draft: "bg-slate-100 text-slate-800 border-slate-200",
    PendingReview: "bg-amber-100 text-amber-800 border-amber-200",
    Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
    Hidden: "bg-zinc-100 text-zinc-800 border-zinc-200",
  };
  return (code && styles[code]) || "bg-slate-100 text-slate-800 border-slate-200";
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

function getParticipantStatusLabel(status: string | number | null | undefined): string {
  if (status === null || status === undefined) return "Không xác định";
  const strStatus = String(status).toLowerCase();
  if (strStatus === "0" || strStatus === "joined") return "Đã tham gia";
  if (strStatus === "1" || strStatus === "left") return "Đã rời nhóm";
  if (strStatus === "2" || strStatus === "removed") return "Bị mời ra";
  if (strStatus === "3" || strStatus === "banned") return "Bị chặn";
  return String(status);
}

function getParticipantRoleLabel(
  participant: TripDetail["participants"][number],
  ownerUserId: string | null | undefined,
): string {
  if (participant.userId && ownerUserId && participant.userId === ownerUserId) {
    return "Chủ nhóm";
  }

  return "Thành viên";
}

const CHECKPOINT_TYPE_LABELS: Record<string, string> = {
  "0": "Bắt đầu",
  "1": "Điểm dừng",
  "2": "Điểm đến",
  "3": "Quay về",
  "4": "Kết thúc",
  "Start": "Bắt đầu",
  "Stop": "Điểm dừng",
  "Destination": "Điểm đến",
  "Return": "Quay về",
  "End": "Kết thúc",
};

function getCheckpointTypeLabel(type: string | number | null | undefined): string {
  if (type == null) return "Điểm dừng";
  return CHECKPOINT_TYPE_LABELS[String(type)] || "Điểm dừng";
}

const VEHICLE_LABELS: Record<string, string> = {
  "Motorbike": "Xe máy",
  "Car": "Ô tô",
  "Bicycle": "Xe đạp",
  "ElectricBike": "Xe điện",
  "Jeep": "Jeep",
  "PickupTruck": "Xe bán tải",
  "Walking": "Đi bộ",
  "Scooter": "Xe tay ga",
  "UnderboneMotorbike": "Xe côn tay",
  "OffroadMotorbike": "Xe cào cào",
  "Suv": "Ô tô 7 chỗ",
  "Bus": "Xe buýt", // Kept from original to ensure backward compatibility
  "Limousine": "Limousine", // Kept from original
  "TukTuk": "TukTuk", // Kept from original
  "Boat": "Thuyền đò", // Kept from original
  "Other": "Loại khác"
};

const TRIP_TYPE_LABELS: Record<string, string> = {
  "Adventure": "Mạo hiểm",
  "Relaxation": "Nghỉ dưỡng",
  "Cultural": "Văn hóa - lịch sử",
  "Touring": "Xuyên Việt đường dài",
  "Trekking": "Trekking leo núi",
  "Camping": "Cắm trại",
  "Beach": "Đi biển",
  "Ecotourism": "Du lịch sinh thái",
  "FoodTour": "Ẩm thực",
  "ExtremeSport": "Thể thao mạo hiểm",
  "Spiritual": "Tâm linh - hành hương",
  "Volunteer": "Tình nguyện",
  "Photography": "Nhiếp ảnh",
  "NightTour": "Săn đêm - bình minh",
  "Teambuilding": "Teambuilding",
  "Backpacking": "Phượt tiết kiệm",
  "CloudHunting": "Săn mây",
  "MountainPassChallenge": "Chinh phục cung đèo",
  "WeekendTrip": "Đi cuối tuần",
  "BorderlandExploration": "Khám phá biên giới",
  "SeasonalFlowerTrip": "Săn mùa hoa",
  "MotorbikeTour": "Phượt xe máy", // Kept from original
  "CityExploration": "Khám phá thành phố", // Kept from original
  "RoadTrip": "Đi đường dài", // Kept from original
  "IslandHopping": "Du lịch đảo", // Kept from original
  "Other": "Khác",
};

function translateVehicle(type: string | null | undefined): string {
  if (!type) return "Chưa xác định";
  return VEHICLE_LABELS[type] || type;
}

function translateTripType(type: string | null | undefined): string {
  if (!type) return "Chưa xác định";
  return TRIP_TYPE_LABELS[type] || type;
}

const EXPENSE_TYPE_LABELS: Record<string, string> = {
  Fuel: "Xăng xe",
  Food: "Ăn uống",
  Accommodation: "Lưu trú",
  Ticket: "Vé tham quan",
  Equipment: "Đồ dùng - thiết bị",
  Toll: "Phí cầu đường",
  Parking: "Gửi xe",
  Emergency: "Chi phí khẩn cấp",
  Shopping: "Mua sắm",
  Transportation: "Di chuyển",
  Activity: "Hoạt động trải nghiệm",
  Communication: "Liên lạc (SIM/4G)",
  Healthcare: "Y tế",
  MotorbikeRental: "Thuê xe",
  MotorbikeMaintenance: "Sửa xe",
  FerryBoatFee: "Vé tàu/phà",
  CoffeeBreak: "Cà phê nghỉ chân",
  LocalSpecialty: "Đặc sản địa phương",
  CampingFee: "Phí cắm trại",
  BorderPermitFee: "Phí giấy phép biên giới",
  Other: "Chi phí khác",
  Insurance: "Bảo hiểm", // Kept from original
  GuideService: "Hướng dẫn viên", // Kept from original
  TaxFee: "Thuế phí", // Kept from original
  HomestayFee: "Phí homestay" // Kept from original
};

function translateExpenseType(type: string | null | undefined): string {
  if (!type) return "Chi phí khác";
  return EXPENSE_TYPE_LABELS[type] || type;
}

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function normalizedCode(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

function moderationCodeStyle(value: string | null | undefined) {
  const code = normalizedCode(value);
  if (!code) return "bg-transparent text-muted-foreground border-border";
  if (code === "clean" || code === "safe") return "bg-transparent text-foreground border-border";
  if (code === "flagged") return "bg-transparent text-foreground border-border";
  if (code === "reject" || code === "blocked" || code === "violation" || code === "unsafe") {
    return "bg-transparent text-destructive border-border";
  }
  if (code === "error") return "bg-transparent text-destructive border-border";
  return "bg-transparent text-muted-foreground border-border";
}

function reviewPriorityStyle(value: string | null | undefined) {
  const code = normalizedCode(value);
  if (code === "high") return "bg-transparent text-destructive border-border";
  if (code === "medium") return "bg-transparent text-foreground border-border";
  if (code === "low") return "bg-secondary text-foreground border-border";
  return "bg-transparent text-muted-foreground border-border";
}

function recommendedDecisionStyle(value: string | null | undefined) {
  const code = normalizedCode(value);
  if (code === "approve") return "bg-transparent text-foreground border-border";
  if (code === "review" || code === "manual_review") return "bg-transparent text-foreground border-border";
  if (code === "reject") return "bg-transparent text-destructive border-border";
  return "bg-transparent text-muted-foreground border-border";
}

function contentPathLabelVi(contentPath: string | null | undefined) {
  const code = normalizedCode(contentPath);
  if (!code) return "Không rõ vị trí nội dung";
  return FLAGGED_FIELD_LABELS_VI[code] ?? contentPath ?? "Không rõ vị trí nội dung";
}

function flaggedSeverityStyle(value: string | null | undefined) {
  const code = normalizedCode(value);
  if (code === "high") return "bg-transparent text-destructive border-border";
  if (code === "medium") return "bg-transparent text-foreground border-border";
  if (code === "low") return "bg-secondary text-foreground border-border";
  return "bg-transparent text-muted-foreground border-border";
}

function flaggedSeverityOrder(value: string | null | undefined) {
  const code = normalizedCode(value);
  if (code === "high") return 3;
  if (code === "medium") return 2;
  if (code === "low") return 1;
  return 0;
}

function moderationSuccessStyle(value: boolean | null | undefined) {
  if (value === true) return "bg-transparent text-foreground border-border";
  if (value === false) return "bg-transparent text-destructive border-border";
  return "bg-transparent text-muted-foreground border-border";
}

function moderationSuccessLabel(value: boolean | null | undefined) {
  if (value === true) return "success: true";
  if (value === false) return "success: false";
  return "success: không rõ";
}

function ReviewerMetaCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type NormalizedModerationResult = {
  batchId: string | null;
  tripId: string;
  moderationCode: "Clean" | "Flagged";
  reviewPriority: "low" | "medium" | "high";
  overallSummary: string;
  flaggedItems: TripModerationTaskDetail["flaggedItems"];
  safeSignals: string[];
  missingContext: string[];
  recommendedDecision: "approve" | "review" | "reject";
};

function normalizeReviewPriority(
  input: string | null | undefined,
  flaggedItems: TripModerationTaskDetail["flaggedItems"],
): "low" | "medium" | "high" {
  const code = normalizedCode(input);
  if (code === "low" || code === "medium" || code === "high") return code;

  const maxSeverity = Math.max(...flaggedItems.map((item) => flaggedSeverityOrder(item.severity)), 0);
  if (maxSeverity >= 3) return "high";
  if (maxSeverity >= 2) return "medium";
  return "low";
}

function normalizeRecommendedDecision(
  input: string | null | undefined,
  moderationCode: "Clean" | "Flagged",
  reviewPriority: "low" | "medium" | "high",
): "approve" | "review" | "reject" {
  const code = normalizedCode(input);
  if (code === "approve" || code === "review" || code === "reject") return code;
  if (code === "manual_review") return "review";
  if (moderationCode === "Clean") return "approve";
  if (reviewPriority === "high") return "reject";
  return "review";
}

function normalizeModerationResult(task: TripModerationTaskDetail | null): NormalizedModerationResult | null {
  if (!task) return null;

  const originalCode = normalizedCode(task.moderationCode);
  const hasFlaggedItems = task.flaggedItems.length > 0;
  const moderationCode: "Clean" | "Flagged" =
    originalCode === "clean" && !hasFlaggedItems ? "Clean" : hasFlaggedItems || originalCode === "flagged" ? "Flagged" : "Clean";

  const flaggedItems = moderationCode === "Clean" ? [] : task.flaggedItems;
  const reviewPriority = normalizeReviewPriority(task.reviewPriority, flaggedItems);
  const recommendedDecision = normalizeRecommendedDecision(task.recommendedDecision, moderationCode, reviewPriority);

  const fallbackSummary =
    moderationCode === "Clean"
      ? "Nội dung chuyến đi tạm thời sạch, có thể xem nhanh trước khi phê duyệt."
      : flaggedItems.length > 0
        ? `Chuyến đi có ${flaggedItems.length} mục cần người duyệt kiểm tra kỹ trước khi ra quyết định.`
        : "Chuyến đi có dấu hiệu cần xem xét thủ công trước khi phê duyệt.";

  return {
    batchId: task.batchId ?? null,
    tripId: task.tripId,
    moderationCode,
    reviewPriority,
    overallSummary: task.overallSummary?.trim() || fallbackSummary,
    flaggedItems,
    safeSignals: task.safeSignals,
    missingContext: task.missingContext,
    recommendedDecision,
  };
}

export default function TripModerationTaskTable() {
  const memberLevelCatalog = useMemberLevelCatalog();
  const [items, setItems] = useState<TripModerationTaskListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dispatchNowLoading, setDispatchNowLoading] = useState(false);
  const [dispatchNowError, setDispatchNowError] = useState<string | null>(null);
  const [dispatchNowSuccess, setDispatchNowSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("openQueue");
  const [scanFilter, setScanFilter] = useState<ScanFilter>("all");
  const [page, setPage] = useState(1);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  
  const [selectedTask, setSelectedTask] = useState<TripModerationTaskDetail | null>(null);
  const [detailTrip, setDetailTrip] = useState<TripDetail | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingDecision, setPendingDecision] = useState<"Approve" | "Reject" | null>(null);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [routeStats, setRouteStats] = useState<{ distanceKm: number | null; durationMinutes: number | null }>({
    distanceKm: null,
    durationMinutes: null,
  });

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
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tác vụ kiểm duyệt");
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
    setSelectedTask(null);
    setDetailTrip(null);
    setDecisionError(null);
    setRejectReason("");
    setPendingDecision(null);

    try {
      const taskResult = await fetchTripModerationTaskDetail(taskId);
      const taskDetail = taskResult.data;
      setSelectedTask(taskDetail);

      if (taskDetail.tripExists && !taskDetail.isTripDeleted) {
        try {
          const tripResult = await fetchTripById(taskDetail.tripId);
          setDetailTrip(tripResult.data);
        } catch (tripErr) {
          setDetailError(tripErr instanceof Error ? tripErr.message : "Không thể tải đầy đủ dữ liệu chuyến đi.");
        }
      }
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Không thể tải chi tiết tác vụ");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleDispatchNow = useCallback(async () => {
    try {
      setDispatchNowLoading(true);
      setDispatchNowError(null);
      setDispatchNowSuccess(null);

      const result = await dispatchTripModerationScanNow();
      const { dispatchedTripCount, batchSizeUsed, hasPublishedMessage } = result.data;

      if (!hasPublishedMessage || dispatchedTripCount <= 0) {
        setDispatchNowSuccess(
          `Đã kích hoạt duyệt AI ngay nhưng hiện không có chuyến đi chờ quét`,
        );
      } else {
        setDispatchNowSuccess(
          `Đã kích hoạt duyệt AI ngay cho ${dispatchedTripCount} chuyến đi.`,
        );
      }

      await loadTasks(1);
      setPage(1);
    } catch (err) {
      setDispatchNowError(
        err instanceof Error ? err.message : "Không thể kích hoạt duyệt AI ngay.",
      );
    } finally {
      setDispatchNowLoading(false);
    }
  }, [loadTasks]);

  const submitDecision = useCallback(async (decision: "Approve" | "Reject") => {
    if (!selectedTask) return;

    const trimmedReason = rejectReason.trim();
    if (decision === "Reject" && !trimmedReason) {
      setDecisionError("Vui lòng nhập lý do từ chối để gửi cho chủ chuyến đi.");
      return;
    }

    try {
      setDecisionLoading(true);
      setPendingDecision(decision);
      setDecisionError(null);

      await reviewTrip(selectedTask.taskId, {
        decision,
        decisionNote: decision === "Reject" ? trimmedReason : undefined,
      });

      setDetailOpen(false);
      setSelectedTask(null);
      setDetailTrip(null);
      setRejectReason("");
      await loadTasks(page);
    } catch (err) {
      setDecisionError(err instanceof Error ? err.message : "Không thể cập nhật quyết định kiểm duyệt.");
    } finally {
      setDecisionLoading(false);
      setPendingDecision(null);
    }
  }, [selectedTask, rejectReason, loadTasks, page]);

  const resolvedTitle = useMemo(
    () => detailTrip?.title || selectedTask?.tripTitle || "(Không có tiêu đề)",
    [detailTrip, selectedTask],
  );

  const resolvedDescription = useMemo(
    () => detailTrip?.description || selectedTask?.tripDescription || null,
    [detailTrip, selectedTask],
  );

  const resolvedRule = useMemo(
    () => detailTrip?.rule || selectedTask?.tripRule || null,
    [detailTrip, selectedTask],
  );

  const resolvedItemRequired = useMemo(
    () => detailTrip?.itemRequired || selectedTask?.tripItemRequired || null,
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

  useEffect(() => {
    setRouteStats({
      distanceKm: typeof detailTrip?.itinerary?.distanceM === "number"
        ? Number((detailTrip.itinerary.distanceM / 1000).toFixed(1))
        : null,
      durationMinutes: typeof detailTrip?.itinerary?.durationS === "number"
        ? Math.round(detailTrip.itinerary.durationS / 60)
        : null,
    });
  }, [detailTrip]);

  const groupedExpenseItems = useMemo(() => {
    const fromBe = detailTrip?.estimatedCostBreakdowns ?? [];
    if (fromBe.length > 0) {
      return fromBe;
    }

    const rawExpenses = [
      ...(detailTrip?.expenseCategories ?? []),
      ...((detailTrip?.checkpoints ?? []).flatMap((checkpoint) => checkpoint.costs ?? [])),
    ];

    const seenExpenseKeys = new Set<string>();
    const groupedMap = new Map<string, number>();

    for (const expense of rawExpenses) {
      const dedupeKey = expense.tripExpenseCategoryId
        ? `id:${expense.tripExpenseCategoryId}`
        : `fallback:${expense.expenseType ?? "Other"}:${expense.tripCheckpointId ?? "trip"}:${expense.estimatedCost ?? 0}:${expense.note ?? ""}:${expense.isRequired}`;
      if (seenExpenseKeys.has(dedupeKey)) {
        continue;
      }

      seenExpenseKeys.add(dedupeKey);

      const expenseType = expense.expenseType?.trim() || "Other";
      const estimatedCost = Number.isFinite(expense.estimatedCost ?? NaN) ? (expense.estimatedCost ?? 0) : 0;
      const currentTotal = groupedMap.get(expenseType) ?? 0;
      groupedMap.set(expenseType, currentTotal + estimatedCost);
    }

    return Array.from(groupedMap.entries())
      .map(([expenseType, totalAmount]) => ({ expenseType, totalAmount }))
      .sort((left, right) => {
        if (right.totalAmount !== left.totalAmount) {
          return right.totalAmount - left.totalAmount;
        }
        return left.expenseType.localeCompare(right.expenseType);
      });
  }, [detailTrip?.checkpoints, detailTrip?.estimatedCostBreakdowns, detailTrip?.expenseCategories]);

  const totalEstimatedCost = useMemo(() => {
    if (
      typeof detailTrip?.totalEstimatedCost === "number"
      && Number.isFinite(detailTrip.totalEstimatedCost)
    ) {
      return detailTrip.totalEstimatedCost;
    }

    return groupedExpenseItems.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [detailTrip?.totalEstimatedCost, groupedExpenseItems]);

  const canReviewInPopup = useMemo(
    () => Boolean(selectedTask && detailTrip && isTaskActionable(selectedTask.status)),
    [selectedTask, detailTrip],
  );

  const safeSignals = selectedTask?.safeSignals ?? [];
  const missingContext = selectedTask?.missingContext ?? [];
  const moderationResult = useMemo(
    () => normalizeModerationResult(selectedTask),
    [selectedTask],
  );

  const sortedFlaggedItems = useMemo(() => {
    const flaggedItems = moderationResult?.flaggedItems ?? [];
    if (flaggedItems.length === 0) return [];
    return [...flaggedItems].sort((a, b) => {
      const severityDiff = flaggedSeverityOrder(b.severity) - flaggedSeverityOrder(a.severity);
      if (severityDiff !== 0) return severityDiff;
      return (a.contentPath ?? "").localeCompare(b.contentPath ?? "");
    });
  }, [moderationResult?.flaggedItems]);

  if (loading && items.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col h-full bg-card/40">
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
      </div>
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
        <div className="flex flex-wrap items-center gap-4 border-b p-4 bg-muted/10">
          <div className="relative min-w-[280px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tác vụ, tên chuyến đi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 bg-background pl-9 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-9 bg-background shadow-sm"
              onClick={() => void handleDispatchNow()}
              disabled={loading || dispatchNowLoading}
            >
              <PlayCircle className={cn("mr-2 h-4 w-4", dispatchNowLoading && "animate-spin")} />
              Kích hoạt duyệt AI ngay
            </Button>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatusFilter)}>
              <SelectTrigger className="h-9 w-[180px] bg-background shadow-sm"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openQueue">{TASK_STATUS_FILTER_LABELS.openQueue}</SelectItem>
                <SelectItem value="all">{TASK_STATUS_FILTER_LABELS.all}</SelectItem>
                <SelectItem value="Open">{TASK_STATUS_FILTER_LABELS.Open}</SelectItem>
                <SelectItem value="Assigned">{TASK_STATUS_FILTER_LABELS.Assigned}</SelectItem>
                <SelectItem value="InReview">{TASK_STATUS_FILTER_LABELS.InReview}</SelectItem>
                <SelectItem value="Resolved">{TASK_STATUS_FILTER_LABELS.Resolved}</SelectItem>
                <SelectItem value="Dismissed">{TASK_STATUS_FILTER_LABELS.Dismissed}</SelectItem>
                <SelectItem value="Failed">{TASK_STATUS_FILTER_LABELS.Failed}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scanFilter} onValueChange={(value) => setScanFilter(value as ScanFilter)}>
              <SelectTrigger className="h-9 w-[150px] bg-background shadow-sm"><SelectValue placeholder="Kết quả quét AI" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Clean">Mức sạch</SelectItem>
                <SelectItem value="Flagged">Mức cảnh báo</SelectItem>
                <SelectItem value="Error">Lỗi quét</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-9 w-9 bg-background shadow-sm" onClick={() => loadTasks(page)} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        {(dispatchNowError || dispatchNowSuccess) && (
          <div
            className={cn(
              "border-b px-5 py-3 text-sm",
              dispatchNowError
                ? "border-destructive/20 bg-destructive/5 text-destructive"
                : "border-emerald-200/60 bg-emerald-50/70 text-emerald-700",
            )}
          >
            {dispatchNowError ?? dispatchNowSuccess}
          </div>
        )}
        
        <div className="flex justify-between items-center bg-muted/20 px-5 py-2.5 border-b">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" />
            Hiển thị <span className="text-foreground tracking-tight text-sm font-semibold">{totalCount}</span> tác vụ
          </div>
        </div>

        <div className="min-w-full overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[80px]">Mã báo cáo</TableHead>
              <TableHead className="w-[30%] min-w-[280px]">Thông tin Chuyến đi</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden md:table-cell">AI Nhận định</TableHead>
              <TableHead className="w-[100px] text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted"><Shield className="h-5 w-5 text-muted-foreground" /></div>
                  <p className="text-sm font-medium">Không có tác vụ kiểm duyệt phù hợp</p>
                  <p className="mt-1 text-xs text-muted-foreground">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </TableCell>
              </TableRow>
            ) : (
              items.map((task) => (
              <TableRow key={task.taskId} className="hover:bg-muted/10">
                <TableCell>
                  <p className="text-xs font-semibold font-mono bg-secondary w-min px-1.5 py-0.5 rounded-md text-secondary-foreground">{task.taskId.slice(0, 8).toUpperCase()}</p>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1.5">
                    <p className="max-w-[300px] truncate text-sm font-bold text-primary hover:underline cursor-pointer" onClick={() => openTaskDetail(task.taskId)}>{task.tripTitle || "(Không có tiêu đề)"}</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 bg-muted">
                        <AvatarImage src={task.tripOwnerAvatarUrl || undefined} alt={task.tripOwnerName || "Chủ chuyến"} />
                        <AvatarFallback className={cn("text-[8px]", getAvatarColor(task.tripOwnerName || "U"))}>
                          {(task.tripOwnerName || "U").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p className="max-w-[150px] truncate text-xs font-medium text-muted-foreground">{task.tripOwnerName || "Không rõ chủ chuyến"}</p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-semibold", getTaskStatusStyle(task.status))}>
                        {aiModerationStatusLabel(task.status)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {tripStatusLabel(task.tripCurrentStatus)}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        Kết quả: {task.aiStatus === 2 ? "Cảnh báo" : "Sạch"}
                      </Badge>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex justify-center">
                    <Button size="sm" variant="default" className="shadow-sm font-semibold" onClick={() => openTaskDetail(task.taskId)}>Duyệt ngay</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
            )}
          </TableBody>
        </Table>
        </div>

        {totalPages > 1 && (
          <div className="border-t p-4"><PaginationControl currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        )}
      </Card>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDecisionError(null);
            setRejectReason("");
            setPendingDecision(null);
          }
        }}
      >
        
        <DialogContent className="sm:max-w-[96vw] max-w-[96vw] w-[96vw] sm:h-[96vh] h-[96vh] max-h-[96vh] overflow-hidden p-0 gap-0 rounded-xl border border-border bg-background shadow-xl flex flex-col md:flex-row">
  <div className="flex-1 min-w-0 flex flex-col border-r border-border bg-slate-50/50">
    <div className="p-6 border-b border-border bg-white flex flex-row items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedTask?.status}</Badge>
          <span className="text-sm font-medium text-muted-foreground font-mono">ID: {selectedTask?.taskId.slice(0, 8).toUpperCase()}</span>
        </div>
        <DialogTitle className="text-2xl font-bold mt-2 text-foreground">{resolvedTitle}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mt-1">
          Hồ sơ chuyến đi chi tiết bên dưới. Đối chiếu và duyệt bên phải.
        </DialogDescription>
      </div>
      {(detailLoading || detailTrip) && (
        <div className="flex items-center gap-2">
          {detailLoading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
          <Button variant="outline" size="sm" onClick={() => loadTasks(page)}>
            <RefreshCw className="h-4 w-4 mr-2" /> Tải lại
          </Button>
        </div>
      )}
    </div>

    <div className="flex-1 overflow-y-auto min-h-0 bg-white">
      {detailLoading && (
        <div className="p-6 space-y-6"><div className="h-24 w-full bg-muted animate-pulse rounded" /><div className="h-48 w-full bg-muted animate-pulse rounded" /></div>
      )}
      {detailError && (
        <div className="p-12 text-center text-red-500">
          <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
          {detailError}
        </div>
      )}
      {!detailLoading && !detailError && selectedTask && (
        <Tabs defaultValue="overview" className="w-full h-full flex flex-col">
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border p-2 px-6">
            <TabsList className="w-full max-w-2xl bg-slate-100">
              <TabsTrigger value="overview" className="flex-1 rounded-md">Tổng quan</TabsTrigger>
              <TabsTrigger value="itinerary" className="flex-1 rounded-md">Lịch trình</TabsTrigger>
              <TabsTrigger value="members" className="flex-1 rounded-md">Thành viên</TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6 overflow-y-auto">
            {detailTrip ? (
              <>
                <TabsContent value="overview" className="m-0">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-5 bg-card">
                      <h3 className="font-semibold mb-4 text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/> Thông tin & Lịch trình
                      </h3>
                      
                      <div className="mb-5 ml-2">
                        <div className="relative border-l-[3px] border-slate-200 mt-2 space-y-5 pb-2">
                          <div className="relative pl-6">
                            <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full -left-[8.5px] top-1 ring-4 ring-white"></div>
                            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Hạn đăng ký</p>
                            <p className="font-medium text-sm text-foreground">{formatDateTime(detailTrip?.registrationDeadline ?? selectedTask.tripRegistrationDeadline)}</p>
                          </div>
                          <div className="relative pl-6">
                            <div className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full -left-[8.5px] top-1 ring-4 ring-white"></div>
                            <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><PlayCircle className="w-3 h-3" /> Khởi hành</p>
                            <p className="font-medium text-sm text-foreground">{formatDateTime(detailTrip?.startTime ?? selectedTask.tripStartTime)}</p>
                          </div>
                          <div className="relative pl-6">
                            <div className="absolute w-3.5 h-3.5 bg-amber-500 rounded-full -left-[8.5px] top-1 ring-4 ring-white"></div>
                            <p className="text-[11px] text-amber-600 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><Flag className="w-3 h-3" /> Kết thúc</p>
                            <p className="font-medium text-sm text-foreground">{formatDateTime(detailTrip?.endTime ?? selectedTask.tripEndTime)}</p>
                          </div>
                          {detailTrip?.backTime && (
                          <div className="relative pl-6">
                            <div className="absolute w-3.5 h-3.5 bg-slate-400 rounded-full -left-[8.5px] top-1 ring-4 ring-white"></div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5 flex items-center gap-1.5"><Home className="w-3 h-3" /> Quay về</p>
                            <p className="font-medium text-sm text-foreground">{formatDateTime(detailTrip?.backTime)}</p>
                          </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                        <div className="flex justify-between"><span>Tiền cọc</span><span className="text-foreground font-medium">{formatVnd(detailTrip?.depositAmount)}</span></div>
                        <div className="flex justify-between items-center">
                          <span>Trạng thái chuyến</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getTripStatusStyle(detailTrip?.currentStatus ?? selectedTask.tripCurrentStatus))}>
                            {tripStatusLabel(detailTrip?.currentStatus ?? selectedTask.tripCurrentStatus)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Trạng thái duyệt</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getModerationStatusStyle(detailTrip?.moderationStatus ?? selectedTask.tripModerationStatus))}>
                            {moderationStatusLabel(detailTrip?.moderationStatus ?? selectedTask.tripModerationStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-5 bg-card">
                      <h3 className="font-semibold mb-4 text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground"/> Chủ chuyến & thống kê
                      </h3>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={detailTrip.owner?.avatarUrl || undefined} />
                          <AvatarFallback>OW</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {detailTrip.owner?.firstName} {detailTrip.owner?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">Cấp độ: {memberLevelLabelViWithCatalog(detailTrip.owner?.experienceLevel, memberLevelCatalog?.levels)}</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                        <div className="flex justify-between"><span>Số người tham gia</span><span className="text-foreground font-medium">{detailTrip?.participantCount || 0}</span></div>
                        <div className="flex justify-between"><span>Tối thiểu</span><span className="text-foreground font-medium">{detailTrip?.minParticipants || 0}</span></div>
                        <div className="flex justify-between"><span>Tối đa</span><span className="text-foreground font-medium">{detailTrip?.maxParticipants || 0}</span></div>
                        <div className="flex justify-between items-center">
                          <span>Trạng thái quét</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-bold border", 
                            String(detailTrip?.scanStatus) === "Clean" || detailTrip?.scanStatus === 1 ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                            String(detailTrip?.scanStatus) === "Flagged" || detailTrip?.scanStatus === 2 ? "bg-red-100 text-red-800 border-red-200" :
                            String(detailTrip?.scanStatus) === "NotScanned" || detailTrip?.scanStatus === 0 ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-amber-100 text-amber-800 border-amber-200"
                          )}>
                            {String(detailTrip?.scanStatus) === "Clean" || detailTrip?.scanStatus === 1 ? "Sạch" : 
                             String(detailTrip?.scanStatus) === "Flagged" || detailTrip?.scanStatus === 2 ? "Cảnh báo" :
                             String(detailTrip?.scanStatus) === "Error" || detailTrip?.scanStatus === 3 ? "Lỗi" :
                             String(detailTrip?.scanStatus) === "NotScanned" || detailTrip?.scanStatus === 0 ? "Chưa quét" : (detailTrip?.scanStatus || "N/A")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {detailTrip.mediaAttachments && detailTrip.mediaAttachments.length > 0 && (
                        <div className="md:col-span-2 border rounded-lg p-5 bg-card">
                          <h3 className="font-semibold mb-4 text-base">Tệp đính kèm ({detailTrip.mediaAttachments.length})</h3>
                          <div className="flex flex-wrap gap-2">
                            {detailTrip.mediaAttachments.map((m: MediaAttachment) => (
                              <img 
                                key={m.mediaAttachmentId} 
                                src={m.mediaUrl} 
                                alt="Tệp chuyến đi"
                                className="w-32 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition"
                                onClick={() => setSelectedMediaUrl(m.mediaUrl)}
                              />
                            ))}
                          </div>
                        </div>
                    )}
                    <div className="md:col-span-2 border rounded-lg p-5 bg-card">
                      <h3 className="font-semibold mb-4 text-base">Phân loại chuyến đi & Chi phí dự kiến</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Loại chuyến đi</h4>
                              <div className="flex flex-wrap gap-2">
                                  {(detailTrip.tripTypes && detailTrip.tripTypes.length > 0) ? detailTrip.tripTypes.map(tt => (
                                      <Badge key={tt.tripTypeId} className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none">{translateTripType(tt.tripType)}</Badge>
                                  )) : <span className="text-sm text-muted-foreground italic">Trống</span>}
                              </div>
                          </div>
                          <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Phương tiện</h4>
                              <div className="flex flex-wrap gap-2">
                                  {(detailTrip.tripVehicles && detailTrip.tripVehicles.length > 0) ? detailTrip.tripVehicles.map(vv => (
                                      <Badge key={vv.tripVehicleId} variant="outline" className="text-slate-600 border-slate-300">{translateVehicle(vv.vehicleType)}</Badge>
                                  )) : <span className="text-sm text-muted-foreground italic">Trống</span>}
                              </div>
                          </div>
                          <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-3 border-b pb-2">Tổng chi phí dự kiến</h4>
                              <div className="space-y-3">
                                  <div className="flex justify-between items-center text-sm border-l-2 pl-3 border-slate-300">
                                    <span className="font-semibold text-foreground">Tổng cộng</span>
                                    <span className="font-bold text-emerald-600">{formatVnd(totalEstimatedCost)}</span>
                                  </div>
                                  {groupedExpenseItems.length > 0 ? 
                                  groupedExpenseItems.map((item) => (
                                      <div key={item.expenseType} className="flex flex-col gap-1 text-sm border-l-2 pl-3 border-slate-200">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium text-foreground">{translateExpenseType(item.expenseType)}</span>
                                            <span className="font-bold text-emerald-600">{formatVnd(item.totalAmount)}</span>
                                          </div>
                                      </div>
                                  )) : <span className="text-sm text-muted-foreground italic">Không có chi phí dự kiến.</span>}
                              </div>
                          </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 border rounded-lg p-5 bg-card">
                      <h3 className="font-semibold mb-4 text-base">Mô tả</h3>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {detailTrip.description || "Không có mô tả."}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="itinerary" className="m-0">
                  {sortedCheckpoints.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-10">Không có điểm trình</p>
                  ) : (
                    <div className="flex flex-col h-full gap-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/30 p-4 rounded-lg border">
                        <h3 className="font-bold text-foreground">Lộ trình ({sortedCheckpoints.length} điểm)</h3>
                        <div className="flex items-center gap-6 mt-2 sm:mt-0 text-sm text-muted-foreground font-medium">
                          <span>Quãng đường: {routeStats.distanceKm !== null ? `${routeStats.distanceKm.toFixed(1)} km` : "—"}</span>
                          <span>Thời gian: {routeStats.durationMinutes !== null ? formatDuration(routeStats.durationMinutes * 60) : "—"}</span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 h-full">
                        {/* Left: Itinerary List */}
                        <div className="space-y-4 pr-2 overflow-y-auto max-h-[600px] scrollbar-thin">
                          {sortedCheckpoints.map((cp: TripCheckpoint, index: number) => {
                            const checkpointCosts = Array.isArray(cp.costs) ? cp.costs : [];
                            const categoryExpenses = detailTrip.expenseCategories?.filter((e: TripExpenseCategory) => e.tripCheckpointId === cp.tripCheckpointId) || [];
                            const cpExpenses = checkpointCosts.length > 0 ? checkpointCosts : categoryExpenses;
                            
                            // fallback color styles based on checkpoint label
                            const typeLabel = getCheckpointTypeLabel(cp.tripCheckpointType);
                            let bgPoint = "bg-blue-100 text-blue-700";
                            let TypeIcon = MapPin;
                            
                            if (typeLabel === "Bắt đầu") {
                              bgPoint = "bg-emerald-100 text-emerald-700";
                              TypeIcon = PlayCircle;
                            } else if (typeLabel === "Kết thúc") {
                              bgPoint = "bg-amber-100 text-amber-700";
                              TypeIcon = Flag;
                            } else if (typeLabel === "Quay về") {
                              bgPoint = "bg-slate-200 text-slate-700";
                              TypeIcon = Home;
                            }

                            return (
                              <div key={cp.tripCheckpointId} className="p-4 border rounded-lg flex flex-col gap-2 bg-card">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-semibold text-muted-foreground uppercase">Điểm {index + 1}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${bgPoint}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    {typeLabel}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-primary flex items-center justify-between">
                                  {cp.locationName}
                                  <span className="text-xs text-muted-foreground font-normal">{formatDateTime(cp.plannedAt)}</span>
                                </h4>
                              <p className="text-sm text-foreground">{cp.displayAddress || cp.locationName}</p>
                              {cp.note && <p className="text-sm text-muted-foreground bg-muted p-2 rounded">{cp.note}</p>}
                              
                              {/* Expenses for this checkpoint */}
                              {cpExpenses.length > 0 && (
                                <div className="mt-2 pt-3 border-t border-dashed">
                                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-md p-3">
                                    <p className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
                                      <Wallet className="h-3.5 w-3.5" /> Chi phí tại điểm
                                    </p>
                                    <div className="space-y-1.5">
                                      {cpExpenses.map((exp: TripExpenseCategory, i: number) => {
                                        const rawLabel = exp.expenseType || "Other";
                                        const label = translateExpenseType(rawLabel);
                                        const amount = exp.estimatedCost || 0;
                                        return (
                                          <div key={exp.tripExpenseCategoryId || i} className="flex justify-between items-center text-xs">
                                            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                              {label}
                                            </span>
                                            <span className="font-semibold text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded">{formatVnd(amount)}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Right: Map */}
                      <div className="h-[600px] border rounded-lg overflow-hidden sticky top-0">
                        <TripCheckpointMap
                          checkpoints={sortedCheckpoints}
                          itinerary={detailTrip?.itinerary || null}
                          onRouteStatsChange={setRouteStats}
                        />
                      </div>
                    </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="members" className="m-0">
                  {detailTrip.participants && detailTrip.participants.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {detailTrip.participants.map(member => (
                        <div key={member.tripParticipantId} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback>{member.firstName?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Vai trò: {getParticipantRoleLabel(member, detailTrip.owner?.userId)}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] whitespace-nowrap",
                            String(member.participantStatusId).toLowerCase() === "0" || String(member.participantStatusId).toLowerCase() === "joined" ? "bg-green-50 text-green-700 border-green-200" :
                            String(member.participantStatusId).toLowerCase() === "1" || String(member.participantStatusId).toLowerCase() === "left" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            String(member.participantStatusId).toLowerCase() === "2" || String(member.participantStatusId).toLowerCase() === "removed" ? "bg-red-50 text-red-700 border-red-200" :
                            String(member.participantStatusId).toLowerCase() === "3" || String(member.participantStatusId).toLowerCase() === "banned" ? "bg-slate-50 text-slate-700 border-slate-200" : ""
                          )}>
                            {getParticipantStatusLabel(member.participantStatusId)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">Không có thành viên nào.</p>
                  )}
                </TabsContent>
              </>
            ) : (
              <p className="text-center mt-10 text-muted-foreground">Chưa có thông tin</p>
            )}
          </div>
        </Tabs>
      )}
    </div>
  </div>

  <div className="w-full md:w-[450px] shrink-0 flex flex-col bg-slate-50 border-l border-border h-full overflow-hidden">
    <div className="p-5 border-b border-border bg-white flex flex-col gap-3">
      <h3 className="font-bold flex items-center gap-2 text-base">
        <Shield className="h-5 w-5 text-amber-500" /> Hệ thống AI đánh giá
      </h3>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-1 shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-sm text-muted-foreground">Trạng thái quét (Scan)</span>
            <Badge variant="outline" className={cn("font-medium text-[10px] uppercase border", selectedTask?.success ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200")}>
              {selectedTask?.success ? "Thành công" : "Thất bại"}
            </Badge>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-sm text-muted-foreground">Kết quả</span>
            <Badge variant={moderationResult?.moderationCode === 'Flagged' ? "destructive" : "outline"} className={cn("text-[11px]", moderationResult?.moderationCode !== 'Flagged' && "bg-emerald-100/50 text-emerald-700 border-emerald-200")}>
              {moderationResult?.moderationCode === 'Flagged' ? "Cảnh báo" : "Sạch"}
            </Badge>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span className="text-sm text-muted-foreground">Ưu tiên review</span>
            <span className={cn("text-sm font-bold", 
              moderationResult?.reviewPriority === 'high' ? "text-red-600" : 
              moderationResult?.reviewPriority === 'medium' ? "text-amber-600" : "text-emerald-600"
            )}>
              {moderationResult?.reviewPriority === 'high' ? 'Cao' : moderationResult?.reviewPriority === 'medium' ? 'Trung bình' : 'Thấp'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Khuyến nghị</span>
            <span className="text-sm font-bold text-slate-700">
              {moderationResult?.recommendedDecision === 'reject' ? 'Từ chối' : 
               moderationResult?.recommendedDecision === 'review' ? 'Cần duyệt thủ công' : 'Có thể duyệt'}
            </span>
          </div>
        </div>
      </div>
      {selectedTask?.scanErrorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{selectedTask.scanErrorMessage}</span>
        </div>
      )}
    </div>
    
    <div className="flex-1 overflow-y-auto p-5 space-y-6">
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase mb-3 tracking-wider">Tóm tắt chung</p>
        <p className="text-sm bg-white p-4 border rounded-xl leading-relaxed shadow-sm text-foreground">
          {moderationResult?.overallSummary || "AI không cung cấp tóm tắt."}
        </p>
      </div>
      
      <div>
        <p className="text-xs text-destructive font-semibold uppercase mb-3 flex items-center gap-1 tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" /> Mục bị gắn cờ ({sortedFlaggedItems.length})
        </p>
        
        {sortedFlaggedItems.length > 0 ? (
          <div className="space-y-3">
            {sortedFlaggedItems.map((fi: TripModerationFlaggedItem, i: number) => (
              <div key={i} className="text-sm bg-red-50/50 border border-red-100/50 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-800 uppercase tracking-wider text-[10px]">{fi.severity} risk</span>
                  <Badge variant="outline" className="text-[10px] bg-white border-red-200 text-red-700">{fi.contentPath}</Badge>
                </div>
                <p className="text-red-900 font-semibold mt-1">{fi.reason}</p>
                <div className="bg-white/60 p-2 rounded text-red-700 italic border border-red-100/50">&quot;{fi.evidence}&quot;</div>
                <div className="mt-2 pt-2 border-t border-red-200/50">
                  <p className="text-red-800 font-medium"><span className="opacity-70">Kiểm tra:</span> {fi.whatReviewerShouldCheck}</p>
                  <p className="text-red-800 font-medium mt-1"><span className="opacity-70">Gợi ý:</span> {fi.suggestedReviewerAction}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground italic">Không có mục nào bị gắn cờ.</p>
        )}
      </div>

      <div>
        <p className="text-xs text-emerald-600 font-semibold uppercase mb-3 flex items-center gap-1 tracking-wider">
          <Shield className="w-3.5 h-3.5" /> Tín hiệu an toàn ({safeSignals.length})
        </p>
        {safeSignals.length > 0 ? (
          <div className="space-y-2">
            {safeSignals.map((signal: string, i: number) => (
              <div key={i} className="text-sm bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-xl flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="text-emerald-800/90 leading-relaxed break-words">{signal}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground italic">Không có tín hiệu an toàn nào.</p>
        )}
      </div>
      
      <div>
        <p className="text-xs text-amber-600 font-semibold uppercase mb-3 flex items-center gap-1 tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" /> Ngữ cảnh còn thiếu ({missingContext.length})
        </p>
        {missingContext.length > 0 ? (
          <div className="space-y-2">
            {missingContext.map((ctxMsg: string, i: number) => (
              <div key={i} className="text-sm bg-amber-50/50 border border-amber-100/50 p-3 rounded-xl flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <p className="text-amber-800/90 leading-relaxed break-words">{ctxMsg}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground italic">Không có ghi chú thiếu ngữ cảnh.</p>
        )}
      </div>
    </div>

    <div className="p-5 border-t border-border bg-white mt-auto space-y-4 shadow-[0_-5px_15px_rgba(0,0,0,0.03)] z-10 transition-all">
      <div>
        <Label className={cn("text-xs font-semibold uppercase mb-2 block tracking-wider", decisionError ? "text-destructive" : "text-muted-foreground")}>
          Lời phê (Bắt buộc nếu Từ chối)
        </Label>
        <Textarea 
          className={cn("min-h-24 resize-none bg-slate-50 focus:bg-white text-sm", decisionError && "border-destructive focus-visible:ring-destructive")} 
          placeholder="Nhập lý do chi tiết để gửi cho người dùng..."
          value={rejectReason}
          onChange={e => {
            setRejectReason(e.target.value);
            if (decisionError) setDecisionError(null);
          }}
        />
        {decisionError && <p className="text-destructive text-sm mt-2">{decisionError}</p>}
      </div>
      <div className="grid flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-11 transition-all" 
            disabled={decisionLoading || pendingDecision === "Approve"} 
            onClick={() => submitDecision("Reject")}
          >
            {decisionLoading && pendingDecision === "Reject" ? <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> : null}
            Từ chối
          </Button>
          <Button 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 h-11 transition-all" 
            disabled={decisionLoading || pendingDecision === "Reject"} 
            onClick={() => submitDecision("Approve")}
          >
            {decisionLoading && pendingDecision === "Approve" ? <RefreshCw className="mr-2 h-4 w-4 animate-spin"/> : null}
            Duyệt chuyến đi
          </Button>
        </div>
      </div>
    </div>
  </div>
</DialogContent>

      </Dialog>

      {/* Hộp thoại phóng to tệp */}
      <Dialog open={!!selectedMediaUrl} onOpenChange={(open) => !open && setSelectedMediaUrl(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-1 bg-transparent border-none shadow-none flex justify-center items-center [&>button]:bg-white [&>button]:text-black [&>button]:opacity-100 [&>button]:hover:bg-slate-200 [&>button]:p-2 [&>button]:rounded-full [&>button]:shadow-xl sm:[&>button]:-right-4 sm:[&>button]:-top-4">
          <DialogTitle className="sr-only">Hình ảnh phóng to</DialogTitle>
          <DialogDescription className="sr-only">Chi tiết hình ảnh đính kèm của chuyến đi</DialogDescription>
          {selectedMediaUrl && (
            <img 
              src={selectedMediaUrl} 
              alt="Tệp đang phóng to"
              className="max-w-full max-h-[90vh] object-contain rounded-md" 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
