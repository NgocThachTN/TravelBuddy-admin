import { Package } from "lucide-react";
import SubscriptionTable from "./components/SubscriptionTable";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gói đăng ký Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các gói đăng ký, giá và quyền lợi dành cho Planner
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <SubscriptionTable />
    </div>
  );
}
