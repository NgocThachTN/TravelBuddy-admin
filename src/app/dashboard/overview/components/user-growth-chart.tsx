"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { TimeRange } from "@/types";
import { TimeRangeSelector, ChartTooltipContent } from "./shared";

const userGrowthData = [
  { month: "Th8", users: 820, prev: 720 },
  { month: "Th9", users: 890, prev: 780 },
  { month: "Th10", users: 960, prev: 850 },
  { month: "Th11", users: 1050, prev: 910 },
  { month: "Th12", users: 1130, prev: 980 },
  { month: "Th1", users: 1180, prev: 1020 },
  { month: "Th2", users: 1248, prev: 1109 },
];

export function UserGrowthChart({ chartRange, onRangeChange }: { chartRange: TimeRange; onRangeChange: (v: TimeRange) => void }) {
  return (
    <Card className="lg:col-span-4 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Tăng trưởng người dùng</CardTitle>
          <CardDescription className="text-[13px]">So sánh với kỳ trước</CardDescription>
        </div>
        <TimeRangeSelector value={chartRange} onChange={onRangeChange} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-4 mb-3">
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
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FCD240" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#FCD240" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={36} />
              <RechartsTooltip content={<ChartTooltipContent unit="người" />} />
              <Area type="monotone" dataKey="prev" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
              <Area type="monotone" dataKey="users" stroke="#FCD240" strokeWidth={2} fill="url(#currentGrad)" dot={false}
                activeDot={{ r: 4, fill: "#FCD240", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
