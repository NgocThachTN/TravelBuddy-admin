export type TimeRange = "7d" | "30d" | "90d";

export interface DashboardKpis {
  totalUsers: number;
  lockedUsers: number;
  totalTrips: number;
  totalSocialPosts: number;
  totalServicePartners: number;
  pendingReports: number;
  openModerationTasks: number;
  pendingTripReviews: number;
  pendingTripApprovals: number;
  pendingPartnerRequests: number;
}

export interface DashboardRevenueDailyPoint {
  date: string;
  subscriptionTravelerRevenueVnd: number;
  servicePartnerCommissionRevenueVnd: number;
  totalRevenueVnd: number;
}

export interface DashboardRevenue {
  subscriptionTravelerRevenueVnd: number;
  servicePartnerCommissionRevenueVnd: number;
  totalRevenueVnd: number;
  daily: DashboardRevenueDailyPoint[];
}

export interface DashboardUserGrowthPoint {
  date: string;
  currentCount: number;
  previousCount: number;
}

export interface DashboardTripCreationPoint {
  date: string;
  count: number;
}

export interface DashboardCategoryDistributionItem {
  label: string;
  value: number;
}

export interface DashboardTopDestinationItem {
  destinationName: string;
  tripCount: number;
}

export interface DashboardRecentActivityItem {
  activityType: string;
  title: string;
  detail: string;
  occurredAt: string;
}

export interface DashboardSystemStatus {
  pendingModerationQueue: number;
  pendingReports: number;
  pendingPartnerRequests: number;
  reportProcessingRatePercent: number;
  averageReportProcessingHours: number | null;
  overallStatus: string;
}

export interface DashboardOverviewData {
  windowDays: number;
  generatedAtUtc: string;
  kpis: DashboardKpis;
  revenue: DashboardRevenue;
  series: {
    userGrowth: DashboardUserGrowthPoint[];
    tripCreation: DashboardTripCreationPoint[];
  };
  tripCategoryDistribution: DashboardCategoryDistributionItem[];
  topDestinations: DashboardTopDestinationItem[];
  recentActivities: DashboardRecentActivityItem[];
  systemStatus: DashboardSystemStatus;
}
