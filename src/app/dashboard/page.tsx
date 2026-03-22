"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { TimeRange } from "@/types";
import { DashboardHeader } from "./overview/components/dashboard-header";

function SectionSkeleton({
  className,
  heightClass = "h-64",
}: {
  className?: string;
  heightClass?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/50 bg-card/70 p-6 shadow-none ${heightClass} ${className ?? ""}`}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-3 w-48 rounded bg-muted/80" />
        <div className="h-36 rounded-lg bg-muted/60" />
      </div>
    </div>
  );
}

const StatCards = dynamic(
  () =>
    import("./overview/components/stat-cards").then((mod) => mod.StatCards),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SectionSkeleton key={index} heightClass="h-40" />
        ))}
      </div>
    ),
  },
);

const UserGrowthChart = dynamic(
  () =>
    import("./overview/components/user-growth-chart").then(
      (mod) => mod.UserGrowthChart,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-4" /> },
);

const TripActivityChart = dynamic(
  () =>
    import("./overview/components/trip-activity-chart").then(
      (mod) => mod.TripActivityChart,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-3" /> },
);

const TripCategoriesChart = dynamic(
  () =>
    import("./overview/components/trip-categories-chart").then(
      (mod) => mod.TripCategoriesChart,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-3" /> },
);

const TopDestinations = dynamic(
  () =>
    import("./overview/components/top-destinations").then(
      (mod) => mod.TopDestinations,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-5" /> },
);

const QuickActions = dynamic(
  () =>
    import("./overview/components/quick-actions").then(
      (mod) => mod.QuickActions,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-3" /> },
);

const SystemStatus = dynamic(
  () =>
    import("./overview/components/system-status").then(
      (mod) => mod.SystemStatus,
    ),
  { ssr: false, loading: () => <SectionSkeleton className="lg:col-span-4" /> },
);

const RecentActivity = dynamic(
  () =>
    import("./overview/components/recent-activity").then(
      (mod) => mod.RecentActivity,
    ),
  { ssr: false, loading: () => <SectionSkeleton heightClass="h-80" /> },
);

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState<TimeRange>("30d");

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <StatCards />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-10">
        <UserGrowthChart chartRange={chartRange} onRangeChange={setChartRange} />
        <TripActivityChart />
        <TripCategoriesChart />
      </div>

      {/* Top Destinations + Quick Actions + System Status */}
      <div className="grid gap-4 lg:grid-cols-12">
        <TopDestinations />
        <QuickActions />
        <SystemStatus />
      </div>

      <RecentActivity />
    </div>
  );
}
