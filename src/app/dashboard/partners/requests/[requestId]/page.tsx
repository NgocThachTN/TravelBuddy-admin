"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchPartnerRequestById, reviewPartnerRequest } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import {
  formatFullAddress,
  formatWardLabel,
  getRegistrationStatusMeta,
  getServicePartnerStatusMeta,
  getVehicleServiceScopeLabel,
  renderStatusBadge,
} from "@/lib/partner-display";
import PartnerLocationMap from "@/app/dashboard/partners/components/PartnerLocationMap";
import type { PartnerRequestDetail } from "@/types";
import {
  DocumentGroupPreview,
  type PartnerDocumentItem,
} from "@/components/partner-document-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { normalizePartnerDocumentUrl } from "@/lib/partner-document";
import {
  ArrowLeft,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

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

type PartnerDocumentGroups = {
  identityCards: PartnerDocumentItem[];
  businessLicenses: PartnerDocumentItem[];
};

function normalizeMediaUrl(value?: string | null) {
  return normalizePartnerDocumentUrl(value);
}

function getPartnerDocumentGroups(detail: PartnerRequestDetail): PartnerDocumentGroups {
  const identityCards: PartnerDocumentItem[] = [];
  const businessLicenses: PartnerDocumentItem[] = [];

  for (const item of detail.mediaAttachments ?? []) {
    const mediaUrl = normalizeMediaUrl(item.mediaUrl);
    if (!mediaUrl) continue;

    const targetType = item.targetType?.toLowerCase();
    if (targetType === "partneridentitycard") {
      identityCards.push({
        url: mediaUrl,
        mediaType: item.mediaType,
      });
      continue;
    }

    if (targetType === "partnerbusinesslicense") {
      businessLicenses.push({
        url: mediaUrl,
        mediaType: item.mediaType,
      });
    }
  }

  if (identityCards.length === 0) {
    const fallbackIdentity = normalizeMediaUrl(detail.identifyCardUrl);
    if (fallbackIdentity) {
      identityCards.push({ url: fallbackIdentity });
    }
  }

  if (businessLicenses.length === 0) {
    const fallbackLicense =
      normalizeMediaUrl(detail.licenseFileUrl) ??
      normalizeMediaUrl(detail.businessLicenseFileUrl);
    if (fallbackLicense) {
      businessLicenses.push({ url: fallbackLicense });
    }
  }

  return { identityCards, businessLicenses };
}

function hasVietnameseText(value: string) {
  return /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(
    value,
  );
}

function toVietnameseProviderDesc(raw?: string) {
  const value = raw?.trim();
  if (!value) return null;

  const parts = value
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean);
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

function normalizeTaxCode(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function isSuccessfulTaxVerification(
  detail: PartnerRequestDetail,
  verification?: PartnerRequestDetail["taxVerification"],
) {
  if (!verification) {
    return false;
  }

  const providerCode = verification.providerCode?.trim();
  const responseTaxCode = normalizeTaxCode(verification.taxCode);
  const submittedTaxCode = normalizeTaxCode(detail.taxId);

  if (providerCode !== "00") {
    return false;
  }

  if (!responseTaxCode || !submittedTaxCode || responseTaxCode !== submittedTaxCode) {
    return false;
  }

  return true;
}

function getTaxVerificationStatusLabel(
  detail: PartnerRequestDetail,
  verification?: PartnerRequestDetail["taxVerification"],
) {
  if (!verification) return "Chưa có dữ liệu";

  const normalized = verification.verificationStatus?.trim().toLowerCase();
  if (normalized === "pending") return "Đang chờ xác minh";
  if (isSuccessfulTaxVerification(detail, verification)) return "Xác minh thành công";

  return "Xác minh thất bại";
}

function shouldShowVerifiedBusinessStatus(
  detail: PartnerRequestDetail,
  verification?: PartnerRequestDetail["taxVerification"],
) {
  if (!isSuccessfulTaxVerification(detail, verification)) {
    return false;
  }

  return (
    Boolean(verification.providerBusinessStatus?.trim()) ||
    verification.isBusinessActive != null
  );
}

function getBusinessStatusValue(
  detail: PartnerRequestDetail,
  verification?: PartnerRequestDetail["taxVerification"],
) {
  if (!shouldShowVerifiedBusinessStatus(detail, verification)) {
    return null;
  }

  return (
    verification?.providerBusinessStatus ??
    (verification?.isBusinessActive === true
      ? "Đang hoạt động"
      : verification?.isBusinessActive === false
        ? "Ngừng hoạt động"
        : null)
  );
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
  const [pendingAction, setPendingAction] = useState<ReviewAction | null>(null);
  const [selectedQuickReason, setSelectedQuickReason] = useState("");

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
    void loadDetail();
  }, [loadDetail]);

  async function executeAction(type: ReviewAction) {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const decision =
        type === "approve"
          ? "Approve"
          : type === "reject"
            ? "Reject"
            : "RequestResubmission";

      const reviewPayload = {
        decision,
        reviewNote: reviewNote.trim() || undefined,
      } as const;

      await reviewPartnerRequest(requestId, reviewPayload);

      if (type === "approve") {
        setSuccess("Đã phê duyệt hồ sơ đối tác.");
      } else if (type === "reject") {
        setSuccess("Đã từ chối hồ sơ đối tác.");
      } else {
        setSuccess("Đã yêu cầu đối tác bổ sung hồ sơ.");
      }

      await loadDetail();
      setReviewNote("");
      setReviewNoteError(null);
      setSelectedQuickReason("");
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

  const documentGroups = getPartnerDocumentGroups(detail);
  const taxVerification = detail.taxVerification;
  const businessStatusValue = getBusinessStatusValue(detail, taxVerification);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button asChild variant="ghost" className="px-0">
          <Link href={ROUTES.PARTNER_REQUESTS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{detail.requestCode}</h1>
          {renderStatusBadge(detail.registrationStatus, getRegistrationStatusMeta)}
        </div>

        <p className="text-sm text-muted-foreground">
          Đã xét duyệt lúc: {formatDateTime(detail.reviewedAt)}
        </p>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_380px]">
        <div className="min-w-0 space-y-6">
          <Tabs defaultValue="representative" className="w-full">
            <div className="sticky top-0 z-10 rounded-xl border border-border bg-background/95 p-2 backdrop-blur">
              <TabsList className="h-auto w-full bg-slate-100 p-1">
                <TabsTrigger value="representative" className="flex-1 rounded-md py-2">
                  Thông tin người đại diện
                </TabsTrigger>
                <TabsTrigger value="store" className="flex-1 rounded-md py-2">
                  Thông tin cửa hàng & địa chỉ
                </TabsTrigger>
                <TabsTrigger value="attachments" className="flex-1 rounded-md py-2">
                  File đính kèm
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="representative" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Thông tin người đại diện
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {readOnlyField(
                    "Họ và tên",
                    [detail.partnerFirstName, detail.partnerLastName].filter(Boolean).join(" "),
                  )}
                  {readOnlyField("Số điện thoại", detail.partnerPhone)}
                  {readOnlyField("Email", detail.partnerEmail)}
                  {readOnlyField("Người liên hệ", detail.contactName)}
                  {readOnlyField("Số điện thoại liên hệ", detail.contactPhone)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="store" className="mt-4 space-y-4">
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
                    {readOnlyField("Mã số thuế đã đăng ký", detail.taxId)}
                    {readOnlyField(
                      "Phạm vi dịch vụ",
                      getVehicleServiceScopeLabel(detail.vehicleServiceScope),
                    )}
                    {readOnlyField(
                      "Trạng thái đối tác",
                      getServicePartnerStatusMeta(detail.servicePartnerStatus).label,
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Mô tả dịch vụ</Label>
                    <Textarea
                      value={detail.servicePartnerDescription || "-"}
                      readOnly
                      className="min-h-28 resize-none"
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
                    <PartnerLocationMap
                      lat={detail.addressLat}
                      lng={detail.addressLng}
                      label={detail.servicePartnerName || detail.companyName || "Vi tri doi tac"}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    File đính kèm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <DocumentGroupPreview
                    title="Ảnh CCCD/CMND"
                    documents={documentGroups.identityCards}
                    emptyText="Chưa có ảnh CCCD/CMND."
                  />
                  <DocumentGroupPreview
                    title="Giấy phép kinh doanh"
                    documents={documentGroups.businessLicenses}
                    emptyText="Chưa có giấy phép kinh doanh."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Xác minh mã số thuế
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {readOnlyField(
                "Trạng thái xác minh",
                getTaxVerificationStatusLabel(detail, taxVerification),
              )}
              {readOnlyField("Mã số thuế phản hồi", taxVerification?.taxCode ?? detail.taxId)}
              {businessStatusValue != null &&
                readOnlyField("Trạng thái doanh nghiệp", businessStatusValue)}
              {readOnlyField("Thời điểm xác minh", formatDateTime(taxVerification?.verifiedAt))}
              {readOnlyField(
                "Mô tả phản hồi",
                toVietnameseProviderDesc(taxVerification?.providerDesc),
              )}
              {readOnlyField("Lỗi xác minh", taxVerification?.errorMessage)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Xử lý hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p>
                  <span className="font-medium">Mã hồ sơ:</span> {detail.requestCode}
                </p>
                <p>
                  <span className="font-medium">Trạng thái hiện tại:</span>{" "}
                  {getRegistrationStatusMeta(detail.registrationStatus).label}
                </p>
              </div>

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
                {reviewNoteError && <p className="text-sm text-destructive">{reviewNoteError}</p>}
              </div>

              <div className="space-y-2">
                <Label>Lý do nhanh</Label>
                <Select
                  value={selectedQuickReason || undefined}
                  onValueChange={(value) => {
                    setSelectedQuickReason(value);
                    appendQuickReason(value);
                    setSelectedQuickReason("");
                  }}
                  disabled={!canReview || saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn lý do để thêm nhanh vào ghi chú" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUICK_REASONS.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!canReview && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Hồ sơ này không còn ở trạng thái chờ duyệt để xử lý tiếp.
                </div>
              )}

              <div className="grid gap-2">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
              <span className="font-medium">Mã hồ sơ:</span> {detail.requestCode}
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
