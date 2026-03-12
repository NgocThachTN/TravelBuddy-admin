import { Shield } from "lucide-react";
import ModerationReportTable from "./components/ModerationReportTable";

export default function ModerationReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo nội dung</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Xem xét và xử lý các báo cáo về chuyến đi, bài viết, bình luận, tin nhắn và yêu cầu cứu hộ
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <ModerationReportTable />
    </div>
  );
}
