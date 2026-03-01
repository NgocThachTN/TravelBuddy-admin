import { UserPlus, Map, FileBarChart, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quickActions = [
  { icon: UserPlus, label: "Thêm người dùng", desc: "Tạo tài khoản mới", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100/80" },
  { icon: Map, label: "Quản lý chuyến đi", desc: "Xem & chỉnh sửa", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100/80" },
  { icon: FileBarChart, label: "Xem báo cáo", desc: "Phân tích dữ liệu", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100/80" },
  { icon: Download, label: "Xuất dữ liệu", desc: "CSV, Excel, PDF", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100/80" },
];

export function QuickActions() {
  return (
    <Card className="lg:col-span-4 border border-border/50 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Thao tác nhanh</CardTitle>
        <CardDescription className="text-[13px]">Truy cập nhanh chức năng chính</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(({ icon: QIcon, label, desc, color, bg }) => (
            <button
              key={label}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 text-center transition-all cursor-pointer border border-transparent hover:border-border",
                bg
              )}
            >
              <QIcon className={cn("h-5 w-5", color)} />
              <p className="text-[12px] font-medium text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
