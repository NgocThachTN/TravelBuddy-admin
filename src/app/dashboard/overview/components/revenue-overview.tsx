"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardRevenue, RescueCommissionRevenueData } from "@/types";
import { ChartTooltipContent, formatDayLabel } from "./shared";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function RevenueOverview({
  revenue,
  rescueCommission,
  windowDays,
}: {
  revenue: DashboardRevenue;
  rescueCommission?: RescueCommissionRevenueData | null;
  windowDays: number;
}) {
  const rescueCommissionByDay = new Map(
    (rescueCommission?.daily ?? []).map((item) => [
      formatDayLabel(item.dateUtc),
      item.commissionRevenueVnd,
    ]),
  );
  const rescueCommissionRevenueVnd =
    rescueCommission?.totalCommissionRevenueVnd ?? 0;
  const totalAdminCommissionRevenueVnd =
    revenue.servicePartnerCommissionRevenueVnd + rescueCommissionRevenueVnd;
  const chartData = revenue.daily.map((item) => ({
    label: formatDayLabel(item.date),
    subscription: item.subscriptionTravelerRevenueVnd,
    commission: item.servicePartnerCommissionRevenueVnd,
    rescueCommission: rescueCommissionByDay.get(formatDayLabel(item.date)) ?? 0,
    total: item.totalRevenueVnd,
  }));

  return (
    <Card className="border border-border/50 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
        <CardDescription className="text-[13px]">
          Gói đăng kí người dùng và Hoa hồng đối tác trong {windowDays}{" "}
          ngày
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-[12px] text-blue-700/80">
              Gói đăng kí người dùng
            </p>
            <p className="mt-1 text-[18px] font-semibold text-blue-900">
              {formatCurrency(revenue.subscriptionTravelerRevenueVnd)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-4 py-3">
            <p className="text-[12px] text-emerald-700/80">
              Hoa hồng đối tác
            </p>
            <p className="mt-1 text-[18px] font-semibold text-emerald-900">
              {formatCurrency(revenue.servicePartnerCommissionRevenueVnd)}
            </p>
          </div>
          <div className="rounded-lg bg-cyan-50 px-4 py-3">
            <p className="text-[12px] text-cyan-700/80">Hoa hồng cứu hộ</p>
            <p className="mt-1 text-[18px] font-semibold text-cyan-900">
              {formatCurrency(rescueCommissionRevenueVnd)}
            </p>
            <p className="mt-0.5 text-[11px] text-cyan-700/70">
              {(rescueCommission?.totalCommissionChargedRequests ?? 0).toLocaleString(
                "vi-VN",
              )}{" "}
              yêu cầu
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-4 py-3">
            <p className="text-[12px] text-amber-700/80">Tổng doanh thu</p>
            <p className="mt-1 text-[18px] font-semibold text-amber-900">
              {formatCurrency(revenue.totalRevenueVnd)}
            </p>
          </div>
          <div className="rounded-lg bg-rose-50 px-4 py-3">
            <p className="text-[12px] text-rose-700/80">
              Tổng hoa hồng admin
            </p>
            <p className="mt-1 text-[18px] font-semibold text-rose-900">
              {formatCurrency(totalAdminCommissionRevenueVnd)}
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Chưa có dữ liệu doanh thu.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-4 text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">
                  Gói đăng kí người dùng
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">
                  Hoa hồng đối tác
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-5 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Tổng doanh thu</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="h-2 w-5 rounded-full bg-cyan-500" />
              <span className="text-muted-foreground">Hoa hồng cứu hộ</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
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
                    width={70}
                    tickFormatter={(value) => value.toLocaleString("vi-VN")}
                  />
                  <RechartsTooltip content={<ChartTooltipContent unit="₫" />} />
                  <Line
                    type="monotone"
                    dataKey="subscription"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="rescueCommission"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#f59e0b"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
