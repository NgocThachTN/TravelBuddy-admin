"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { fetchPartnerRequests } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import {
  getRegistrationStatusMeta,
  renderStatusBadge,
} from "@/lib/partner-display";
import type { PartnerRequestListItem } from "@/types";
import { Button } from "@/components/ui/button";
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

function formatRelativeTime(value: string) {
  const target = new Date(value).getTime();
  const diffMinutes = Math.round((Date.now() - target) / 60000);

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;

  return new Date(value).toLocaleDateString("vi-VN");
}

interface PartnerRequestsTableProps {
  compact?: boolean;
}

export default function PartnerRequestsTable({
  compact = false,
}: PartnerRequestsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [items, setItems] = useState<PartnerRequestListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = compact ? 5 : 10;

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchPartnerRequests({
          pageNumber: page,
          pageSize,
          registrationStatus: statusFilter,
        });

        if (ignore) return;
        setItems(result.data.items);
        setTotalPages(Math.max(result.data.totalPages || 1, 1));
        setError(null);
      } catch (err) {
        if (ignore) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải hồ sơ đăng ký đối tác",
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
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const stateView = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      );
    }

    return null;
  }, [error, loading]);

  if (stateView) {
    return stateView;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={statusFilter ?? "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="InReview">Chờ duyệt</SelectItem>
            <SelectItem value="Pending">Chờ duyệt (legacy)</SelectItem>
            <SelectItem value="Approved">Đã duyệt</SelectItem>
            <SelectItem value="Rejected">Từ chối</SelectItem>
            <SelectItem value="RequestResubmission">Yêu cầu bổ sung hồ sơ</SelectItem>
          </SelectContent>
        </Select>
        {compact && (
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.PARTNER_REQUESTS)}
          >
            Xem tất cả
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã hồ sơ</TableHead>
              <TableHead>Chủ đối tác</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian tạo</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Không có hồ sơ nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              items.map((request) => (
                <TableRow key={request.partnerRegistrationRequestId}>
                  <TableCell className="font-medium">{request.requestCode}</TableCell>
                  <TableCell>
                    {[request.partnerFirstName, request.partnerLastName]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </TableCell>
                  <TableCell>{request.companyName || "-"}</TableCell>
                  <TableCell>{request.partnerPhone || "-"}</TableCell>
                  <TableCell>
                    {renderStatusBadge(request.registrationStatus, getRegistrationStatusMeta)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(request.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(
                          ROUTES.PARTNER_REQUESTS_DETAIL(
                            request.partnerRegistrationRequestId,
                          ),
                        )
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
