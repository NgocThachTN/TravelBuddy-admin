import { Megaphone } from "lucide-react";
import ReportTable from "./components/ReportTable";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo & Khiếu nại</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem xét và xử lý các báo cáo, khiếu nại từ người dùng về chuyến đi và bài viết
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <ReportTable />
    </div>
  );
}
