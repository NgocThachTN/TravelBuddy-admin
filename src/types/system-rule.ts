export interface RescuePricingRules {
  rescueArrivalRadiusMeters: number;
  rescuePostArrivalNoShowWaitMinutes: number;
  rescuePartnerNoShowResponseWaitMinutes: number;
  rescuePartnerNoShowRadiusMeters: number;
  rescueCommissionTwoWheel: number;
  rescueCommissionFourWheel: number;
  rescueDepositPercent: number;
  rescueNewTimeoutMinutes: number;
}

export type SystemConfigValueType =
  | "string"
  | "int"
  | "long"
  | "decimal"
  | "bool"
  | "json";

export interface SystemConfigQuery {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface UpdateAdminSystemRulePayload {
  key: string;
  value: string;
  valueType?: SystemConfigValueType;
  description?: string | null;
}

export interface UpsertAdminSystemRulePayload {
  key: string;
  value: string;
  valueType: SystemConfigValueType;
  description?: string | null;
}

export interface AdminSystemRule {
  key: string;
  value: string;
  valueType: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  cacheRefreshed: boolean;
}

export interface AdminSystemSetting {
  key: string;
  value: string;
  valueType: string;
  description?: string | null;
  isPublic: boolean;
  updatedAt?: string | null;
  cacheRefreshed: boolean;
}

export interface MemberLevelCatalogLevel {
  code: number;
  apiName: string;
  displayNameVi: string;
  minCompletedTrips: number;
  maxCompletedTrips: number | null;
  tripRangeLabelVi: string;
}

export interface MemberLevelCatalogData {
  versionTag: string;
  levels: MemberLevelCatalogLevel[];
}
