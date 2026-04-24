"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Eye,
  HandCoins,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import PaginationControl from "@/components/pagination-control";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  fetchAdminRescueCommissionRevenue,
  fetchAdminRescueCommissionRevenuePartners,
} from "@/lib/api";
import { extractApiError } from "@/lib/api-error";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type {
  GetRescueCommissionPartnerSummaryParams,
  RescueCommissionPartnerSummaryItem,
  RescueCommissionRevenueData,
} from "@/types";
import {
  ChartTooltipContent,
  formatDayLabel,
} from "../../overview/components/shared";

const PRESET_DAYS = [7, 30, 90] as const;
const PAGE_SIZE = 10;

type PartnerSortBy = NonNullable<
  GetRescueCommissionPartnerSummaryParams["sortBy"]
>;
type PartnerSortDirection = NonNullable<
  GetRescueCommissionPartnerSummaryParams["sortDirection"]
>;

const SORTABLE_COLUMNS: Array<{
  key: PartnerSortBy;
  label: string;
  className?: string;
}> = [
  { key: "partnerName", label: "Partner" },
  { key: "completedRequestCount", label: "Số đơn hoàn thành", className: "text-right" },
  { key: "grossRevenueVnd", label: "Doanh thu", className: "text-right" },
  { key: "commissionRevenueVnd", label: "Hoa hồng", className: "text-right" },
];

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPresetRange(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));

  return {
    fromDate: toDateInputValue(from),
    toDate: toDateInputValue(to),
  };
}

function dateInputToUtcStart(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function dateInputToUtcEndExclusive(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}

function formatDateRange(data: RescueCommissionRevenueData | null) {
  if (!data) return "";
  const from = new Date(data.fromDateUtc).toLocaleDateString("vi-VN");
  const toExclusive = new Date(data.toDateUtc);
  toExclusive.setUTCDate(toExclusive.getUTCDate() - 1);
  const to = toExclusive.toLocaleDateString("vi-VN");
  return `${from} - ${to}`;
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

function buildPartnerDetailHref(
  item: RescueCommissionPartnerSummaryItem,
  fromDate: string,
  toDate: string,
) {
  const params = new URLSearchParams({
    fromUtc: dateInputToUtcStart(fromDate),
    toUtc: dateInputToUtcEndExclusive(toDate),
    partnerName: item.partnerName,
    completedRequestCount: String(item.completedRequestCount),
    grossRevenueVnd: String(item.grossRevenueVnd),
    commissionRevenueVnd: String(item.commissionRevenueVnd),
  });

  if (item.partnerAvatarUrl) {
    params.set("partnerAvatarUrl", item.partnerAvatarUrl);
  }

  return `${ROUTES.TRANSACTIONS_RESCUE_COMMISSION_REVENUE_PARTNER_DETAIL(
    item.partnerId,
  )}?${params.toString()}`;
}

function SummaryCard({
  title,
  value,
  description,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  tone: "emerald" | "cyan" | "amber";
  icon: typeof HandCoins;
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700",
    cyan: "bg-cyan-50 text-cyan-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <Card className="border border-border/50 py-0 shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] text-muted-foreground">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              toneClass,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SortIcon({
  active,
  direction,
}: {
  active: boolean;
  direction: PartnerSortDirection;
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

export default function RescueCommissionRevenuePage() {
  const initialRange = getPresetRange(30);
  const [fromDate, setFromDate] = useState(initialRange.fromDate);
  const [toDate, setToDate] = useState(initialRange.toDate);
  const [activePreset, setActivePreset] = useState<number>(30);

  const [chartDataSource, setChartDataSource] =
    useState<RescueCommissionRevenueData | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [chartErrorMessage, setChartErrorMessage] = useState<string | null>(null);

  const [partnerItems, setPartnerItems] = useState<
    RescueCommissionPartnerSummaryItem[]
  >([]);
  const [partnerTotalCount, setPartnerTotalCount] = useState(0);
  const [partnerTotalPages, setPartnerTotalPages] = useState(1);
  const [partnerPage, setPartnerPage] = useState(1);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [debouncedPartnerSearch, setDebouncedPartnerSearch] = useState("");
  const [partnerSortBy, setPartnerSortBy] =
    useState<PartnerSortBy>("commissionRevenueVnd");
  const [partnerSortDirection, setPartnerSortDirection] =
    useState<PartnerSortDirection>("desc");
  const [isPartnerLoading, setIsPartnerLoading] = useState(true);
  const [partnerErrorMessage, setPartnerErrorMessage] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chartData = useMemo(
    () =>
      (chartDataSource?.daily ?? []).map((item) => ({
        label: formatDayLabel(item.dateUtc),
        commission: item.commissionRevenueVnd,
      })),
    [chartDataSource],
  );

  const peakDay = useMemo(() => {
    if (!chartDataSource?.daily.length) return null;
    return chartDataSource.daily.reduce((max, item) =>
      item.commissionRevenueVnd > max.commissionRevenueVnd ? item : max,
    );
  }, [chartDataSource]);

  const hasInvalidRange = useMemo(
    () => new Date(toDate) < new Date(fromDate),
    [fromDate, toDate],
  );

  const rangeErrorMessage = hasInvalidRange
    ? "Khoảng ngày không hợp lệ. Ngày kết thúc phải sau ngày bắt đầu."
    : null;

  const loadChartData = useCallback(async () => {
    if (hasInvalidRange) {
      setChartErrorMessage(rangeErrorMessage);
      return;
    }

    setIsChartLoading(true);
    setChartErrorMessage(null);

    try {
      const response = await fetchAdminRescueCommissionRevenue({
        fromUtc: dateInputToUtcStart(fromDate),
        toUtc: dateInputToUtcEndExclusive(toDate),
      });
      setChartDataSource(response.data);
    } catch (err) {
      const apiError = extractApiError(
        err,
        "Không thể tải dữ liệu hoa hồng cứu hộ.",
      );
      setChartErrorMessage(apiError.message);
    } finally {
      setIsChartLoading(false);
    }
  }, [fromDate, hasInvalidRange, rangeErrorMessage, toDate]);

  const loadPartnerData = useCallback(async () => {
    if (hasInvalidRange) {
      setPartnerErrorMessage(rangeErrorMessage);
      return;
    }

    setIsPartnerLoading(true);
    setPartnerErrorMessage(null);

    try {
      const response = await fetchAdminRescueCommissionRevenuePartners({
        pageNumber: partnerPage,
        pageSize: PAGE_SIZE,
        search: debouncedPartnerSearch || undefined,
        sortBy: partnerSortBy,
        sortDirection: partnerSortDirection,
        fromUtc: dateInputToUtcStart(fromDate),
        toUtc: dateInputToUtcEndExclusive(toDate),
      });

      setPartnerItems(response.data.items);
      setPartnerTotalCount(response.data.totalCount ?? 0);
      setPartnerTotalPages(Math.max(response.data.totalPages ?? 1, 1));
    } catch (err) {
      const apiError = extractApiError(
        err,
        "Không thể tải bảng tổng hợp theo đối tác.",
      );
      setPartnerErrorMessage(apiError.message);
    } finally {
      setIsPartnerLoading(false);
    }
  }, [
    debouncedPartnerSearch,
    fromDate,
    hasInvalidRange,
    partnerPage,
    partnerSortBy,
    partnerSortDirection,
    rangeErrorMessage,
    toDate,
  ]);

  const handleRefresh = useCallback(async () => {
    if (hasInvalidRange) {
      setChartErrorMessage(rangeErrorMessage);
      setPartnerErrorMessage(rangeErrorMessage);
      return;
    }

    setIsRefreshing(true);
    await Promise.all([loadChartData(), loadPartnerData()]);
    setIsRefreshing(false);
  }, [hasInvalidRange, loadChartData, loadPartnerData, rangeErrorMessage]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedPartnerSearch(partnerSearch.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [partnerSearch]);

  useEffect(() => {
    setPartnerPage(1);
  }, [debouncedPartnerSearch, partnerSortBy, partnerSortDirection, fromDate, toDate]);

  useEffect(() => {
    void loadChartData();
  }, [loadChartData]);

  useEffect(() => {
    void loadPartnerData();
  }, [loadPartnerData]);

  function applyPreset(days: number) {
    const range = getPresetRange(days);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
    setActivePreset(days);
  }

  function handleDateChange(next: { fromDate?: string; toDate?: string }) {
    setActivePreset(0);
    if (next.fromDate !== undefined) setFromDate(next.fromDate);
    if (next.toDate !== undefined) setToDate(next.toDate);
  }

  function handleSort(column: PartnerSortBy) {
    if (partnerSortBy === column) {
      setPartnerSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setPartnerSortBy(column);
    setPartnerSortDirection(column === "partnerName" ? "asc" : "desc");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chi tiết hoa hồng bên dịch vụ cứu hộ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi doanh thu hoa hồng từ các yêu cầu cứu hộ đã hoàn tất
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <HandCoins className="h-5 w-5" />
        </div>
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_DAYS.map((days) => (
              <Button
                key={days}
                type="button"
                variant={activePreset === days ? "default" : "outline"}
                size="sm"
                onClick={() => applyPreset(days)}
              >
                {days} ngày
              </Button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-muted-foreground">Từ ngày</p>
              <Input
                type="date"
                value={fromDate}
                onChange={(event) =>
                  handleDateChange({ fromDate: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-muted-foreground">Đến ngày</p>
              <Input
                type="date"
                value={toDate}
                onChange={(event) => handleDateChange({ toDate: event.target.value })}
              />
            </div>
            <Button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing || hasInvalidRange}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Làm mới
            </Button>
          </div>
        </CardContent>
      </Card>

      {rangeErrorMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {rangeErrorMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Tổng hoa hồng"
          value={formatCurrency(chartDataSource?.totalCommissionRevenueVnd ?? 0)}
          description={
            chartDataSource ? formatDateRange(chartDataSource) : "Đang tải khoảng dữ liệu"
          }
          tone="emerald"
          icon={HandCoins}
        />
        <SummaryCard
          title="Yêu cầu đã tính hoa hồng"
          value={(chartDataSource?.totalCommissionChargedRequests ?? 0).toLocaleString(
            "vi-VN",
          )}
          description="Các yêu cầu cứu hộ đã hoàn tất và có hoa hồng"
          tone="cyan"
          icon={ReceiptText}
        />
        <SummaryCard
          title="Ngày cao nhất"
          value={peakDay ? formatCurrency(peakDay.commissionRevenueVnd) : "0 ₫"}
          description={
            peakDay
              ? new Date(peakDay.dateUtc).toLocaleDateString("vi-VN")
              : "Chưa có dữ liệu"
          }
          tone="amber"
          icon={CalendarDays}
        />
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Biểu đồ hoa hồng theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          {isChartLoading ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải dữ liệu
            </div>
          ) : chartErrorMessage ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-destructive">
              {chartErrorMessage}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              Chưa có dữ liệu hoa hồng trong khoảng đã chọn.
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    stroke="#f0f0f0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    width={78}
                    tickFormatter={(value) => Number(value).toLocaleString("vi-VN")}
                  />
                  <RechartsTooltip content={<ChartTooltipContent unit="₫" />} />
                  <Bar dataKey="commission" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                Bảng tổng hợp theo đối tác
              </CardTitle>
              <CardDescription className="text-[13px]">
                Tổng hợp số đơn hoàn thành, doanh thu và hoa hồng của từng đối tác
              </CardDescription>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={partnerSearch}
                onChange={(event) => setPartnerSearch(event.target.value)}
                placeholder="Tìm theo tên đối tác..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              Tổng cộng <span className="font-semibold text-foreground">{partnerTotalCount}</span>{" "}
              đối tác phù hợp
            </span>
          </div>

          {partnerErrorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {partnerErrorMessage}
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                {SORTABLE_COLUMNS.map((column) => {
                  const active = partnerSortBy === column.key;

                  return (
                    <TableHead key={column.key} className={column.className}>
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-left",
                          column.className === "text-right" && "ml-auto",
                        )}
                      >
                        <span>{column.label}</span>
                        <SortIcon active={active} direction={partnerSortDirection} />
                      </button>
                    </TableHead>
                  );
                })}
                <TableHead className="text-right">Chi tiết</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPartnerLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={SORTABLE_COLUMNS.length + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                    Đang tải bảng partner
                  </TableCell>
                </TableRow>
              ) : partnerItems.length > 0 ? (
                partnerItems.map((item) => {
                  const detailHref = buildPartnerDetailHref(item, fromDate, toDate);

                  return (
                    <TableRow key={item.partnerId}>
                      <TableCell>
                        <Link
                          href={detailHref}
                          className="flex items-center gap-3 rounded-md transition-colors hover:text-primary"
                        >
                          <Avatar size="default">
                            <AvatarImage src={item.partnerAvatarUrl ?? undefined} alt={item.partnerName} />
                            <AvatarFallback>{getPartnerInitials(item.partnerName)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{item.partnerName}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.completedRequestCount.toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.grossRevenueVnd)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-emerald-700">
                        {formatCurrency(item.commissionRevenueVnd)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={detailHref}>
                            <Eye className="h-4 w-4" />
                            Xem đơn
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={SORTABLE_COLUMNS.length + 1}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Không có partner nào trong khoảng này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {partnerPage} / {partnerTotalPages}
            </p>
            <PaginationControl
              currentPage={partnerPage}
              totalPages={partnerTotalPages}
              onPageChange={setPartnerPage}
              className="mx-0 w-auto justify-end"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
