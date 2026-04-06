import { Megaphone } from "lucide-react";
import ModerationReportsQuickTabs from "../components/ModerationReportsQuickTabs";
import MyReportsTable from "../components/MyReportsTable";

export default function ModeratorMyReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Báo cáo của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moderator có thể tạo báo cáo mới và xem lại các báo cáo đã gửi qua các endpoint `reports/*`.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Megaphone className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <ModerationReportsQuickTabs />
      <MyReportsTable />
    </div>
  );
}
