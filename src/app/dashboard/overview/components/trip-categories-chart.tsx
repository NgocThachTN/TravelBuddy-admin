import { MoreHorizontal, Compass, Building2, Palmtree, Mountain, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const tripCategoryData = [
  { name: "Phiêu lưu", value: 145, color: "#3b82f6" },
  { name: "Văn hóa", value: 120, color: "#8b5cf6" },
  { name: "Biển", value: 98, color: "#06b6d4" },
  { name: "Núi", value: 112, color: "#10b981" },
  { name: "Thành phố", value: 87, color: "#f59e0b" },
];

const totalTrips = tripCategoryData.reduce((sum, c) => sum + c.value, 0);

export function TripCategoriesChart() {
  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Phân loại chuyến đi</CardTitle>
          <CardDescription className="text-[13px]">Phân bổ {totalTrips} chuyến</CardDescription>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={tripCategoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                {tripCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-1">
          {tripCategoryData.map((cat) => {
            const pct = Math.round((cat.value / totalTrips) * 100);
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
      </CardContent>
    </Card>
  );
}
