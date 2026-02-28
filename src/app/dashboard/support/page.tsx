import { LifeBuoy, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hỗ trợ khách hàng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý danh mục và xử lý các ticket hỗ trợ từ người dùng
        </p>
      </div>

      <Card className="border border-dashed border-border shadow-none">
        <CardContent className="flex flex-col items-center py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LifeBuoy className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <Badge variant="outline" className="mt-5 rounded-full px-3 text-[11px] font-medium">
            <Construction className="mr-1 h-3 w-3" /> Đang phát triển
          </Badge>
          <p className="mt-3 text-sm font-semibold text-foreground">Hỗ trợ khách hàng</p>
          <p className="mt-1 max-w-xs text-center text-xs text-muted-foreground">
            Tính năng hỗ trợ khách hàng sẽ sớm ra mắt
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
