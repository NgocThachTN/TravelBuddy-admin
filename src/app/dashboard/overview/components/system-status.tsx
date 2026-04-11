import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSystemStatus } from "@/types";

export function SystemStatus({
  data,
  generatedAtUtc,
}: {
  data: DashboardSystemStatus;
  generatedAtUtc: string;
}) {
  const generatedAt = new Date(generatedAtUtc).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const services = [
    {
      label: "Hàng chờ duyệt chuyến đi",
      value: `${data.pendingModerationQueue.toLocaleString("vi-VN")} chuyến đi`,
    },
    {
      label: "Báo cáo đang chờ",
      value: `${data.pendingReports.toLocaleString("vi-VN")} báo cáo`,
    },
    {
      label: "Hồ sơ đối tác chờ",
      value: `${data.pendingPartnerRequests.toLocaleString("vi-VN")} hồ sơ`,
    },
  ];

  return (
    <Card className="lg:col-span-3 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
        <span className="text-[11px] text-muted-foreground/60">{generatedAt}</span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {services.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/30">
              <div className="flex items-center gap-2">
                <span className="flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
                <span className="text-[13px] text-foreground">{s.label}</span>
              </div>
              <span className="text-[12px] text-muted-foreground tabular-nums">{s.value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Tỉ lệ xử lý báo cáo</span>
            <span className="font-medium text-foreground">
              {data.reportProcessingRatePercent.toLocaleString("vi-VN")}%
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Thời gian xử lý TB</span>
            <span className="font-medium text-foreground">
              {data.averageReportProcessingHours !== null
                ? `${data.averageReportProcessingHours.toLocaleString("vi-VN")} giờ`
                : "Chưa có dữ liệu"}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Trạng thái tổng thể</span>
            <span className="font-medium text-foreground">{data.overallStatus}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

