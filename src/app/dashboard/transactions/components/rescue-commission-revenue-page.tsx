"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  HandCoins,
  Loader2,
  RefreshCw,
  ReceiptText,
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
import { fetchAdminRescueCommissionRevenue } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { RescueCommissionRevenueData } from "@/types";
import { ChartTooltipContent, formatDayLabel } from "../../overview/components/shared";

const PRESET_DAYS = [7, 30, 90] as const;

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
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-3 text-[12px] text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function RescueCommissionRevenuePage() {
  const initialRange = getPresetRange(30);
  const [fromDate, setFromDate] = useState(initialRange.fromDate);
  const [toDate, setToDate] = useState(initialRange.toDate);
  const [activePreset, setActivePreset] = useState<number>(30);
  const [data, setData] = useState<RescueCommissionRevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      (data?.daily ?? []).map((item) => ({
        label: formatDayLabel(item.dateUtc),
        commission: item.commissionRevenueVnd,
      })),
    [data],
  );

  const peakDay = useMemo(() => {
    if (!data?.daily.length) return null;
    return data.daily.reduce((max, item) =>
      item.commissionRevenueVnd > max.commissionRevenueVnd ? item : max,
    );
  }, [data]);

  const loadData = useCallback(
    async (manualRefresh = false) => {
      if (new Date(toDate) < new Date(fromDate)) {
        setErrorMessage("Khoảng ngày không hợp lệ. Ngày kết thúc phải sau ngày bắt đầu.");
        return;
      }

      if (manualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await fetchAdminRescueCommissionRevenue({
          fromUtc: dateInputToUtcStart(fromDate),
          toUtc: dateInputToUtcEndExclusive(toDate),
        });
        setData(response.data);
      } catch {
        setErrorMessage("Không thể tải dữ liệu hoa hồng cứu hộ. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [fromDate, toDate],
  );

  useEffect(() => {
    void loadData(false);
  }, [loadData]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Chi tiết hoa hồng partner cứu hộ
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
              onClick={() => void loadData(true)}
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
        </CardContent>
      </Card>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard
          title="Tổng hoa hồng"
          value={formatCurrency(data?.totalCommissionRevenueVnd ?? 0)}
          description={data ? formatDateRange(data) : "Đang tải khoảng dữ liệu"}
          tone="emerald"
          icon={HandCoins}
        />
        <SummaryCard
          title="Yêu cầu đã tính hoa hồng"
          value={(data?.totalCommissionChargedRequests ?? 0).toLocaleString("vi-VN")}
          description="Các rescue request hoàn tất và có commission"
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
          <CardTitle className="text-sm font-medium">
            Biểu đồ hoa hồng theo ngày
          </CardTitle>
          <CardDescription className="text-[13px]">
            Nguồn dữ liệu từ /api/v1/admin/dashboard/rescue-commission-revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải dữ liệu
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
                  <Bar
                    dataKey="commission"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Bảng chi tiết theo ngày
          </CardTitle>
          <CardDescription className="text-[13px]">
            Endpoint hiện trả aggregate theo ngày, chưa có breakdown từng partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Hoa hồng partner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                    Đang tải dữ liệu
                  </TableCell>
                </TableRow>
              ) : data?.daily.length ? (
                data.daily.map((item) => (
                  <TableRow key={item.dateUtc}>
                    <TableCell>
                      {new Date(item.dateUtc).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.commissionRevenueVnd)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-20 text-center text-muted-foreground">
                    Không có hoa hồng trong khoảng này.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
