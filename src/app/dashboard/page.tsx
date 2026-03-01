"use client";

import { useState } from "react";
import { type TimeRange } from "./overview/components/shared";
import { DashboardHeader } from "./overview/components/dashboard-header";
import { StatCards } from "./overview/components/stat-cards";
import { UserGrowthChart } from "./overview/components/user-growth-chart";
import { TripActivityChart } from "./overview/components/trip-activity-chart";
import { TripCategoriesChart } from "./overview/components/trip-categories-chart";
import { TopDestinations } from "./overview/components/top-destinations";
import { QuickActions } from "./overview/components/quick-actions";
import { SystemStatus } from "./overview/components/system-status";
import { RecentActivity } from "./overview/components/recent-activity";

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
