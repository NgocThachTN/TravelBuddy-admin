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

export interface DashboardSystemWalletItem {
  systemWalletKey: string;
  displayName: string;
  currency: string;
  balanceAvailable: number;
  balanceFrozen: number;
  totalBalance: number;
  updatedAt: string | null;
}

export interface DashboardSystemWallets {
  totalAvailableVnd: number;
  totalFrozenVnd: number;
  totalBalanceVnd: number;
  wallets: DashboardSystemWalletItem[];
}

export interface RescueCommissionRevenueDailyPoint {
  dateUtc: string;
  commissionRevenueVnd: number;
}

export interface RescueCommissionRevenueData {
  fromDateUtc: string;
  toDateUtc: string;
  generatedAtUtc: string;
  totalCommissionRevenueVnd: number;
  totalCommissionChargedRequests: number;
  daily: RescueCommissionRevenueDailyPoint[];
}

export interface RescueCommissionPartnerSummaryItem {
  partnerId: string;
  partnerName: string;
  partnerAvatarUrl: string | null;
  completedRequestCount: number;
  grossRevenueVnd: number;
  commissionRevenueVnd: number;
}

export interface GetRescueCommissionPartnerSummaryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?:
    | "partnerName"
    | "completedRequestCount"
    | "grossRevenueVnd"
    | "commissionRevenueVnd";
  sortDirection?: "asc" | "desc";
  windowDays?: 7 | 30 | 90;
  fromUtc?: string;
  toUtc?: string;
}

export interface PartnerRescueCommissionRequestItem {
  rescueRequestId: string;
  partnerId: string;
  partnerName: string;
  partnerAvatarUrl: string | null;
  travelerUserId: string | null;
  travelerDisplayName: string | null;
  travelerPhone: string | null;
  vehicleType: string | null;
  vehicleName: string | null;
  vehicleNumber: string | null;
  distanceKm: number | null;
  servicesTotalAmount: number | null;
  travelFeeAmount: number | null;
  totalOrderAmount: number | null;
  depositAmount: number | null;
  commissionAmount: number | null;
  partnerNetAmount: number | null;
  createdAt: string;
  completedAt: string | null;
  commissionChargedAt: string | null;
  serviceTypes: string[];
}

export interface GetPartnerRescueCommissionRequestsParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?:
    | "commissionChargedAt"
    | "completedAt"
    | "totalOrderAmount"
    | "commissionAmount";
  sortDirection?: "asc" | "desc";
  windowDays?: 7 | 30 | 90;
  fromUtc?: string;
  toUtc?: string;
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
  systemWallets: DashboardSystemWallets;
}

export interface ModeratorDashboardKpis {
  totalTrips: number;
  pendingTripApprovals: number;
  approvedTrips: number;
  rejectedTrips: number;
}

export interface ModeratorDashboardOverviewData {
  generatedAtUtc: string;
  kpis: ModeratorDashboardKpis;
  series?: {
    tripCreation?: DashboardTripCreationPoint[];
  };
  tripCategoryDistribution?: DashboardCategoryDistributionItem[];
  topDestinations?: DashboardTopDestinationItem[];
  recentActivities?: DashboardRecentActivityItem[];
}
