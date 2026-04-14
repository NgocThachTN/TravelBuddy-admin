"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  ClipboardCheck,
  ShieldX,
  MapPinned,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { fetchModeratorDashboardOverview } from "@/lib/api";
import type { ModeratorDashboardOverviewData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModeratorKpiCard = {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

function KpiCard({ title, value, icon: Icon, iconBg, iconColor }: ModeratorKpiCard) {
  return (
    <Card className="border border-border/50 py-0 shadow-none">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              iconBg,
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
        </div>
        <p className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
          {value.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="border border-border/50 py-0 shadow-none">
          <CardContent className="p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-9 w-9 rounded-lg bg-muted/70" />
              <div className="h-7 w-20 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted/80" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ModeratorDashboardClient() {
  const [overview, setOverview] = useState<ModeratorDashboardOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOverview = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await fetchModeratorDashboardOverview();
      setOverview(response.data);
    } catch {
      setErrorMessage(
        "Không thể tải dữ liệu tổng quan kiểm duyệt. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview(false);
  }, [loadOverview]);

  const cards: ModeratorKpiCard[] = overview
    ? [
        {
          title: "Số chuyến đi cần duyệt",
          value: overview.kpis.pendingTripApprovals,
          icon: ClipboardCheck,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-50",
        },
        {
          title: "Tổng số chuyến đi",
          value: overview.kpis.totalTrips,
          icon: MapPinned,
          iconColor: "text-blue-600",
          iconBg: "bg-blue-50",
        },
        {
          title: "Số chuyến đi bị từ chối",
          value: overview.kpis.rejectedTrips,
          icon: ShieldX,
          iconColor: "text-rose-600",
          iconBg: "bg-rose-50",
        },
        {
          title: "Số chuyến đi đã duyệt",
          value: overview.kpis.approvedTrips,
          icon: BadgeCheck,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-50",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan kiểm duyệt</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi nhanh các chỉ số chính phục vụ công tác duyệt chuyến đi.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadOverview(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      {isLoading && !overview && <KpiSkeleton />}

      {!isLoading && !overview && !errorMessage && (
        <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          Chưa có dữ liệu để hiển thị tổng quan kiểm duyệt.
        </div>
      )}

      {overview && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>
      )}
    </div>
  );
}
