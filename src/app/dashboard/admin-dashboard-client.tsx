"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type {
  DashboardOverviewData,
  RescueCommissionRevenueData,
  TimeRange,
} from "@/types";
import {
  fetchAdminDashboardOverview,
  fetchAdminRescueCommissionRevenue,
} from "@/lib/api";
import { mapRangeToWindowDays } from "./overview/components/shared";
import {
  DashboardOverviewSkeleton,
  OverviewSectionSkeleton,
} from "./overview/components/dashboard-overview-skeleton";

const DashboardHeader = dynamic(
  () =>
    import("./overview/components/dashboard-header").then(
      (mod) => mod.DashboardHeader,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton heightClass="h-20" />,
  },
);

const StatCards = dynamic(
  () =>
    import("./overview/components/stat-cards").then((mod) => mod.StatCards),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OverviewSectionSkeleton key={index} heightClass="h-40" />
        ))}
      </div>
    ),
  },
);

const RevenueOverview = dynamic(
  () =>
    import("./overview/components/revenue-overview").then(
      (mod) => mod.RevenueOverview,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton heightClass="h-[420px]" />,
  },
);

const UserGrowthChart = dynamic(
  () =>
    import("./overview/components/user-growth-chart").then(
      (mod) => mod.UserGrowthChart,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-4" />,
  },
);

const TripActivityChart = dynamic(
  () =>
    import("./overview/components/trip-activity-chart").then(
      (mod) => mod.TripActivityChart,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-3" />,
  },
);

const TripCategoriesChart = dynamic(
  () =>
    import("./overview/components/trip-categories-chart").then(
      (mod) => mod.TripCategoriesChart,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-3" />,
  },
);

const TopDestinations = dynamic(
  () =>
    import("./overview/components/top-destinations").then(
      (mod) => mod.TopDestinations,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-5" />,
  },
);

const QuickActions = dynamic(
  () =>
    import("./overview/components/quick-actions").then(
      (mod) => mod.QuickActions,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-4" />,
  },
);

const SystemStatus = dynamic(
  () =>
    import("./overview/components/system-status").then(
      (mod) => mod.SystemStatus,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-3" />,
  },
);

const SystemWallets = dynamic(
  () =>
    import("./overview/components/system-wallets").then(
      (mod) => mod.SystemWallets,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton className="lg:col-span-4" />,
  },
);

const RecentActivity = dynamic(
  () =>
    import("./overview/components/recent-activity").then(
      (mod) => mod.RecentActivity,
    ),
  {
    ssr: false,
    loading: () => <OverviewSectionSkeleton heightClass="h-80" />,
  },
);

function getCommissionRange(windowDays: number) {
  const toUtc = new Date();
  const fromUtc = new Date(toUtc);
  fromUtc.setUTCDate(fromUtc.getUTCDate() - windowDays);

  return {
    fromUtc: fromUtc.toISOString(),
    toUtc: toUtc.toISOString(),
  };
}

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState<TimeRange>("30d");
  const [dashboardData, setDashboardData] = useState<DashboardOverviewData | null>(
    null,
  );
  const [rescueCommissionData, setRescueCommissionData] =
    useState<RescueCommissionRevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const windowDays = mapRangeToWindowDays(chartRange);
        const [overviewResponse, rescueCommissionResponse] = await Promise.all([
          fetchAdminDashboardOverview(windowDays),
          fetchAdminRescueCommissionRevenue(getCommissionRange(windowDays)),
        ]);
        setDashboardData(overviewResponse.data);
        setRescueCommissionData(rescueCommissionResponse.data);
      } catch {
        setErrorMessage("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [chartRange],
  );

  useEffect(() => {
    void loadDashboard(false);
  }, [loadDashboard]);

  if (isLoading && !dashboardData) {
    return <DashboardOverviewSkeleton />;
  }

  if (errorMessage && !dashboardData) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
        Chưa có dữ liệu để hiển thị tổng quan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          {errorMessage}
        </div>
      )}

      <DashboardHeader
        systemStatusLabel={dashboardData.systemStatus.overallStatus}
        generatedAtUtc={dashboardData.generatedAtUtc}
        chartRange={chartRange}
        onRangeChange={setChartRange}
        onRefresh={() => void loadDashboard(true)}
        isRefreshing={isRefreshing}
      />

      <StatCards kpis={dashboardData.kpis} />
      <RevenueOverview
        revenue={dashboardData.revenue}
        rescueCommission={rescueCommissionData}
        windowDays={dashboardData.windowDays}
      />

      <div className="grid gap-4 lg:grid-cols-10">
        <UserGrowthChart
          data={dashboardData.series.userGrowth}
        />
        <TripActivityChart data={dashboardData.series.tripCreation} />
        <TripCategoriesChart data={dashboardData.tripCategoryDistribution} />
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <TopDestinations data={dashboardData.topDestinations} />
        <QuickActions />
        <SystemStatus
          data={dashboardData.systemStatus}
          generatedAtUtc={dashboardData.generatedAtUtc}
        />
        <SystemWallets data={dashboardData.systemWallets} />
      </div>

      <RecentActivity data={dashboardData.recentActivities} />
    </div>
  );
}
