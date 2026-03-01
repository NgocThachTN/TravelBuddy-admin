import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "./shared";

const recentActivity = [
  { user: "Nguyễn Văn A", action: "đã tạo chuyến đi mới", detail: "Hà Giang Loop 5N4Đ", time: "2 phút trước", type: "trip" as const },
  { user: "Trần Thị B", action: "bị khóa tài khoản", detail: "Vi phạm nội quy #42", time: "15 phút trước", type: "alert" as const },
  { user: "Lê Minh C", action: "vừa đăng ký tài khoản", detail: "Google OAuth", time: "1 giờ trước", type: "user" as const },
  { user: "Phạm Thị D", action: "hoàn thành chuyến đi", detail: "Đà Lạt 3N2Đ", time: "3 giờ trước", type: "success" as const },
  { user: "Hoàng Văn E", action: "cập nhật hồ sơ cá nhân", detail: "Ảnh đại diện & tiểu sử", time: "5 giờ trước", type: "user" as const },
  { user: "Đặng Thùy F", action: "đã tạo chuyến đi mới", detail: "Phú Quốc 4N3Đ", time: "6 giờ trước", type: "trip" as const },
  { user: "Vũ Hoàng G", action: "gửi báo cáo vi phạm", detail: "Nội dung không phù hợp", time: "8 giờ trước", type: "alert" as const },
];

const typeBadge: Record<string, { label: string; dot: string; className: string }> = {
  trip: { label: "Chuyến đi", dot: "bg-blue-500", className: "text-blue-700" },
  alert: { label: "Cảnh báo", dot: "bg-rose-500", className: "text-rose-700" },
  user: { label: "Người dùng", dot: "bg-slate-400", className: "text-slate-600" },
  success: { label: "Hoàn tất", dot: "bg-emerald-500", className: "text-emerald-700" },
};

export function RecentActivity() {
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
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" />
          {recentActivity.map((item, idx) => {
            const badge = typeBadge[item.type];
            const isLast = idx === recentActivity.length - 1;
            return (
              <div key={idx} className={cn("relative flex gap-4 pb-5", isLast && "pb-1")}>
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarFallback className={cn("text-[10px] font-semibold", getAvatarColor(item.user))}>
                      {getInitials(item.user)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-[13px] text-foreground leading-snug">
                    <span className="font-semibold">{item.user}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                  <p className="text-[12px] text-foreground/60 mt-0.5">{item.detail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", badge.className)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground/50">·</span>
                    <span className="text-[11px] text-muted-foreground/60 tabular-nums">{item.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
