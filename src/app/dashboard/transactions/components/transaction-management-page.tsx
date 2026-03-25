import { Construction, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import TransactionsTable from "./transactions-table";

type TransactionTab = "deposits" | "user-subscriptions" | "partner-subscriptions";

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
  "partner-subscriptions": {
    title: "Giao dịch mua gói đối tác",
    description: "Theo dõi giao dịch mua gói dịch vụ của đối tác",
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

      {currentTab === "partner-subscriptions" ? (
        <Card className="border border-dashed border-border shadow-none">
          <CardContent className="flex flex-col items-center py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <CreditCard className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <Badge
              variant="outline"
              className="mt-4 rounded-full px-3 text-[11px] font-medium"
            >
              <Construction className="mr-1 h-3 w-3" />
              {"Đang phát triển"}
            </Badge>
            <p className="mt-3 text-sm font-semibold">{"Tab mua gói đối tác"}</p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              {"Sẽ triển khai tiếp sau khi hoàn tất hai tab ưu tiên."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <TransactionsTable mode={currentTab} />
      )}
    </div>
  );
}

