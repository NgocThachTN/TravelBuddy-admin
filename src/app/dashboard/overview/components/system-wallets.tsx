import { WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSystemWallets } from "@/types";

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function SystemWallets({ data }: { data?: DashboardSystemWallets | null }) {
  const wallets = data?.wallets ?? [];

  return (
    <Card className="lg:col-span-4 border border-border/50 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Ví hệ thống</CardTitle>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <WalletCards className="h-[17px] w-[17px]" />
        </span>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 px-3 py-2.5">
            <p className="text-[11px] text-emerald-700/80">Tổng số dư</p>
            <p className="mt-1 text-[16px] font-semibold text-emerald-950">
              {formatCurrency(data?.totalBalanceVnd ?? 0)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 px-3 py-2.5">
            <p className="text-[11px] text-blue-700/80">Khả dụng</p>
            <p className="mt-1 text-[16px] font-semibold text-blue-950">
              {formatCurrency(data?.totalAvailableVnd ?? 0)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2.5">
            <p className="text-[11px] text-amber-700/80">Đang giữ</p>
            <p className="mt-1 text-[16px] font-semibold text-amber-950">
              {formatCurrency(data?.totalFrozenVnd ?? 0)}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {wallets.length === 0 ? (
            <p className="rounded-lg bg-muted/30 px-3 py-2 text-[13px] text-muted-foreground">
              Chưa có dữ liệu ví hệ thống.
            </p>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.systemWalletKey}
                className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2"
              >
                <div>
                  <p className="text-[13px] font-medium text-foreground">
                    {wallet.displayName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {wallet.systemWalletKey}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold tabular-nums text-foreground">
                    {formatCurrency(wallet.totalBalance)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Giữ {formatCurrency(wallet.balanceFrozen)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
