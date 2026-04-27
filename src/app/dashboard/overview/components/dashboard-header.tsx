import { CalendarDays, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getToday, TimeRangeSelector } from "./shared";
import type { TimeRange } from "@/types";

export function DashboardHeader({
  systemStatusLabel,
  generatedAtUtc,
  chartRange,
  onRangeChange,
  onRefresh,
  isRefreshing,
}: {
  systemStatusLabel: string;
  generatedAtUtc: string;
  chartRange: TimeRange;
  onRangeChange: (value: TimeRange) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const generatedAt = new Date(generatedAtUtc).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          Tổng quan
        </h1>
        <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{getToday()}</span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {systemStatusLabel}
          </span>
          <span className="text-border">·</span>
          <span>Cập nhật {generatedAt}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TimeRangeSelector value={chartRange} onChange={onRangeChange} />
        <Button
          variant="outline"
          size="sm"
          className="text-muted-foreground h-8 text-[13px]"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
        <Button
          size="sm"
          className="bg-foreground text-background hover:bg-foreground/90 h-8 text-[13px]"
          disabled
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
}

