import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import type { DashboardCategoryDistributionItem } from "@/types";

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export function TripCategoriesChart({
  data,
}: {
  data: DashboardCategoryDistributionItem[];
}) {
  const tripCategoryData = data.map((item, index) => ({
    name: item.label,
    value: item.value,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  const totalTrips = tripCategoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Phân loại chuyến đi</CardTitle>
          <CardDescription className="text-[13px]">Phân bổ {totalTrips.toLocaleString("vi-VN")} chuyến</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {tripCategoryData.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Chưa có dữ liệu phân loại chuyến đi.
          </p>
        ) : (
          <>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tripCategoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {tripCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "13px",
                  padding: "8px 12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 space-y-2">
          {tripCategoryData.map((cat) => {
            const pct = totalTrips > 0 ? Math.round((cat.value / totalTrips) * 100) : 0;
            return (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-[13px] text-foreground/80 flex-1">{cat.name}</span>
                <span className="text-[12px] tabular-nums text-muted-foreground">{cat.value}</span>
                <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                </div>
                <span className="text-[12px] tabular-nums font-medium text-foreground/70 w-7 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
