"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Car,
  CheckCircle2,
  Loader2,
  PencilLine,
  Phone,
  ReceiptText,
  RefreshCw,
  UserRound,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import {
  fetchRescueRequestById,
  updateRescueRequestStatusByModerator,
} from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  RescueRequestDetail,
  RescueRequestRejectReasonCode,
  UpdateModeratorRescueRequestStatusPayload,
} from "@/types";
import {
  RESCUE_REQUEST_CANCEL_REASON_LABELS,
  RESCUE_REQUEST_MODERATOR_TARGET_STATUSES,
  RESCUE_REQUEST_REJECT_REASONS,
  RESCUE_REQUEST_REJECT_REASON_LABELS,
  rescueRequestStatusLabel,
} from "@/types";

function formatCurrency(value?: number | null) {
  return value == null ? "-" : `${value.toLocaleString("vi-VN")} ₫`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status?: string | null) {
  switch (status) {
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Rejected":
    case "Cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "InProgress":
    case "Arrived":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Received":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-foreground">
        {value || "-"}
      </span>
    </div>
  );
}

function PersonCard({
  title,
  name,
  phone,
  avatarUrl,
  icon: Icon,
}: {
  title: string;
  name?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  icon: typeof UserRound;
}) {
  return (
    <Card className="border border-border/50 shadow-none">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name || title} fill className="object-cover" />
          ) : (
            <Icon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] text-muted-foreground">{title}</p>
          <p className="truncate font-semibold">{name || "Chưa có tên"}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {phone || "Chưa có SĐT"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function canModerateStatus(status?: string | null) {
  return !status || !["Completed", "Rejected", "Cancelled"].includes(status);
}

function ModeratorStatusDialog({
  detail,
  loading,
  onSubmit,
}: {
  detail: RescueRequestDetail;
  loading: boolean;
  onSubmit: (payload: UpdateModeratorRescueRequestStatusPayload) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<UpdateModeratorRescueRequestStatusPayload["status"]>(
    "Received",
  );
  const [reason, setReason] = useState("");
  const [rejectReasonCode, setRejectReasonCode] =
    useState<RescueRequestRejectReasonCode>("NO_CAPACITY");
  const [error, setError] = useState<string | null>(null);

  const availableStatuses = useMemo(
    () =>
      RESCUE_REQUEST_MODERATOR_TARGET_STATUSES.filter(
        (item) => item !== detail.status,
      ),
    [detail.status],
  );

  useEffect(() => {
    setStatus(availableStatuses[0] ?? "Received");
  }, [availableStatuses]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
      setReason("");
      setRejectReasonCode("NO_CAPACITY");
      setStatus(availableStatuses[0] ?? "Received");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do cập nhật trạng thái.");
      return;
    }

    try {
      setError(null);
      const payload: UpdateModeratorRescueRequestStatusPayload = {
        status,
        reason: reason.trim(),
      };

      if (status === "Rejected") {
        payload.rejectReasonCode = rejectReasonCode;
      }

      await onSubmit(payload);
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái đơn cứu hộ.",
      );
    }
  }

  if (!canModerateStatus(detail.status)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <PencilLine className="h-4 w-4" />
          Cập nhật trạng thái
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn cứu hộ</DialogTitle>
          <DialogDescription>
            Chọn trạng thái đích và nhập lý do vận hành cho đơn #
            {detail.rescueRequestId.slice(0, 8)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rescue-status">Trạng thái đích</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as UpdateModeratorRescueRequestStatusPayload["status"])
              }
            >
              <SelectTrigger id="rescue-status">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((item) => (
                  <SelectItem key={item} value={item}>
                    {rescueRequestStatusLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "Rejected" && (
            <div className="space-y-1.5">
              <Label htmlFor="rescue-reject-reason">Lý do từ chối</Label>
              <Select
                value={rejectReasonCode}
                onValueChange={(value) =>
                  setRejectReasonCode(value as RescueRequestRejectReasonCode)
                }
              >
                <SelectTrigger id="rescue-reject-reason">
                  <SelectValue placeholder="Chọn lý do từ chối" />
                </SelectTrigger>
                <SelectContent>
                  {RESCUE_REQUEST_REJECT_REASONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {RESCUE_REQUEST_REJECT_REASON_LABELS[item] ?? item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="rescue-reason">Lý do vận hành</Label>
            <Textarea
              id="rescue-reason"
              placeholder="Nhập lý do cập nhật trạng thái..."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-right text-xs text-muted-foreground">
              {reason.length}/1000
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading || availableStatuses.length === 0 || !reason.trim()}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Xác nhận cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function RescueRequestDetailClient({
  rescueRequestId,
}: {
  rescueRequestId: string;
}) {
  const [detail, setDetail] = useState<RescueRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetail = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const result = await fetchRescueRequestById(rescueRequestId);
        setDetail(result.data);
      } catch {
        setErrorMessage("Không thể tải chi tiết đơn cứu hộ. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [rescueRequestId],
  );

  useEffect(() => {
    void loadDetail(false);
  }, [loadDetail]);

  const handleStatusUpdate = useCallback(
    async (payload: UpdateModeratorRescueRequestStatusPayload) => {
      try {
        setIsSubmittingStatus(true);
        setErrorMessage(null);
        const result = await updateRescueRequestStatusByModerator(
          rescueRequestId,
          payload,
        );
        setDetail(result.data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể cập nhật trạng thái đơn cứu hộ.";
        setErrorMessage(message);
        throw new Error(message);
      } finally {
        setIsSubmittingStatus(false);
      }
    },
    [rescueRequestId],
  );

  const timeline = useMemo(() => {
    if (!detail) return [];
    return [
      { label: "Tạo đơn", value: detail.createdAt },
      { label: "Đối tác tiếp nhận", value: detail.receivedAt },
      { label: "Bắt đầu di chuyển", value: detail.inProgressAt },
      { label: "Đã đến nơi", value: detail.arrivedAt },
      { label: "Hoàn tất", value: detail.completedAt },
      { label: "Đã hủy", value: detail.cancelledAt },
    ].filter((item) => item.value);
  }, [detail]);

  if (isLoading && !detail) {
    return (
      <div className="flex h-80 items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải chi tiết đơn cứu hộ
      </div>
    );
  }

  if (errorMessage && !detail) {
    return (
      <div className="space-y-4">
        <Button asChild variant="outline">
          <Link href={ROUTES.RESCUE_REQUESTS}>
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const cancelReason = detail.cancelReason
    ? RESCUE_REQUEST_CANCEL_REASON_LABELS[detail.cancelReason] ?? detail.cancelReason
    : null;
  const rejectReason = detail.rejectReasonCode
    ? RESCUE_REQUEST_REJECT_REASON_LABELS[detail.rejectReasonCode] ??
      detail.rejectReasonCode
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.RESCUE_REQUESTS}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Chi tiết đơn cứu hộ #{detail.rescueRequestId.slice(0, 8)}
              </h1>
              <Badge
                variant="outline"
                className={cn("text-[12px]", statusClass(detail.status))}
              >
                {rescueRequestStatusLabel(detail.status)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Đối tác xử lý, thông tin người yêu cầu, dịch vụ và chi phí của đơn cứu hộ
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadDetail(true)}
          disabled={isRefreshing || isSubmittingStatus}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Làm mới
        </Button>
        <ModeratorStatusDialog
          detail={detail}
          loading={isSubmittingStatus}
          onSubmit={handleStatusUpdate}
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <PersonCard
          title="Người yêu cầu"
          name={detail.travelerDisplayName}
          phone={detail.travelerPhone}
          avatarUrl={detail.travelerAvatarUrl}
          icon={UserRound}
        />
        <PersonCard
          title="Đối tác cứu hộ"
          name={detail.assignedPartnerName}
          phone={detail.assignedPartnerPhone}
          avatarUrl={detail.assignedPartnerAvatarUrl}
          icon={Wrench}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-border/50 shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Car className="h-4 w-4" />
              Thông tin sự cố
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Loại xe" value={detail.vehicleType} />
            <InfoRow label="Tên xe" value={detail.vehicleName} />
            <InfoRow label="Biển số" value={detail.vehicleNumber} />
            <InfoRow label="Ghi chú địa chỉ" value={detail.addressNote} />
            <InfoRow label="Ghi chú sự cố" value={detail.note} />
            <InfoRow
              label="Tọa độ"
              value={
                detail.breakdownLat != null && detail.breakdownLng != null
                  ? `${detail.breakdownLat}, ${detail.breakdownLng}`
                  : "-"
              }
            />
            <InfoRow
              label="Khoảng cách"
              value={
                detail.distanceKm != null
                  ? `${detail.distanceKm.toLocaleString("vi-VN")} km`
                  : "-"
              }
            />
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <ReceiptText className="h-4 w-4" />
              Chi phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Tiền dịch vụ" value={formatCurrency(detail.servicesTotalAmount)} />
            <InfoRow label="Phí di chuyển" value={formatCurrency(detail.travelFeeAmount)} />
            <InfoRow label="Tổng đơn" value={formatCurrency(detail.totalOrderAmount)} />
            <InfoRow
              label="Cọc"
              value={`${formatCurrency(detail.depositAmount)}${
                detail.depositPercent != null ? ` (${detail.depositPercent}%)` : ""
              }`}
            />
            <InfoRow label="Hoa hồng" value={formatCurrency(detail.commissionAmount)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border border-border/50 shadow-none lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dịch vụ đã chọn</CardTitle>
            <CardDescription className="text-[13px]">
              Danh sách dịch vụ trong đơn cứu hộ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detail.serviceItems.length ? (
                  detail.serviceItems.map((item) => (
                    <TableRow key={item.servicePartnerOfferingId}>
                      <TableCell className="font-medium">{item.serviceType}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPriceAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                      Chưa có dịch vụ.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CalendarClock className="h-4 w-4" />
              Tiến trình xử lý
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((item) => (
              <div key={item.label} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {formatDate(item.value)}
                  </p>
                </div>
              </div>
            ))}
            {cancelReason && <InfoRow label="Lý do hủy" value={cancelReason} />}
            {rejectReason && <InfoRow label="Lý do từ chối" value={rejectReason} />}
          </CardContent>
        </Card>
      </div>

      {detail.travelerPhotoUrls.length > 0 && (
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ảnh người yêu cầu gửi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {detail.travelerPhotoUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
              >
                <Image src={url} alt="Ảnh sự cố" fill className="object-cover" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
