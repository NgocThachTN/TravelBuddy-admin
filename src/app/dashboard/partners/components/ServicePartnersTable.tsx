"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";
import { fetchServicePartners } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import {
  getServicePartnerStatusMeta,
  renderStatusBadge,
} from "@/lib/partner-display";
import type { ServicePartnerListItem } from "@/types";
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

interface ServicePartnersTableProps {
  compact?: boolean;
}

export default function ServicePartnersTable({
  compact = false,
}: ServicePartnersTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [items, setItems] = useState<ServicePartnerListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = compact ? 5 : 10;

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const result = await fetchServicePartners({
          pageNumber: page,
          pageSize,
          servicePartnerStatus: statusFilter,
        });

        if (ignore) return;
        setItems(result.data.items);
        setTotalPages(Math.max(result.data.totalPages || 1, 1));
        setError(null);
      } catch (err) {
        if (ignore) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải danh sách đối tác dịch vụ",
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
            <SelectItem value="Active">Đang hoạt động</SelectItem>
            <SelectItem value="Inactive">Chưa kích hoạt</SelectItem>
            <SelectItem value="Suspended">Tạm khóa</SelectItem>
          </SelectContent>
        </Select>
        {compact && (
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.ACTIVE_PARTNERS)}
          >
            Xem tất cả
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đối tác dịch vụ</TableHead>
              <TableHead>Chủ đối tác</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày xác minh</TableHead>
              <TableHead className="text-right">Chi tiết</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Không có đối tác dịch vụ nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((partner) => (
                <TableRow key={partner.servicePartnerId}>
                  <TableCell className="font-medium">
                    {partner.servicePartnerName || "-"}
                  </TableCell>
                  <TableCell>
                    {[partner.partnerFirstName, partner.partnerLastName]
                      .filter(Boolean)
                      .join(" ") || "-"}
                  </TableCell>
                  <TableCell>{partner.companyName || "-"}</TableCell>
                  <TableCell>
                    {renderStatusBadge(partner.servicePartnerStatus, getServicePartnerStatusMeta)}
                  </TableCell>
                  <TableCell>
                    {partner.verifiedAt
                      ? new Date(partner.verifiedAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(
                          ROUTES.ACTIVE_PARTNERS_DETAIL(partner.servicePartnerId),
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
