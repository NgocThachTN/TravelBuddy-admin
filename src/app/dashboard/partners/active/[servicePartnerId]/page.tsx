"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchServicePartnerById } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import {
  formatFullAddress,
  formatWardLabel,
  getServicePartnerStatusMeta,
  getVehicleServiceScopeLabel,
  getVerificationStatusLabel,
  renderStatusBadge,
} from "@/lib/partner-display";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Loader2, MapPin, Store, User } from "lucide-react";
import { PartnerMap } from "../../components/PartnerMap";

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

  return (
    <div className="space-y-3">
      <Label>{title}</Label>
      {url ? (
        <div className="space-y-3">
          {fileType === "image" && (
            <div className="relative h-80 w-full overflow-hidden rounded-md border bg-muted/20">
              <Image
                src={url}
                alt={title}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          )}
          {fileType === "pdf" && (
            <iframe
              title={title}
              src={url}
              className="h-96 w-full rounded-md border"
            />
          )}
          {fileType === "unknown" && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
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
          err instanceof Error ? err.message : "Không thể tải chi tiết đối tác dịch vụ",
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" className="px-0">
            <Link href={ROUTES.ACTIVE_PARTNERS}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {detail.servicePartnerName || detail.companyName || "Đối tác dịch vụ"}
            </h1>
            {renderStatusBadge(detail.servicePartnerStatus, getServicePartnerStatusMeta)}
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
                {readOnlyField("Trạng thái hồ sơ", getServicePartnerStatusMeta(detail.profileStatus).label)}
                {readOnlyField("Trạng thái xác minh", getVerificationStatusLabel(detail.verificationStatus))}
              </div>
              <div className="space-y-2">
                <Label>Mô tả dịch vụ</Label>
                <Textarea
                  value={detail.servicePartnerDescription || "-"}
                  readOnly
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>Tóm tắt xác minh</Label>
                <Textarea
                  value={detail.verificationSummary || "-"}
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
                {detail.addressLat && detail.addressLng ? (
                  <PartnerMap lat={detail.addressLat} lng={detail.addressLng} />
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
                Hồ sơ và giấy tờ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FilePreview
                title="Ảnh CCCD/CMND"
                url={detail.identifyCardUrl}
                emptyText="Chưa có ảnh CCCD/CMND."
              />
              <FilePreview
                title="Giấy phép kinh doanh"
                url={detail.businessLicenseUrl}
                emptyText="Chưa có giấy phép kinh doanh."
              />
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
