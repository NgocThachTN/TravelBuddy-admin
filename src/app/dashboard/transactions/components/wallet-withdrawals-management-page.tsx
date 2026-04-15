import { Landmark } from "lucide-react";
import WalletWithdrawalsTable from "./wallet-withdrawals-table";

export default function WalletWithdrawalsManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Giao dịch rút tiền ví
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hàng đợi xử lý thủ công cho các yêu cầu rút tiền của traveler
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Landmark className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <WalletWithdrawalsTable />
    </div>
  );
}
