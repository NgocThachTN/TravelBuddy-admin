import { api } from "./axios";
import { API_ROUTES } from "./constants";
import type {
  AdminSystemRule,
  BeWrapper,
  RescuePricingRules,
  UpdateAdminSystemRulePayload,
} from "@/types";

export async function fetchRescuePricingRules(): Promise<BeWrapper<RescuePricingRules>> {
  const { data } = await api.get<BeWrapper<RescuePricingRules>>(
    API_ROUTES.SYSTEM_RULES_RESCUE_PRICING,
  );
  return data;
}

export async function updateRescuePricingRule(
  payload: UpdateAdminSystemRulePayload,
): Promise<BeWrapper<AdminSystemRule>> {
  const { data } = await api.put<BeWrapper<AdminSystemRule>>(
    API_ROUTES.ADMIN_SYSTEM_RULES_RESCUE_PRICING,
    payload,
  );
  return data;
}
