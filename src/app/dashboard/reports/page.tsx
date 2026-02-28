import { Megaphone, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Khiếu nại</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xem xét và xử lý các báo cáo, khiếu nại từ người dùng
        </p>
      </div>

      <Card className="border border-dashed border-border shadow-none">
        <CardContent className="flex flex-col items-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Megaphone className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <Badge variant="outline" className="mt-5 rounded-full px-3 text-[11px] font-medium">
            <Construction className="mr-1 h-3 w-3" /> Đang phát triển
          </Badge>
          <p className="mt-3 text-sm font-semibold text-foreground">Báo cáo & Khiếu nại</p>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
            Tính năng xem xét và xử lý báo cáo sẽ sớm ra mắt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
