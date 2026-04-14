export interface RescuePricingRules {
  rescueCommissionTwoWheel: number;
  rescueCommissionFourWheel: number;
  rescueDepositPercent: number;
}

export interface UpdateAdminSystemRulePayload {
  key:
    | "rescue_commission_two_wheel"
    | "rescue_commission_four_wheel"
    | "rescue_deposit_percent";
  value: string;
}

export interface AdminSystemRule {
  key: string;
  value: string;
  valueType: string;
  cacheRefreshed: boolean;
}
