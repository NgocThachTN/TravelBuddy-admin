"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarClock,
  CarFront,
  CheckCircle,
  Clock3,
  FileText,
  Image as ImageIcon,
  Map,
  MapPin,
  NotebookPen,
  PackageOpen,
  Pencil,
  RefreshCw,
  Route,
  Shield,
  ShieldCheck,
  Star,
  Tag,
  Type,
  Users,
  UserRoundCog,
  Wallet,
  XCircle,
} from "lucide-react";
import { fetchTripById, overrideTripByAdmin, reviewTrip } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  ModerationDecisionCode,
  Role,
  TripDetail,
  TripStatusCode,
  UpdateAdminTripPayload,
} from "@/types";
import {
  moderationStatusLabel,
  PARTICIPANT_STATUS_LABELS,
  SCAN_STATUS_LABELS,
  tripStatusLabel,
  TRIP_STATUS_CODES,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
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
import TripCheckpointMap from "@/app/dashboard/moderation/components/TripCheckpointMap";
import { checkpointLabelVi, checkpointMetaByType } from "@/app/dashboard/moderation/components/checkpoint-meta";
import {
  expenseTypeLabelVi,
  memberLevelLabelViWithCatalog,
  travelModeLabelVi,
  tripTypeLabelVi,
  vehicleTypeLabelVi,
} from "@/app/dashboard/moderation/components/trip-enum-labels";
import { useMemberLevelCatalog } from "@/hooks/use-member-level-catalog";

const STATUS_STYLES: Record<string, string> = {
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

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getStatusStyle(status: number | string | null | undefined) {
  if (status === null || status === undefined) return "bg-gray-100 text-gray-500";
  const code = typeof status === "number" ? TRIP_STATUS_CODES[status] : status;
  return (code && STATUS_STYLES[code]) || "bg-gray-100 text-gray-500";
}

function getAvatarColor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVnd(amount: number | null) {
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

function formatCoordinates(lat: number | null | undefined, lng: number | null | undefined) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "Chưa có tọa độ";
  return `${lat!.toFixed(6)}, ${lng!.toFixed(6)}`;
}

function participantStatusLabel(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return PARTICIPANT_STATUS_LABELS[value] ?? `${value}`;
  const normalized = String(value).trim().toLowerCase();
  const labels: Record<string, string> = {
    joined: "Đã tham gia",
    left: "Đã rời",
    removed: "Bị xoá",
    banned: "Bị cấm",
  };
  return labels[normalized] ?? String(value);
}

function participantRoleLabel(
  participant: TripDetail["participants"][number],
  ownerUserId: string | null | undefined,
) {
  if (participant.userId && ownerUserId && participant.userId === ownerUserId) {
    return "Chủ nhóm";
  }

  return "Thành viên";
}

function scanStatusLabelVi(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return SCAN_STATUS_LABELS[value] ?? `${value}`;
  const normalized = String(value).trim().toLowerCase();
  const labels: Record<string, string> = {
    notscanned: "Chưa quét",
    clean: "Sạch",
    flagged: "Cảnh báo",
    error: "Lỗi",
  };
  return labels[normalized] ?? String(value);
}

function mediaTypeLabelVi(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "Không rõ";
  if (typeof value === "number") {
    const numericLabels: Record<number, string> = {
      0: "Ảnh",
      1: "Video",
      2: "Âm thanh",
      3: "Tệp",
      4: "Khác",
    };
    return numericLabels[value] ?? `${value}`;
  }
  const normalized = String(value).trim().toLowerCase();
  const labels: Record<string, string> = {
    image: "Ảnh",
    video: "Video",
    audio: "Âm thanh",
    file: "Tệp",
    other: "Khác",
  };
  return labels[normalized] ?? String(value);
}

function toDateTimeLocalInput(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocalInput(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function normalizeTripStatusCode(value: number | string | null | undefined): TripStatusCode {
  if (typeof value === "number") {
    return TRIP_STATUS_CODES[value] ?? "Draft";
  }

  if (typeof value === "string") {
    const matchedStatus = TRIP_STATUS_CODES.find((status) => status === value);
    if (matchedStatus) return matchedStatus;
  }

  return "Draft";
}

interface TripEditFormState {
  title: string;
  description: string;
  rule: string;
  itemRequired: string;
  currentStatus: TripStatusCode;
  startTime: string;
  endTime: string;
  backTime: string;
  registrationDeadline: string;
  minParticipants: string;
  maxParticipants: string;
  isApprovalMemberEnable: boolean;
}

function buildTripEditFormState(trip: TripDetail): TripEditFormState {
  return {
    title: trip.title ?? "",
    description: trip.description ?? "",
    rule: trip.rule ?? "",
    itemRequired: trip.itemRequired ?? "",
    currentStatus: normalizeTripStatusCode(trip.currentStatus),
    startTime: toDateTimeLocalInput(trip.startTime),
    endTime: toDateTimeLocalInput(trip.endTime),
    backTime: toDateTimeLocalInput(trip.backTime),
    registrationDeadline: toDateTimeLocalInput(trip.registrationDeadline),
    minParticipants: trip.minParticipants?.toString() ?? "",
    maxParticipants: trip.maxParticipants?.toString() ?? "",
    isApprovalMemberEnable: !!trip.isApprovalMemberEnable,
  };
}

function mapEditFormToPayload(
  form: TripEditFormState,
  baseline: TripEditFormState,
): UpdateAdminTripPayload {
  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) return undefined;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const payload: UpdateAdminTripPayload = {};

  if (form.title !== baseline.title) payload.title = form.title.trim();
  if (form.description !== baseline.description) payload.description = form.description.trim();
  if (form.rule !== baseline.rule) payload.rule = form.rule;
  if (form.itemRequired !== baseline.itemRequired) payload.itemRequired = form.itemRequired;
  if (form.startTime !== baseline.startTime) payload.startTime = fromDateTimeLocalInput(form.startTime);
  if (form.endTime !== baseline.endTime) payload.endTime = fromDateTimeLocalInput(form.endTime);
  if (form.backTime !== baseline.backTime) payload.backTime = fromDateTimeLocalInput(form.backTime);
  if (form.registrationDeadline !== baseline.registrationDeadline) {
    payload.registrationDeadline = fromDateTimeLocalInput(form.registrationDeadline);
  }
  if (form.minParticipants !== baseline.minParticipants) {
    payload.minParticipants = parseOptionalNumber(form.minParticipants);
  }
  if (form.maxParticipants !== baseline.maxParticipants) {
    payload.maxParticipants = parseOptionalNumber(form.maxParticipants);
  }
  if (form.isApprovalMemberEnable !== baseline.isApprovalMemberEnable) {
    payload.isApprovalMemberEnable = form.isApprovalMemberEnable;
  }
  if (form.currentStatus !== baseline.currentStatus) {
    const currentStatusValue = TRIP_STATUS_CODES.indexOf(form.currentStatus);
    if (currentStatusValue >= 0) {
      payload.currentStatus = currentStatusValue;
    }
  }

  return payload;
}

interface ModerationDialogProps {
  open: boolean;
  decision: ModerationDecisionCode | null;
  onClose: () => void;
  onConfirm: (note: string) => Promise<void>;
  loading: boolean;
}

function ModerationDialog({ open, decision, onClose, onConfirm, loading }: ModerationDialogProps) {
  const [note, setNote] = useState("");
  const isApprove = decision === "Approve";

  async function handleConfirm() {
    if (!isApprove && !note.trim()) return;
    await onConfirm(note.trim());
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) { setNote(""); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isApprove ? "Duyệt chuyến đi" : "Từ chối chuyến đi"}</DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Chuyến đi sẽ được phê duyệt và công khai cho người dùng."
              : "Chuyến đi sẽ bị từ chối. Vui lòng nhập lý do."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="moderation-note">Ghi chú</Label>
          <Textarea
            id="moderation-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder={isApprove ? "Ghi chú (không bắt buộc)..." : "Nhập lý do từ chối..."}
          />
          <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Huỷ</Button>
          <Button
            variant={isApprove ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={loading || (!isApprove && !note.trim())}
          >
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            {isApprove ? "Duyệt" : "Từ chối"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TripEditDialogProps {
  open: boolean;
  form: TripEditFormState;
  loading: boolean;
  onClose: () => void;
  onChange: (next: TripEditFormState) => void;
  onSubmit: () => Promise<void>;
}

function TripEditDialog({ open, form, loading, onClose, onChange, onSubmit }: TripEditDialogProps) {
  const setField = <K extends keyof TripEditFormState>(key: K, value: TripEditFormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Chỉnh sửa chuyến đi
          </DialogTitle>
          <DialogDescription>Cập nhật các trường thông tin của chuyến đi.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <section className="space-y-3 rounded-lg border p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <NotebookPen className="h-3.5 w-3.5" />
              Thông tin cơ bản
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="trip-title" className="inline-flex items-center gap-1.5"><Type className="h-3.5 w-3.5" />Tiêu đề</Label>
              <Input id="trip-title" value={form.title} maxLength={255} onChange={(event) => setField("title", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-description" className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" />Mô tả</Label>
              <Textarea id="trip-description" rows={4} value={form.description} onChange={(event) => setField("description", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-status" className="inline-flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Trạng thái chuyến đi
              </Label>
              <Select value={form.currentStatus} onValueChange={(value) => setField("currentStatus", value as TripStatusCode)}>
                <SelectTrigger id="trip-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_STATUS_CODES.map((statusCode) => (
                    <SelectItem key={statusCode} value={statusCode}>
                      {tripStatusLabel(statusCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Thời gian
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="trip-registration-deadline">Hạn đăng ký</Label>
                <Input id="trip-registration-deadline" type="datetime-local" value={form.registrationDeadline} onChange={(event) => setField("registrationDeadline", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-start-time">Bắt đầu</Label>
                <Input id="trip-start-time" type="datetime-local" value={form.startTime} onChange={(event) => setField("startTime", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-end-time">Kết thúc</Label>
                <Input id="trip-end-time" type="datetime-local" value={form.endTime} onChange={(event) => setField("endTime", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-back-time">Quay về</Label>
                <Input id="trip-back-time" type="datetime-local" value={form.backTime} onChange={(event) => setField("backTime", event.target.value)} />
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-lg border p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <UserRoundCog className="h-3.5 w-3.5" />
              Quy mô thành viên
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="trip-min-participants">Số người tối thiểu</Label>
                <Input id="trip-min-participants" type="number" min={1} value={form.minParticipants} onChange={(event) => setField("minParticipants", event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-max-participants">Số người tối đa</Label>
                <Input id="trip-max-participants" type="number" min={1} value={form.maxParticipants} onChange={(event) => setField("maxParticipants", event.target.value)} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
              <div className="space-y-0.5">
                <p className="inline-flex items-center gap-1.5 font-medium"><ShieldCheck className="h-3.5 w-3.5" />Duyệt thành viên</p>
                <p className="text-xs text-muted-foreground">Bật để yêu cầu chủ trip duyệt yêu cầu tham gia.</p>
              </div>
              <Switch checked={form.isApprovalMemberEnable} onCheckedChange={(value) => setField("isApprovalMemberEnable", value)} />
            </div>
          </section>

          <section className="space-y-3 rounded-lg border p-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <PackageOpen className="h-3.5 w-3.5" />
              Nội dung bổ sung
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="trip-rule">Quy định</Label>
              <Textarea id="trip-rule" rows={3} value={form.rule} onChange={(event) => setField("rule", event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-item-required">Vật dụng cần mang</Label>
              <Textarea id="trip-item-required" rows={3} value={form.itemRequired} onChange={(event) => setField("itemRequired", event.target.value)} />
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Huỷ</Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TripDetailClientProps {
  role: Role;
}

export default function TripDetailClient({ role }: TripDetailClientProps) {
  const memberLevelCatalog = useMemberLevelCatalog();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.tripId as string;
  const taskId = searchParams.get("taskId")?.trim() ?? "";
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<ModerationDecisionCode | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [routeStats, setRouteStats] = useState<{ distanceKm: number | null; durationMinutes: number | null }>({
    distanceKm: null,
    durationMinutes: null,
  });
  const [editForm, setEditForm] = useState<TripEditFormState>({
    title: "",
    description: "",
    rule: "",
    itemRequired: "",
    currentStatus: "Draft",
    startTime: "",
    endTime: "",
    backTime: "",
    registrationDeadline: "",
    minParticipants: "",
    maxParticipants: "",
    isApprovalMemberEnable: false,
  });
  const [editBaseline, setEditBaseline] = useState<TripEditFormState>({
    title: "",
    description: "",
    rule: "",
    itemRequired: "",
    currentStatus: "Draft",
    startTime: "",
    endTime: "",
    backTime: "",
    registrationDeadline: "",
    minParticipants: "",
    maxParticipants: "",
    isApprovalMemberEnable: false,
  });

  const loadTrip = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTripById(tripId);
      setTrip(result.data);
      setRouteStats({
        distanceKm: typeof result.data.itinerary?.distanceM === "number"
          ? Number((result.data.itinerary.distanceM / 1000).toFixed(1))
          : null,
        durationMinutes: typeof result.data.itinerary?.durationS === "number"
          ? Math.round(result.data.itinerary.durationS / 60)
          : null,
      });
      const initialForm = buildTripEditFormState(result.data);
      setEditForm(initialForm);
      setEditBaseline(initialForm);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải chi tiết chuyến đi");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const sortedCheckpoints = useMemo(
    () => [...(trip?.checkpoints ?? [])].sort((a, b) => a.sequenceNo - b.sequenceNo),
    [trip?.checkpoints],
  );

  const orderedMediaAttachments = useMemo(
    () => [...(trip?.mediaAttachments ?? [])].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)),
    [trip?.mediaAttachments],
  );

  const groupedExpenseItems = useMemo(() => {
    const fromBe = trip?.estimatedCostBreakdowns ?? [];
    if (fromBe.length > 0) {
      return fromBe;
    }

    const rawExpenses = [
      ...(trip?.expenseCategories ?? []),
      ...((trip?.checkpoints ?? []).flatMap((checkpoint) => checkpoint.costs ?? [])),
    ];

    const seenExpenseKeys = new Set<string>();
    const groupedMap = new globalThis.Map<string, number>();

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
  }, [trip?.checkpoints, trip?.estimatedCostBreakdowns, trip?.expenseCategories]);

  const totalEstimatedCost = useMemo(() => {
    if (
      typeof trip?.totalEstimatedCost === "number"
      && Number.isFinite(trip.totalEstimatedCost)
    ) {
      return trip.totalEstimatedCost;
    }

    return groupedExpenseItems.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [groupedExpenseItems, trip?.totalEstimatedCost]);

  async function handleDecisionConfirm(note: string) {
    if (!decision || !trip || !taskId) return;
    try {
      setDecisionLoading(true);
      await reviewTrip(taskId, {
        decision,
        decisionNote: note || undefined,
      });
      setDecision(null);
      await loadTrip();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setDecisionLoading(false);
    }
  }

  async function handleSaveTripEdit() {
    if (!trip) return;
    try {
      setEditLoading(true);
      const payload = mapEditFormToPayload(editForm, editBaseline);
      if (Object.keys(payload).length === 0) {
        setEditOpen(false);
        return;
      }
      await overrideTripByAdmin(trip.tripId, payload);
      setEditOpen(false);
      await loadTrip();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cập nhật chuyến đi thất bại");
    } finally {
      setEditLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => router.push(ROUTES.TRIPS)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Map className="h-6 w-6 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">
              {error || "Không tìm thấy chuyến đi"}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadTrip}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWaitingManualModeration =
    trip.currentStatus === 10 ||
    trip.currentStatus === "InReview" ||
    trip.moderationStatus === 1 ||
    trip.moderationStatus === "PendingReview";

  const canModerate =
    (role === "ADMIN" || role === "MODERATOR") &&
    !!taskId &&
    (
      isWaitingManualModeration
    );
  const canEditTrip = role === "ADMIN";

  return (
    <>
      <ModerationDialog
        open={!!decision}
        decision={decision}
        onClose={() => setDecision(null)}
        onConfirm={handleDecisionConfirm}
        loading={decisionLoading}
      />
      <TripEditDialog
        open={editOpen}
        form={editForm}
        loading={editLoading}
        onClose={() => setEditOpen(false)}
        onChange={setEditForm}
        onSubmit={handleSaveTripEdit}
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(ROUTES.TRIPS)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{trip.title || "(Chưa đặt tên)"}</h1>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[11px]", getStatusStyle(trip.currentStatus))}>
                  {tripStatusLabel(trip.currentStatus)}
                </Badge>
                {trip.moderationStatus !== null && trip.moderationStatus !== undefined && (
                  <Badge variant="outline" className="text-[11px]">
                    <Shield className="mr-1 h-3 w-3" />
                    {moderationStatusLabel(trip.moderationStatus)}
                  </Badge>
                )}
                {trip.qualityScore !== null && (
                  <Badge variant="outline" className="text-[11px]">
                    <Star className="mr-1 h-3 w-3" />
                    {trip.qualityScore}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {(canModerate || canEditTrip) && (
            <div className="flex items-center gap-2">
              {canEditTrip && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const initialForm = buildTripEditFormState(trip);
                    setEditForm(initialForm);
                    setEditBaseline(initialForm);
                    setEditOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Chỉnh sửa
                </Button>
              )}
              {canModerate && (
                <>
                  <Button size="sm" onClick={() => setDecision("Approve")}>
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    Duyệt
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDecision("Reject")}>
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    Từ chối
                  </Button>
                </>
              )}
            </div>
          )}

        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Thông tin chuyến đi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bắt đầu</span>
                <span className="font-medium">{formatDateTime(trip.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kết thúc</span>
                <span className="font-medium">{formatDateTime(trip.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quay về</span>
                <span className="font-medium">{formatDateTime(trip.backTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hạn đăng ký</span>
                <span className="font-medium">{formatDateTime(trip.registrationDeadline)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiền cọc</span>
                <span className="font-medium">
                  {formatVnd(trip.depositAmount)}
                  {trip.depositCurrency && trip.depositCurrency !== "VND" && ` (${trip.depositCurrency})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duyệt thành viên</span>
                <span className="font-medium">{trip.isApprovalMemberEnable ? "Có" : "Không"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo</span>
                <span className="font-medium">{formatDateTime(trip.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {trip.owner && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Chủ chuyến đi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {trip.owner.avatarUrl && <AvatarImage src={trip.owner.avatarUrl} alt="Owner" />}
                      <AvatarFallback className={cn("text-xs font-semibold", getAvatarColor(trip.owner.userId))}>
                        {(trip.owner.firstName?.[0] || "") + (trip.owner.lastName?.[0] || "") || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {[trip.owner.firstName, trip.owner.lastName].filter(Boolean).join(" ") || "(Chưa đặt tên)"}
                      </p>
                      {trip.owner.experienceLevel !== null && (
                        <p className="text-xs text-muted-foreground">Level: {memberLevelLabelViWithCatalog(trip.owner.experienceLevel, memberLevelCatalog?.levels)}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Thống kê
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người tham gia</span>
                  <span className="font-medium">{trip.participantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tối thiểu</span>
                  <span className="font-medium">{trip.minParticipants ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tối đa</span>
                  <span className="font-medium">{trip.maxParticipants ?? "—"}</span>
                </div>
                {trip.scanStatus !== null && trip.scanStatus !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quét nội dung</span>
                    <span className="font-medium">
                      {scanStatusLabelVi(trip.scanStatus)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {trip.description && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Mô tả</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{trip.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Phân loại chuyến đi & chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Loại chuyến đi
              </p>
              <div className="flex flex-wrap gap-2">
                {trip.tripTypes.length === 0 ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  trip.tripTypes.map((item) => (
                    <Badge key={item.tripTypeId} variant="outline" className="text-[11px]">
                      {tripTypeLabelVi(item.tripType)}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CarFront className="h-3.5 w-3.5" />
                Phương tiện
              </p>
              <div className="flex flex-wrap gap-2">
                {trip.tripVehicles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : (
                  trip.tripVehicles.map((item) => (
                    <Badge key={item.tripVehicleId} variant="outline" className="text-[11px]">
                      {vehicleTypeLabelVi(item.vehicleType)}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  Tổng chi phí dự kiến
                </p>
                <span className="text-sm font-semibold">{formatVnd(totalEstimatedCost)}</span>
              </div>
              {groupedExpenseItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có chi phí dự kiến.</p>
              ) : (
                <div className="space-y-1.5">
                  {groupedExpenseItems.map((item) => (
                    <div key={item.expenseType} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{expenseTypeLabelVi(item.expenseType)}</span>
                      <span className="font-medium">{formatVnd(item.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Nội dung bổ sung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Quy định</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{trip.rule || "—"}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Vật dụng cần mang</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{trip.itemRequired || "—"}</p>
            </div>
          </CardContent>
        </Card>

        {sortedCheckpoints.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Lộ trình ({sortedCheckpoints.length} điểm)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-2.5">
                <Badge variant="outline" className="text-[11px]">{sortedCheckpoints.length} điểm</Badge>
                <Badge variant="outline" className="text-[11px]">
                  Quãng đường: {routeStats.distanceKm !== null ? `${routeStats.distanceKm.toFixed(1)} km` : formatDistance(trip.itinerary?.distanceM)}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  Thời gian: {routeStats.durationMinutes !== null ? formatDuration(routeStats.durationMinutes * 60) : formatDuration(trip.itinerary?.durationS)}
                </Badge>
                {trip.itinerary?.travelMode && (
                  <Badge variant="outline" className="text-[11px]">
                    Kiểu di chuyển: {travelModeLabelVi(trip.itinerary.travelMode)}
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {sortedCheckpoints.map((checkpoint, index) => {
                    const typeMeta = checkpointMetaByType(checkpoint.tripCheckpointType);
                    const TypeIcon = typeMeta.icon;
                    return (
                      <div key={checkpoint.tripCheckpointId} className="rounded-lg border bg-background p-3">
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
                                {checkpointLabelVi(checkpoint.tripCheckpointType)}
                              </Badge>
                            </div>
                            <p className="text-sm font-semibold">{checkpoint.locationName || checkpoint.displayAddress || "—"}</p>
                            {checkpoint.locationName && checkpoint.displayAddress && (
                              <p className="text-xs text-muted-foreground">{checkpoint.displayAddress}</p>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">#{checkpoint.sequenceNo}</span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5">
                            <Clock3 className="h-3 w-3" />
                            {formatDateTime(checkpoint.plannedAt)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5">
                            <Route className="h-3 w-3" />
                            {formatCoordinates(checkpoint.lat, checkpoint.lng)}
                          </span>
                        </div>

                        {checkpoint.note && (
                          <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                            {checkpoint.note}
                          </div>
                        )}

                        {checkpoint.costs.length > 0 && (
                          <div className="mt-2 rounded-md border bg-amber-50/50 p-2">
                            <p className="mb-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800">
                              <Wallet className="h-3 w-3" />
                              Chi phí tại điểm
                            </p>
                            <div className="space-y-1">
                              {checkpoint.costs.map((cost) => (
                                <div key={cost.tripExpenseCategoryId} className="flex items-center justify-between gap-2 text-[11px]">
                                  <span className="truncate text-muted-foreground">{expenseTypeLabelVi(cost.expenseType)}</span>
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
                <TripCheckpointMap
                  checkpoints={sortedCheckpoints}
                  itinerary={trip.itinerary}
                  onRouteStatsChange={setRouteStats}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {trip.participants.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-muted-foreground" />
                Người tham gia ({trip.participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thành viên</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trip.participants.map((participant) => {
                    const name =
                      [participant.firstName, participant.lastName].filter(Boolean).join(" ") || "(Chưa đặt tên)";
                    const initials =
                      participant.firstName && participant.lastName
                        ? (participant.firstName[0] + participant.lastName[0]).toUpperCase()
                        : name.slice(0, 2).toUpperCase();

                    return (
                      <TableRow key={participant.tripParticipantId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={name} />}
                              <AvatarFallback
                                className={cn(
                                  "text-[10px] font-semibold",
                                  getAvatarColor(participant.userId || participant.tripParticipantId),
                                )}
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[11px]">
                            {participantRoleLabel(participant, trip.owner?.userId)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {participantStatusLabel(participant.participantStatusId)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {orderedMediaAttachments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Hình ảnh & Media ({orderedMediaAttachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {orderedMediaAttachments.map((media) => (
                  <div key={media.mediaAttachmentId} className="overflow-hidden rounded-lg border">
                    {media.mediaType === "Image" || media.mediaType === 0 ? (
                      <img 
                        src={media.mediaUrl} 
                        alt="" 
                        className="aspect-video w-full object-cover cursor-pointer hover:opacity-90 transition"
                        onClick={() => setSelectedMediaUrl(media.mediaUrl)} 
                      />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">{mediaTypeLabelVi(media.mediaType)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Media Zoom Dialog */}
      <Dialog open={!!selectedMediaUrl} onOpenChange={(open) => !open && setSelectedMediaUrl(null)}>
        <DialogContent className="max-w-[90vw] md:max-w-4xl p-1 bg-transparent border-none shadow-none flex justify-center items-center [&>button]:bg-white [&>button]:text-black [&>button]:opacity-100 [&>button]:hover:bg-slate-200 [&>button]:p-2 [&>button]:rounded-full [&>button]:shadow-xl sm:[&>button]:-right-4 sm:[&>button]:-top-4">
          <DialogTitle className="sr-only">Hình ảnh phóng to</DialogTitle>
          <DialogDescription className="sr-only">Chi tiết hình ảnh đính kèm của chuyến đi</DialogDescription>
          {selectedMediaUrl && (
            <img 
              src={selectedMediaUrl} 
              alt="zoomed media" 
              className="max-w-full max-h-[90vh] object-contain rounded-md" 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

