import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardTopDestinationItem } from "@/types";

export function TopDestinations({
  data,
}: {
  data: DashboardTopDestinationItem[];
}) {
  const maxTripCount = data[0]?.tripCount ?? 1;

  return (
    <Card className="lg:col-span-5 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Điểm đến phổ biến</CardTitle>
          <CardDescription className="text-[13px]">Xếp hạng theo số chuyến đi</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground hover:text-foreground h-7">
          Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {data.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Chưa có dữ liệu điểm đến.
          </p>
        ) : (
        <div className="space-y-1">
          {data.map((dest, idx) => (
            <div key={dest.destinationName} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors -mx-1">
              <span className="text-[13px] font-medium text-muted-foreground/50 w-4 tabular-nums">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground">{dest.destinationName}</p>
                <p className="text-[11px] text-muted-foreground">{dest.tripCount.toLocaleString("vi-VN")} chuyến đi</p>
              </div>
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{
                    width: `${Math.max(10, Math.round((dest.tripCount / maxTripCount) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
