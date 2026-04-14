import { CreditCard } from "lucide-react";
import TransactionsTable from "./transactions-table";

type TransactionTab = "deposits" | "user-subscriptions";

interface TransactionManagementPageProps {
  currentTab: TransactionTab;
}

const TAB_CONFIG: Record<
  TransactionTab,
  { title: string; description: string }
> = {
  deposits: {
    title: "Giao dịch nạp tiền",
    description: "Theo dõi các giao dịch nạp tiền vào ví người dùng",
  },
  "user-subscriptions": {
    title: "Giao dịch mua gói người dùng",
    description: "Theo dõi giao dịch mua gói dịch vụ của người dùng",
  },
};

export default function TransactionManagementPage({
  currentTab,
}: TransactionManagementPageProps) {
  const current = TAB_CONFIG[currentTab];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{current.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <TransactionsTable mode={currentTab} />
    </div>
  );
}
