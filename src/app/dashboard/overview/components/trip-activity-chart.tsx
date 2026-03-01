import { Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartTooltipContent } from "./shared";

const tripData = [
  { month: "Th8", trips: 65 }, { month: "Th9", trips: 78 }, { month: "Th10", trips: 92 },
  { month: "Th11", trips: 85 }, { month: "Th12", trips: 110 }, { month: "Th1", trips: 98 }, { month: "Th2", trips: 34 },
];

export function TripActivityChart() {
  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Chuyến đi mới</CardTitle>
          <CardDescription className="text-[13px]">Số lượng theo tháng</CardDescription>
        </div>
        <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
          <Activity className="h-3 w-3" /> 7 tháng
        </span>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tripData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
              <RechartsTooltip content={<ChartTooltipContent unit="chuyến" />} />
              <Bar dataKey="trips" radius={[5, 5, 0, 0]} maxBarSize={28}>
                {tripData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === tripData.length - 1 ? "#10b98166" : "#10b981"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
