"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  approvePartnerRequest,
  fetchPartnerRequestById,
  rejectPartnerRequest,
  requestPartnerResubmission,
} from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import {
  formatFullAddress,
  formatWardLabel,
  getMapEmbedUrl,
  getRegistrationStatusMeta,
  getServicePartnerStatusMeta,
  getVehicleServiceScopeLabel,
  renderStatusBadge,
} from "@/lib/partner-display";
import type { PartnerRequestDetail } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, FileText, Loader2, MapPin, Store, User } from "lucide-react";

type ReviewAction = "approve" | "reject" | "resubmit";

const QUICK_REASONS = [
  "Mã số thuế không hợp lệ hoặc không đúng doanh nghiệp.",
  "Giấy phép kinh doanh không rõ thông tin.",
  "Thông tin đại diện không khớp hồ sơ đính kèm.",
  "Vui lòng bổ sung ảnh CCCD/CMND đầy đủ và rõ nét.",
  "Vui lòng cập nhật lại giấy phép kinh doanh còn hiệu lực.",
  "Vui lòng kiểm tra và cập nhật lại địa chỉ cửa hàng chính xác.",
];

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

function readOnlyField(label: string, value?: string | number | null) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value == null || value === "" ? "-" : String(value)} readOnly />
    </div>
  );
}

function readOnlyTextarea(label: string, value?: string | number | null) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label>{label}</Label>
      <Textarea
        value={value == null || value === "" ? "-" : String(value)}
        readOnly
        className="min-h-28 resize-none"
      />
    </div>
  );
}

function getFileType(url?: string | null) {
  if (!url) return "unknown";
  const normalized = url.split("?")[0].toLowerCase();

  if (/\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(normalized)) {
    return "image";
  }
  if (/\.pdf$/.test(normalized)) {
    return "pdf";
  }
  return "unknown";
}

function FilePreview({
  title,
  url,
  emptyText,
}: {
  title: string;
  url?: string | null;
  emptyText: string;
}) {
  const fileType = getFileType(url);
  const previewFrameClass =
    "relative w-full overflow-hidden rounded-md border bg-muted/20 aspect-[16/9]";

  return (
    <div className="space-y-3">
      <Label>{title}</Label>
      {url ? (
        <div className="space-y-3">
          {fileType === "image" && (
            <div className={previewFrameClass}>
              <Image
                src={url}
                alt={title}
                fill
                unoptimized
                className="object-contain p-2"
              />
            </div>
          )}
          {fileType === "pdf" && (
            <div className={previewFrameClass}>
              <iframe
                title={title}
                src={url}
                className="h-full w-full"
              />
            </div>
          )}
          {fileType === "unknown" && (
            <div className={`${previewFrameClass} flex items-center justify-center border-dashed p-3 text-sm text-muted-foreground`}>
              Tệp này không hỗ trợ xem nhanh trực tiếp.
            </div>
          )}
          <Button asChild variant="outline" className="w-full">
            <a href={url} target="_blank" rel="noreferrer">
              Mở tệp trong tab mới
            </a>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </div>
  );
}

type PartnerDocumentGroups = {
  identityCards: string[];
  businessLicenses: string[];
};

function normalizeMediaUrl(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function getPartnerDocumentGroups(detail: PartnerRequestDetail): PartnerDocumentGroups {
  const identityCards: string[] = [];
  const businessLicenses: string[] = [];

  for (const item of detail.mediaAttachments ?? []) {
    const mediaUrl = normalizeMediaUrl(item.mediaUrl);
    if (!mediaUrl) continue;

    const targetType = item.targetType?.toLowerCase();
    if (targetType === "partneridentitycard") {
      identityCards.push(mediaUrl);
      continue;
    }

    if (targetType === "partnerbusinesslicense") {
      businessLicenses.push(mediaUrl);
    }
  }

  if (identityCards.length === 0) {
    const fallbackIdentity = normalizeMediaUrl(detail.identifyCardUrl);
    if (fallbackIdentity) {
      identityCards.push(fallbackIdentity);
    }
  }

  if (businessLicenses.length === 0) {
    const fallbackLicense =
      normalizeMediaUrl(detail.licenseFileUrl) ??
      normalizeMediaUrl(detail.businessLicenseFileUrl);
    if (fallbackLicense) {
      businessLicenses.push(fallbackLicense);
    }
  }

  return { identityCards, businessLicenses };
}

function getTaxVerificationStatusLabel(rawStatus?: string) {
  const normalized = rawStatus?.trim().toLowerCase();
  if (!normalized) return "Chưa có dữ liệu";

  switch (normalized) {
    case "pending":
      return "Đang chờ xác minh";
    case "verifiedactive":
      return "Đã xác minh đang hoạt động";
    case "verifiedinactive":
      return "Đã xác minh ngừng hoạt động";
    case "failed":
      return "Xác minh thất bại";
    default:
      return rawStatus ?? "Chưa có dữ liệu";
  }
}

function hasVietnameseText(value: string) {
  return /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(value);
}

function toVietnameseProviderDesc(raw?: string) {
  const value = raw?.trim();
  if (!value) return null;

  const parts = value.split(" - ").map((part) => part.trim()).filter(Boolean);
  const vietnamesePart = parts.find(hasVietnameseText);
  if (vietnamesePart) return vietnamesePart;

  const normalized = value.toLowerCase();
  if (normalized.includes("success")) return "Thành công";
  if (normalized.includes("timeout") || normalized.includes("time out")) {
    return "Hết thời gian chờ phản hồi từ nhà cung cấp";
  }
  if (
    normalized.includes("not found") ||
    normalized.includes("not exist") ||
    normalized.includes("no data")
  ) {
    return "Không tìm thấy dữ liệu doanh nghiệp";
  }
  if (normalized.includes("invalid") && normalized.includes("tax")) {
    return "Mã số thuế không hợp lệ";
  }
  if (normalized.includes("too many requests") || normalized.includes("rate limit")) {
    return "Quá nhiều yêu cầu, vui lòng thử lại sau";
  }
  if (normalized.includes("unauthorized")) return "Nhà cung cấp yêu cầu xác thực";
  if (normalized.includes("forbidden")) return "Nhà cung cấp từ chối truy cập";
  if (normalized.includes("internal server error")) return "Lỗi máy chủ nhà cung cấp";
  if (normalized.includes("bad request")) return "Yêu cầu không hợp lệ";

  return "Không có mô tả chi tiết từ nhà cung cấp";
}

function getReviewActionLabel(action: ReviewAction) {
  switch (action) {
    case "approve":
      return "Phê duyệt";
    case "reject":
      return "Từ chối";
    case "resubmit":
      return "Yêu cầu bổ sung";
  }
}

function getReviewActionConfirmTitle(action: ReviewAction) {
  switch (action) {
    case "approve":
      return "Xác nhận phê duyệt hồ sơ";
    case "reject":
      return "Xác nhận từ chối hồ sơ";
    case "resubmit":
      return "Xác nhận yêu cầu bổ sung";
  }
}

function getReviewActionConfirmDescription(action: ReviewAction) {
  switch (action) {
    case "approve":
      return "Hồ sơ sẽ được phê duyệt và đối tác sẽ nhận thông báo kết quả.";
    case "reject":
      return "Hồ sơ sẽ bị từ chối và đối tác sẽ nhận thông báo kèm ghi chú.";
    case "resubmit":
      return "Đối tác sẽ được yêu cầu cập nhật hồ sơ theo ghi chú của bạn.";
  }
}

function DocumentGroupPreview({
  title,
  urls,
  emptyText,
}: {
  title: string;
  urls: string[];
  emptyText: string;
}) {
  if (urls.length === 0) {
    return (
      <div className="space-y-3">
        <Label>{title}</Label>
        <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>{title}</Label>
      {urls.map((url, index) => (
        <FilePreview
          key={`${title}-${index}-${url}`}
          title={`${title} ${urls.length > 1 ? `#${index + 1}` : ""}`.trim()}
          url={url}
          emptyText={emptyText}
        />
      ))}
    </div>
  );
}

export default function PartnerRequestDetailPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;

  const [detail, setDetail] = useState<PartnerRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewNoteError, setReviewNoteError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchPartnerRequestById(requestId);
      setDetail(result.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải chi tiết hồ sơ đăng ký",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function executeAction(type: ReviewAction) {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (type === "approve") {
        await approvePartnerRequest(requestId, { reviewNote });
        setSuccess("Đã phê duyệt hồ sơ đối tác.");
      } else if (type === "reject") {
        await rejectPartnerRequest(requestId, { reviewNote });
        setSuccess("Đã từ chối hồ sơ đối tác.");
      } else {
        await requestPartnerResubmission(requestId, { reviewNote });
        setSuccess("Đã yêu cầu đối tác bổ sung hồ sơ.");
      }

      await loadDetail();
      setReviewDialogOpen(false);
      setReviewNote("");
      setReviewNoteError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý thao tác duyệt",
      );
    } finally {
      setSaving(false);
    }
  }

  function validateReviewNoteForAction(action: ReviewAction) {
    if ((action === "reject" || action === "resubmit") && !reviewNote.trim()) {
      setReviewNoteError(`Vui lòng nhập ghi chú khi chọn "${getReviewActionLabel(action)}".`);
      return false;
    }

    setReviewNoteError(null);
    return true;
  }

  function requestReviewAction(action: ReviewAction) {
    if (!validateReviewNoteForAction(action)) {
      return;
    }
    setPendingAction(action);
  }

  async function handleConfirmAction() {
    if (!pendingAction) {
      return;
    }

    await executeAction(pendingAction);
    setPendingAction(null);
  }

  function appendQuickReason(reason: string) {
    setReviewNote((previous) => {
      const current = previous.trim();
      if (!current) {
        return reason;
      }
      if (current.includes(reason)) {
        return previous;
      }
      return `${current}\n- ${reason}`;
    });
    setReviewNoteError(null);
  }

  const canReview = useMemo(() => {
    const normalized = detail?.registrationStatus?.toLowerCase();
    return normalized === "inreview" || normalized === "pending" || normalized === "submitted";
  }, [detail?.registrationStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost">
          <Link href={ROUTES.PARTNER_REQUESTS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  const mapEmbedUrl = getMapEmbedUrl(detail.addressLat, detail.addressLng);
  const documentGroups = getPartnerDocumentGroups(detail);
  const taxVerification = detail.taxVerification;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="space-y-2 w-full">
          <Button asChild variant="ghost" className="px-0">
            <Link href={ROUTES.PARTNER_REQUESTS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
          <div className="flex w-full flex-wrap items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {detail.requestCode}
              </h1>
              {renderStatusBadge(detail.registrationStatus, getRegistrationStatusMeta)}
            </div>
            <Button
              type="button"
              className="ml-auto"
              onClick={() => setReviewDialogOpen(true)}
              disabled={!canReview || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xử lý hồ sơ
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Đã xét duyệt lúc: {formatDateTime(detail.reviewedAt)}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Thông tin người đại diện
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {readOnlyField(
                "Họ và tên",
                [detail.partnerFirstName, detail.partnerLastName]
                  .filter(Boolean)
                  .join(" "),
              )}
              {readOnlyField("Số điện thoại", detail.partnerPhone)}
              {readOnlyField("Email", detail.partnerEmail)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                Thông tin cửa hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {readOnlyField("Tên cửa hàng", detail.servicePartnerName)}
                {readOnlyField("Công ty", detail.companyName)}
                {readOnlyField("Mã số thuế", detail.taxId)}
                {readOnlyField("Phạm vi dịch vụ", getVehicleServiceScopeLabel(detail.vehicleServiceScope))}
                {readOnlyField("Trạng thái", getServicePartnerStatusMeta(detail.servicePartnerStatus).label)}
              </div>
              <div className="space-y-2">
                <Label>Mô tả dịch vụ</Label>
                <Textarea
                  value={detail.servicePartnerDescription || "-"}
                  readOnly
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Địa chỉ cửa hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {readOnlyField("Địa chỉ dòng 1", detail.addressLine1)}
                {readOnlyField("Địa chỉ dòng 2", detail.addressLine2)}
                {readOnlyField("Phường/Xã", formatWardLabel(detail.wardName, detail.wardCode))}
                {readOnlyField("Quận/Huyện", detail.districtName)}
                {readOnlyField("Tỉnh/Thành phố", detail.provinceName)}
                {readOnlyField("Mã bưu chính", detail.postalCode)}
                {readOnlyTextarea(
                  "Địa chỉ đầy đủ",
                  formatFullAddress([
                    detail.addressLine1,
                    detail.addressLine2,
                    detail.wardName,
                    detail.districtName,
                    detail.provinceName,
                  ]),
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Bản đồ</Label>
                {mapEmbedUrl ? (
                  <iframe
                    title="Bản đồ vị trí đối tác"
                    src={mapEmbedUrl}
                    className="h-72 w-full rounded-md border"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Chưa có vị trí để hiển thị bản đồ.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Xác minh mã số thuế
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readOnlyField(
                "Trạng thái xác minh",
                getTaxVerificationStatusLabel(taxVerification?.verificationStatus),
              )}
              {readOnlyField(
                "Mã số thuế",
                taxVerification?.taxCode ?? detail.taxId,
              )}
              {readOnlyField(
                "Trạng thái doanh nghiệp",
                taxVerification?.providerBusinessStatus ??
                  (taxVerification?.isBusinessActive === true
                    ? "Đang hoạt động"
                    : taxVerification?.isBusinessActive === false
                      ? "Không hoạt động"
                      : null),
              )}
              {readOnlyField("Thời điểm xác minh", formatDateTime(taxVerification?.verifiedAt))}
              {readOnlyField("Mô tả phản hồi", toVietnameseProviderDesc(taxVerification?.providerDesc))}
              {readOnlyField("Lỗi xác minh", taxVerification?.errorMessage)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Hồ sơ và giấy tờ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <DocumentGroupPreview
                title="Ảnh CCCD/CMND"
                urls={documentGroups.identityCards}
                emptyText="Chưa có ảnh CCCD/CMND."
              />
              <DocumentGroupPreview
                title="Giấy phép kinh doanh"
                urls={documentGroups.businessLicenses}
                emptyText="Chưa có giấy phép kinh doanh."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={reviewDialogOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setReviewDialogOpen(open);
            if (!open) {
              setReviewNoteError(null);
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thao tác duyệt hồ sơ</DialogTitle>
            <DialogDescription>
              Chọn hành động phù hợp và ghi chú rõ ràng trước khi xác nhận.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNote">Ghi chú duyệt</Label>
              <Textarea
                id="reviewNote"
                value={reviewNote}
                onChange={(event) => {
                  setReviewNote(event.target.value);
                  if (reviewNoteError) {
                    setReviewNoteError(null);
                  }
                }}
                placeholder="Nhập ghi chú cho quản trị viên..."
                className="min-h-32"
              />
              {reviewNoteError && (
                <p className="text-sm text-destructive">{reviewNoteError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lý do nhanh</Label>
              <div className="flex flex-wrap gap-2">
                {QUICK_REASONS.map((reason) => (
                  <Button
                    key={reason}
                    type="button"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => appendQuickReason(reason)}
                    disabled={!canReview || saving}
                  >
                    {reason}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:justify-normal">
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => requestReviewAction("approve")}
              disabled={!canReview || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Phê duyệt
            </Button>
            <Button
              variant="destructive"
              onClick={() => requestReviewAction("reject")}
              disabled={!canReview || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Từ chối
            </Button>
            <Button
              variant="outline"
              className="border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200 hover:text-amber-950"
              onClick={() => requestReviewAction("resubmit")}
              disabled={!canReview || saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yêu cầu bổ sung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPendingAction(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction
                ? getReviewActionConfirmTitle(pendingAction)
                : "Xác nhận thao tác"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? getReviewActionConfirmDescription(pendingAction)
                : "Vui lòng xác nhận thao tác duyệt hồ sơ."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
            <p>
              <span className="font-medium">Mã hồ sơ:</span>{" "}
              {detail.requestCode}
            </p>
            <p>
              <span className="font-medium">Hành động:</span>{" "}
              {pendingAction ? getReviewActionLabel(pendingAction) : "-"}
            </p>
            <p className="whitespace-pre-wrap">
              <span className="font-medium">Ghi chú:</span>{" "}
              {reviewNote.trim() || "Không có ghi chú"}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction === "reject" ? "destructive" : "default"}
              disabled={saving}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmAction();
              }}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
