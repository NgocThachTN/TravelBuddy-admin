import { Siren } from "lucide-react";
import { requireRole } from "@/server/auth/dal";
import RescueRequestTable from "./rescue-request-table";

export default async function RescueRequestsPage() {
  await requireRole("MODERATOR");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Đơn cứu hộ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi danh sách đơn cứu hộ, đối tác xử lý và trạng thái tiến trình
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
          <Siren className="h-5 w-5" />
        </div>
      </div>

      <RescueRequestTable />
    </div>
  );
}
