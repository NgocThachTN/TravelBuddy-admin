"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchServicePartnerById } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { ServicePartnerDetail } from "@/types";
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
import { ArrowLeft, FileText, Loader2, MapPin, ShieldCheck, User } from "lucide-react";

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

function getStatusBadge(status?: string) {
  const normalized = status?.toLowerCase();

  if (normalized === "active") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>;
  }
  if (normalized === "inactive") {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  if (normalized === "suspended") {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
  }

  return <Badge variant="outline">{status || "Unknown"}</Badge>;
}

function readOnlyField(label: string, value?: string | number | null) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value == null || value === "" ? "-" : String(value)} readOnly />
    </div>
  );
}

export default function ServicePartnerDetailPage() {
  const params = useParams<{ servicePartnerId: string }>();
  const servicePartnerId = params.servicePartnerId;

  const [detail, setDetail] = useState<ServicePartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchServicePartnerById(servicePartnerId);
        if (ignore) return;
        setDetail(result.data);
        setError(null);
      } catch (err) {
        if (ignore) return;
        setError(
        err instanceof Error ? err.message : "Không thể tải chi tiết service partner",
        );
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [servicePartnerId]);

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
          <Link href={ROUTES.ACTIVE_PARTNERS}>
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
      <div className="space-y-2">
        <Button asChild variant="ghost" className="px-0">
          <Link href={ROUTES.ACTIVE_PARTNERS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {detail.servicePartnerName || detail.companyName || "Service partner"}
          </h1>
          {getStatusBadge(detail.servicePartnerStatus)}
          {detail.isLocked ? (
            <Badge variant="destructive">Đã khóa</Badge>
          ) : (
            <Badge variant="outline">Đang mở</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Xác minh lúc: {formatDateTime(detail.verifiedAt)}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Thông tin service partner
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {readOnlyField("Service partner ID", detail.servicePartnerId)}
              {readOnlyField("Partner ID", detail.partnerId)}
              {readOnlyField("User ID", detail.userId)}
              {readOnlyField("Công ty", detail.companyName)}
              {readOnlyField("Tax ID", detail.taxId)}
              {readOnlyField("Phạm vi dịch vụ xe", detail.vehicleServiceScope)}
              {readOnlyField("Trạng thái hồ sơ", detail.profileStatus)}
              {readOnlyField("Trạng thái xác minh", detail.verificationStatus)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Chủ đối tác và liên hệ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {readOnlyField(
                "Tên chủ đối tác",
                [detail.partnerFirstName, detail.partnerLastName]
                  .filter(Boolean)
                  .join(" "),
              )}
              {readOnlyField("Số điện thoại", detail.partnerPhone)}
              {readOnlyField("Email", detail.partnerEmail)}
              {readOnlyField("Tên liên hệ", detail.contactName)}
              {readOnlyField("Số điện thoại liên hệ", detail.contactPhone)}
              {readOnlyField("Tóm tắt xác minh", detail.verificationSummary)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Địa chỉ
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {readOnlyField("Address line 1", detail.addressLine1)}
              {readOnlyField("Address line 2", detail.addressLine2)}
              {readOnlyField("Postal code", detail.postalCode)}
              {readOnlyField("Ward code", detail.wardCode)}
              {readOnlyField("Latitude", detail.addressLat)}
              {readOnlyField("Longitude", detail.addressLng)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Tài liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detail.identifyCardUrl ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={detail.identifyCardUrl} target="_blank" rel="noreferrer">
                    Mở CCCD/CMND
                  </a>
                </Button>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  Chưa có URL CCCD/CMND.
                </div>
              )}
              {detail.businessLicenseUrl ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={detail.businessLicenseUrl} target="_blank" rel="noreferrer">
                    Mở giấy phép kinh doanh
                  </a>
                </Button>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  Chưa có URL giấy phép kinh doanh.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mốc thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readOnlyField("Ngày tạo", formatDateTime(detail.createdAt))}
              {readOnlyField("Cập nhật lần cuối", formatDateTime(detail.updatedAt))}
              {readOnlyField("Ngày xác minh", formatDateTime(detail.verifiedAt))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
