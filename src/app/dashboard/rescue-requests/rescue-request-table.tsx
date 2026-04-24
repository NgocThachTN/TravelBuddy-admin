"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { Eye, Loader2, RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import PaginationControl from "@/components/pagination-control";
import { fetchRescueRequests } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { getVehicleServiceScopeLabel } from "@/lib/partner-display";
import { cn } from "@/lib/utils";
import type {
  RescueRequestListItem,
  RescueRequestStatus,
  GetRescueRequestsParams,
} from "@/types";
import {
  RESCUE_REQUEST_STATUSES,
  rescueRequestStatusLabel,
} from "@/types";

const PAGE_SIZE = 10;

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
    case "New":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Received":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";
    case "InProgress":
    case "Arrived":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Rejected":
    case "Cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

export default function RescueRequestTable() {
  const [items, setItems] = useState<RescueRequestListItem[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<RescueRequestStatus | "all">("all");
  const [sortBy, setSortBy] =
    useState<NonNullable<GetRescueRequestsParams["sortBy"]>>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<NonNullable<GetRescueRequestsParams["sortDirection"]>>("desc");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadItems = useCallback(
    async (manualRefresh = false) => {
      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const result = await fetchRescueRequests({
          pageNumber,
          pageSize: PAGE_SIZE,
          search: deferredSearch,
          status,
          sortBy,
          sortDirection,
        });
        setItems(result.data.items);
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount);
      } catch {
        setErrorMessage("Không thể tải danh sách đơn cứu hộ. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [deferredSearch, pageNumber, sortBy, sortDirection, status],
  );

  useEffect(() => {
    void loadItems(false);
  }, [loadItems]);

  function handleStatusChange(value: string) {
    setStatus(value as RescueRequestStatus | "all");
    setPageNumber(1);
  }

  return (
    <Card className="border border-border/50 shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPageNumber(1);
              }}
            placeholder="Tìm theo mã đơn, người dùng, đối tác, biển số..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {RESCUE_REQUEST_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {rescueRequestStatusLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value) =>
                setSortBy(value as NonNullable<GetRescueRequestsParams["sortBy"]>)
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="receivedAt">Ngày tiếp nhận</SelectItem>
                <SelectItem value="status">Trạng thái</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortDirection}
              onValueChange={(value) =>
                setSortDirection(
                  value as NonNullable<GetRescueRequestsParams["sortDirection"]>,
                )
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Thứ tự" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mới nhất</SelectItem>
                <SelectItem value="asc">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => void loadItems(true)}
              disabled={isLoading || isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Làm mới
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn cứu hộ</TableHead>
                <TableHead>Traveler</TableHead>
                <TableHead>Đối tác</TableHead>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                    Đang tải danh sách đơn cứu hộ
                  </TableCell>
                </TableRow>
              ) : items.length ? (
                items.map((item) => (
                  <TableRow key={item.rescueRequestId}>
                    <TableCell>
                      <div className="max-w-[160px]">
                        <p className="truncate font-medium">
                          #{item.rescueRequestId.slice(0, 8)}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {item.vehicleType
                            ? getVehicleServiceScopeLabel(item.vehicleType)
                            : "Chưa rõ loại xe"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.travelerDisplayName || "Traveler"}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {item.travelerPhone || "Chưa có SĐT"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-[180px] truncate">
                        {item.assignedPartnerName || "Chưa có đối tác"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {item.serviceTypes.length ? (
                          item.serviceTypes.slice(0, 3).map((service) => (
                            <Badge key={service} variant="outline" className="text-[11px]">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[11px]", statusClass(item.status))}
                      >
                        {rescueRequestStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalOrderAmount)}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={ROUTES.RESCUE_REQUESTS_DETAIL(item.rescueRequestId)}>
                          <Eye className="h-4 w-4" />
                          Xem
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                    Không có đơn cứu hộ phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Tổng cộng {totalCount.toLocaleString("vi-VN")} đơn cứu hộ
          </p>
          <PaginationControl
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>
      </CardContent>
    </Card>
  );
}
