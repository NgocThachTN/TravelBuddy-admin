"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardUserGrowthPoint } from "@/types";
import { ChartTooltipContent, formatDayLabel } from "./shared";

export function UserGrowthChart({
  data,
}: {
  data: DashboardUserGrowthPoint[];
}) {
  const chartData = data.map((item) => ({
    label: formatDayLabel(item.date),
    users: item.currentCount,
    prev: item.previousCount,
  }));

  return (
    <Card className="lg:col-span-4 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Tăng trưởng người dùng</CardTitle>
          <CardDescription className="text-[13px]">So sánh với kỳ trước</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Chưa có dữ liệu tăng trưởng người dùng.
          </p>
        ) : (
          <>
        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="h-2 w-5 rounded-full bg-[#FCD240]" />
            <span className="text-muted-foreground">Kỳ này</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="h-2 w-5 rounded-full bg-border" />
            <span className="text-muted-foreground">Kỳ trước</span>
          </div>
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCD240" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FCD240" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={36} />
              <RechartsTooltip content={<ChartTooltipContent unit="người" />} />
              <Area type="monotone" dataKey="prev" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#FCD240"
                strokeWidth={2}
                fill="url(#currentGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#FCD240", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
