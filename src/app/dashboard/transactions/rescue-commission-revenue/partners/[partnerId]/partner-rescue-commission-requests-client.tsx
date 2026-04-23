"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Eye,
  Loader2,
  ReceiptText,
  Search,
  Wrench,
} from "lucide-react";
import PaginationControl from "@/components/pagination-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminRescueCommissionPartnerRequests } from "@/lib/api";
import { extractApiError } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  GetPartnerRescueCommissionRequestsParams,
  PartnerRescueCommissionRequestItem,
} from "@/types";

const PAGE_SIZE = 10;

type RequestSortBy = NonNullable<
  GetPartnerRescueCommissionRequestsParams["sortBy"]
>;
type RequestSortDirection = NonNullable<
  GetPartnerRescueCommissionRequestsParams["sortDirection"]
>;

export interface PartnerDetailInitialContext {
  partnerName?: string;
  partnerAvatarUrl?: string;
  completedRequestCount?: string;
  grossRevenueVnd?: string;
  commissionRevenueVnd?: string;
  fromUtc?: string;
  toUtc?: string;
  windowDays?: string;
}

const SORTABLE_COLUMNS: Array<{
  key: RequestSortBy;
  label: string;
  className?: string;
}> = [
  { key: "commissionChargedAt", label: "Ngày tính hoa hồng", className: "text-right" },
  { key: "completedAt", label: "Ngày hoàn tất", className: "text-right" },
  { key: "totalOrderAmount", label: "Tổng đơn", className: "text-right" },
  { key: "commissionAmount", label: "Hoa hồng", className: "text-right" },
];

function formatCurrency(value?: number | null) {
  return value == null ? "-" : `${value.toLocaleString("vi-VN")} đ`;
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

function parseNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getPartnerInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "DT";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: RequestSortDirection;
}) {
  if (!active) {
    return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
  }

  return direction === "asc" ? (
    <ArrowUp className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="h-3.5 w-3.5" />
  );
}

function SummaryMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "emerald";
}) {
  return (
    <div className="rounded-lg border border-border/50 px-4 py-3">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold text-foreground",
          tone === "emerald" && "text-emerald-700",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function PartnerRescueCommissionRequestsClient({
  partnerId,
  initialContext,
}: {
  partnerId: string;
  initialContext: PartnerDetailInitialContext;
}) {
  const [items, setItems] = useState<PartnerRescueCommissionRequestItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<RequestSortBy>("commissionChargedAt");
  const [sortDirection, setSortDirection] = useState<RequestSortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firstItem = items[0] ?? null;
  const partnerName =
    initialContext.partnerName?.trim() || firstItem?.partnerName || "Đối tác cứu hộ";
  const partnerAvatarUrl =
    initialContext.partnerAvatarUrl?.trim() || firstItem?.partnerAvatarUrl || null;
  const completedRequestCount =
    parseNumber(initialContext.completedRequestCount) ?? totalCount;
  const grossRevenueVnd = parseNumber(initialContext.grossRevenueVnd);
  const commissionRevenueVnd = parseNumber(initialContext.commissionRevenueVnd);

  const dateRangeLabel = useMemo(() => {
    if (initialContext.fromUtc && initialContext.toUtc) {
      const from = new Date(initialContext.fromUtc).toLocaleDateString("vi-VN");
      const toExclusive = new Date(initialContext.toUtc);
      toExclusive.setUTCDate(toExclusive.getUTCDate() - 1);
      return `${from} - ${toExclusive.toLocaleDateString("vi-VN")}`;
    }

    if (initialContext.windowDays) {
      return `${initialContext.windowDays} ngày gần nhất`;
    }

    return "30 ngày gần nhất";
  }, [initialContext.fromUtc, initialContext.toUtc, initialContext.windowDays]);

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: GetPartnerRescueCommissionRequestsParams = {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sortBy,
        sortDirection,
      };

      if (initialContext.fromUtc && initialContext.toUtc) {
        params.fromUtc = initialContext.fromUtc;
        params.toUtc = initialContext.toUtc;
      } else if (
        initialContext.windowDays === "7" ||
        initialContext.windowDays === "30" ||
        initialContext.windowDays === "90"
      ) {
        params.windowDays = Number(initialContext.windowDays) as 7 | 30 | 90;
      }

      const response = await fetchAdminRescueCommissionPartnerRequests(
        partnerId,
        params,
      );

      setItems(response.data.items);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(Math.max(response.data.totalPages ?? 1, 1));
    } catch (err) {
      const apiError = extractApiError(
        err,
        "Không thể tải danh sách đơn cứu hộ của đối tác.",
      );
      setErrorMessage(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearch,
    initialContext.fromUtc,
    initialContext.toUtc,
    initialContext.windowDays,
    page,
    partnerId,
    sortBy,
    sortDirection,
  ]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, sortDirection]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  function handleSort(column: RequestSortBy) {
    if (sortBy === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(column);
    setSortDirection("desc");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.TRANSACTIONS_RESCUE_COMMISSION_REVENUE}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại bảng tổng hợp
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={partnerAvatarUrl ?? undefined} alt={partnerName} />
              <AvatarFallback>{getPartnerInitials(partnerName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight">
                  {partnerName}
                </h1>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  Đối tác cứu hộ
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Danh sách đơn cứu hộ đã hoàn tất và đã tính hoa hồng trong{" "}
                {dateRangeLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <Wrench className="h-5 w-5" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryMetric
          label="Số đơn hoàn thành"
          value={completedRequestCount.toLocaleString("vi-VN")}
        />
        <SummaryMetric
          label="Doanh thu"
          value={formatCurrency(grossRevenueVnd)}
        />
        <SummaryMetric
          label="Hoa hồng"
          value={formatCurrency(commissionRevenueVnd)}
          tone="emerald"
        />
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ReceiptText className="h-4 w-4" />
                Đơn cứu hộ của partner
              </CardTitle>
              <CardDescription className="text-[13px]">
                Xem chi tiết từng đơn, phí dịch vụ, phí di chuyển, tiền cọc,
                hoa hồng và số tiền đối tác thực nhận
              </CardDescription>
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm mã đơn, khách, SĐT..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Đơn cứu hộ</TableHead>
                <TableHead>Khách hàng</TableHead>
                {SORTABLE_COLUMNS.map((column) => {
                  const active = sortBy === column.key;

                  return (
                    <TableHead key={column.key} className={column.className}>
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="ml-auto inline-flex items-center gap-1.5 text-left"
                      >
                        <span>{column.label}</span>
                        <SortIcon active={active} direction={sortDirection} />
                      </button>
                    </TableHead>
                  );
                })}
                <TableHead className="text-right">Đối tác thực nhận</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách đơn cứu hộ
                  </TableCell>
                </TableRow>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.rescueRequestId}>
                    <TableCell>
                      <div className="font-medium">
                        #{item.rescueRequestId.slice(0, 8)}
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        Tạo: {formatDate(item.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {item.travelerDisplayName || "Chưa có tên"}
                      </div>
                      <div className="text-[12px] text-muted-foreground">
                        {item.travelerPhone || "Chưa có SĐT"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(item.commissionChargedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(item.completedAt)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.totalOrderAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-700">
                      {formatCurrency(item.commissionAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.partnerNetAmount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={ROUTES.RESCUE_REQUESTS_DETAIL(
                            item.rescueRequestId,
                          )}
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Không có đơn cứu hộ nào trong khoảng này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Tổng cộng <span className="font-semibold text-foreground">{totalCount}</span>{" "}
              đơn, trang {page} / {totalPages}
            </p>
            <PaginationControl
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mx-0 w-auto justify-end"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
