"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  approvePartnerRequest,
  fetchPartnerRequestById,
  rejectPartnerRequest,
  requestPartnerResubmission,
} from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { PartnerRequestDetail } from "@/types";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, FileText, Loader2, MapPin, Phone, User } from "lucide-react";

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "pending") {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Cho duyet</Badge>;
  }
  if (normalized === "approved") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Da duyet</Badge>;
  }
  if (normalized === "rejected") {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Tu choi</Badge>;
  }
  if (normalized === "resubmissionrequested") {
    return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Bo sung ho so</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

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

export default function PartnerRequestDetailPage() {
  const params = useParams<{ requestId: string }>();
  const requestId = params.requestId;

  const [detail, setDetail] = useState<PartnerRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const loadDetail = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchPartnerRequestById(requestId);
      setDetail(result.data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải chi tiết request",
      );
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function handleAction(type: "approve" | "reject" | "resubmit") {
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xử lý thao tác review",
      );
    } finally {
      setSaving(false);
    }
  }

  const canReview = useMemo(() => {
    const normalized = detail?.registrationStatus?.toLowerCase();
    return normalized === "pending" || normalized === "resubmissionrequested";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="px-0">
            <Link href={ROUTES.PARTNER_REQUESTS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {detail.requestCode}
            </h1>
            {getStatusBadge(detail.registrationStatus)}
          </div>
          <p className="text-sm text-muted-foreground">
            Đã review lúc: {formatDateTime(detail.reviewedAt)}
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
                Thông tin đối tác
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {readOnlyField(
                "Họ tên",
                [detail.partnerFirstName, detail.partnerLastName]
                  .filter(Boolean)
                  .join(" "),
              )}
              {readOnlyField("Số điện thoại", detail.partnerPhone)}
              {readOnlyField("Email", detail.partnerEmail)}
              {readOnlyField("Công ty", detail.companyName)}
              {readOnlyField("Service partner", detail.servicePartnerName)}
              {readOnlyField("Trạng thái service partner", detail.servicePartnerStatus)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Địa chỉ và liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {readOnlyField("Tên liên hệ", detail.contactName)}
                {readOnlyField("Số điện thoại liên hệ", detail.contactPhone)}
                {readOnlyField("Address line 1", detail.addressLine1)}
                {readOnlyField("Address line 2", detail.addressLine2)}
                {readOnlyField("Postal code", detail.postalCode)}
                {readOnlyField("Ward code", detail.wardCode)}
                {readOnlyField("Latitude", detail.addressLat)}
                {readOnlyField("Longitude", detail.addressLng)}
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Lý do đăng ký</Label>
                <Textarea
                  value={detail.registrationReason || "-"}
                  readOnly
                  className="min-h-24"
                />
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
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Hồ sơ review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readOnlyField("Mã hồ sơ đăng ký", detail.partnerRegistrationRequestId)}
              {readOnlyField("Partner ID", detail.partnerId)}
              {readOnlyField("Service partner ID", detail.servicePartnerId)}
              {detail.licenseFileUrl ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={detail.licenseFileUrl} target="_blank" rel="noreferrer">
                    Mở file giấy phép
                  </a>
                </Button>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  Chưa có file giấy phép.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Thao tác review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reviewNote">Ghi chú review</Label>
                <Textarea
                  id="reviewNote"
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Nhập ghi chú cho admin review..."
                  className="min-h-32"
                />
              </div>
              <div className="grid gap-2">
                <Button
                  onClick={() => handleAction("approve")}
                  disabled={!canReview || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Phê duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("reject")}
                  disabled={!canReview || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Từ chối
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction("resubmit")}
                  disabled={!canReview || saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yêu cầu bổ sung
                </Button>
              </div>
              {!canReview && (
                <p className="text-xs text-muted-foreground">
                  Request này đang ở trạng thái {detail.registrationStatus}, không cần review lại.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
