import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor, formatRelativeTime } from "./shared";
import type { DashboardRecentActivityItem } from "@/types";

const typeBadge: Record<string, { label: string; dot: string; className: string }> = {
  Trip: { label: "Chuyến đi", dot: "bg-blue-500", className: "text-blue-700" },
  Report: { label: "Báo cáo", dot: "bg-rose-500", className: "text-rose-700" },
  User: { label: "Người dùng", dot: "bg-slate-400", className: "text-slate-600" },
  PartnerRequest: { label: "Đối tác", dot: "bg-amber-500", className: "text-amber-700" },
};

export function RecentActivity({
  data,
}: {
  data: DashboardRecentActivityItem[];
}) {
  return (
    <Card className="border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div>
          <CardTitle className="text-sm font-medium">Hoạt động gần đây</CardTitle>
          <CardDescription className="text-[13px]">Dòng thời gian hoạt động trên nền tảng</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground h-8">
          Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        {data.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            Chưa có hoạt động gần đây.
          </p>
        ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" />
          {data.map((item, idx) => {
            const badge = typeBadge[item.activityType] ?? typeBadge.User;
            const isLast = idx === data.length - 1;
            return (
              <div key={`${item.activityType}-${item.occurredAt}-${idx}`} className={cn("relative flex gap-4 pb-5", isLast && "pb-1")}>
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarFallback className={cn("text-[10px] font-semibold", getAvatarColor(item.detail))}>
                      {getInitials(item.detail)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-[13px] text-foreground leading-snug">
                    <span className="font-semibold">{item.title}</span>{" "}
                    <span className="text-muted-foreground">{item.detail}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", badge.className)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground/50">·</span>
                    <span className="text-[11px] text-muted-foreground/60 tabular-nums">{formatRelativeTime(item.occurredAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
