"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Image as ImageIcon,
  Map,
  MapPin,
  RefreshCw,
  Shield,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { fetchTripById, reviewTrip } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ModerationDecisionCode, Role, TripDetail } from "@/types";
import {
  moderationStatusLabel,
  PARTICIPANT_STATUS_LABELS,
  SCAN_STATUS_LABELS,
  tripRoleLabel,
  tripStatusLabel,
  TRIP_STATUS_CODES,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface TripDetailClientProps {
  role: Role;
}

export default function TripDetailClient({ role }: TripDetailClientProps) {
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

  const loadTrip = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchTripById(tripId);
      setTrip(result.data);
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

  return (
    <>
      <ModerationDialog
        open={!!decision}
        decision={decision}
        onClose={() => setDecision(null)}
        onConfirm={handleDecisionConfirm}
        loading={decisionLoading}
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

          {canModerate && (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setDecision("Approve")}>
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Duyệt
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setDecision("Reject")}>
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Từ chối
              </Button>
            </div>
          )}

          {!taskId && isWaitingManualModeration && (
            <p className="text-xs text-muted-foreground">
              Thiếu <code className="rounded bg-muted px-1">taskId</code>. Vui lòng mở chi tiết từ trang{" "}
              <code className="rounded bg-muted px-1">/dashboard/moderation</code> để duyệt đúng task.
            </p>
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
                        <p className="text-xs text-muted-foreground">Level: {trip.owner.experienceLevel}</p>
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
                      {typeof trip.scanStatus === "number"
                        ? SCAN_STATUS_LABELS[trip.scanStatus] ?? `${trip.scanStatus}`
                        : String(trip.scanStatus)}
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

        {trip.checkpoints.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Điểm dừng ({trip.checkpoints.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Địa điểm</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trip.checkpoints
                    .sort((left, right) => left.sequenceNo - right.sequenceNo)
                    .map((checkpoint) => (
                      <TableRow key={checkpoint.tripCheckpointId}>
                        <TableCell className="text-muted-foreground">{checkpoint.sequenceNo}</TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">
                            {checkpoint.locationName || checkpoint.displayAddress || "—"}
                          </p>
                          {checkpoint.displayAddress && checkpoint.locationName && (
                            <p className="text-xs text-muted-foreground">{checkpoint.displayAddress}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[11px]">
                            {checkpoint.tripCheckpointType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {checkpoint.note || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
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
                            {tripRoleLabel(participant.roleInTrip)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {participant.participantStatusId !== null && participant.participantStatusId !== undefined
                            ? (typeof participant.participantStatusId === "number"
                                ? PARTICIPANT_STATUS_LABELS[participant.participantStatusId] ?? `${participant.participantStatusId}`
                                : String(participant.participantStatusId))
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {trip.mediaAttachments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Hình ảnh & Media ({trip.mediaAttachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {trip.mediaAttachments.map((media) => (
                  <div key={media.mediaAttachmentId} className="overflow-hidden rounded-lg border">
                    {media.mediaType === "Image" || media.mediaType === 0 ? (
                      <img src={media.mediaUrl} alt="" className="aspect-video w-full object-cover" />
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-muted">
                        <span className="text-xs text-muted-foreground">{media.mediaType}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
