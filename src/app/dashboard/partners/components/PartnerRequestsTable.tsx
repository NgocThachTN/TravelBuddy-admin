"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Eye, FileText, Filter, Loader2, RefreshCw, Search } from "lucide-react";
import {
  fetchCacheInvalidationConnectionInfo,
  fetchPartnerRequests,
} from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getRegistrationStatusMeta, renderStatusBadge } from "@/lib/partner-display";
import type { PartnerRequestListItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControl from "@/components/pagination-control";

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

type RequestStatusFilter =
  | "all"
  | "InReview"
  | "Approved"
  | "Rejected"
  | "RequestResubmission";

const REQUEST_STATUS_OPTIONS: Array<{
  value: RequestStatusFilter;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "InReview", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Từ chối" },
  { value: "RequestResubmission", label: "Bổ sung hồ sơ" },
];

type PartnerRegistrationRealtimeEvent = {
  partnerRegistrationId?: string;
};

interface PartnerRequestsTableProps {
  compact?: boolean;
}

export default function PartnerRequestsTable({
  compact = false,
}: PartnerRequestsTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RequestStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<PartnerRequestListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSize = compact ? 5 : 10;

  const loadRequests = useCallback(
    async (targetPage = page) => {
      try {
        setLoading(true);
        const result = await fetchPartnerRequests({
          pageNumber: targetPage,
          pageSize,
          registrationStatus: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearch || undefined,
        });

        setItems(result.data.items);
        setTotalCount(result.data.totalCount ?? result.data.items.length);
        setTotalPages(Math.max(result.data.totalPages || 1, 1));
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải hồ sơ đăng ký đối tác.",
        );
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, page, pageSize, statusFilter],
  );

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadRequests(page);
  }, [loadRequests, page]);

  useEffect(() => {
    let isDisposed = false;
    let realtimeConnection: HubConnection | null = null;

    async function startRealtime() {
      try {
        const connectionInfo = await fetchCacheInvalidationConnectionInfo();
        if (isDisposed) {
          return;
        }

        realtimeConnection = new HubConnectionBuilder()
          .withUrl(connectionInfo.hubUrl, {
            accessTokenFactory: async () => {
              const latestConnectionInfo = await fetchCacheInvalidationConnectionInfo();
              return latestConnectionInfo.accessToken;
            },
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Warning)
          .build();

        realtimeConnection.on(
          "partner_registration_status_changed",
          (payload: PartnerRegistrationRealtimeEvent) => {
            if (!payload?.partnerRegistrationId) {
              return;
            }

            setPage(1);
            void loadRequests(1);
          },
        );

        await realtimeConnection.start();

        if (isDisposed) {
          await realtimeConnection.stop();
        }
      } catch (realtimeError) {
        console.error("Không thể khởi tạo realtime hồ sơ đối tác.", realtimeError);
      }
    }

    void startRealtime();

    return () => {
      isDisposed = true;
      realtimeConnection?.off("partner_registration_status_changed");
      void realtimeConnection?.stop();
    };
  }, [loadRequests]);

  if (loading && items.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="h-9 w-full max-w-sm animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
        </div>
        <CardContent className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-0">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-6 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-center py-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => void loadRequests(1)}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm mã hồ sơ, tên đối tác, công ty, SĐT..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 bg-background pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-0.5 rounded-lg border bg-muted/50 p-0.5">
          {REQUEST_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === option.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => void loadRequests(page)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Tổng cộng <span className="font-semibold text-foreground">{totalCount}</span> hồ sơ đăng ký
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã hồ sơ</TableHead>
            <TableHead>Chủ đối tác</TableHead>
            <TableHead>Công ty</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Thời gian tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Không tìm thấy hồ sơ phù hợp</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái
                </p>
              </TableCell>
            </TableRow>
          ) : (
            items.map((request) => (
              <TableRow key={request.partnerRegistrationRequestId} className="group">
                <TableCell className="font-medium">{request.requestCode}</TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {[request.partnerFirstName, request.partnerLastName]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {request.partnerEmail || request.servicePartnerName || "-"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{request.companyName || "-"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {request.partnerPhone || "-"}
                </TableCell>
                <TableCell>
                  {renderStatusBadge(
                    request.registrationStatus,
                    getRegistrationStatusMeta,
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatRelativeTime(request.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          ROUTES.PARTNER_REQUESTS_DETAIL(
                            request.partnerRegistrationRequestId,
                          ),
                        )
                      }
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Xem
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Trang {page} / {totalPages}
        </p>
        <PaginationControl
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="mx-0 w-auto justify-end"
        />
      </div>
    </Card>
  );
}
