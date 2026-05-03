import { api } from "./axios";
import { API_ROUTES } from "./constants";
import type {
  AdminSystemRule,
  AdminSystemSetting,
  BePagedWrapper,
  BeWrapper,
  RescuePricingRules,
  SystemConfigQuery,
  UpsertAdminSystemRulePayload,
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

export async function fetchAdminSystemSettings(
  params: SystemConfigQuery,
): Promise<BePagedWrapper<AdminSystemSetting>> {
  const { data } = await api.get<BePagedWrapper<AdminSystemSetting>>(
    API_ROUTES.ADMIN_SYSTEM_SETTINGS,
    { params },
  );
  return data;
}

export async function fetchAdminSystemRules(
  params: SystemConfigQuery,
): Promise<BePagedWrapper<AdminSystemRule>> {
  const { data } = await api.get<BePagedWrapper<AdminSystemRule>>(
    API_ROUTES.ADMIN_SYSTEM_RULES,
    { params },
  );
  return data;
}

export async function upsertAdminSystemRule(
  payload: UpsertAdminSystemRulePayload,
): Promise<BeWrapper<AdminSystemRule>> {
  const { data } = await api.put<BeWrapper<AdminSystemRule>>(
    API_ROUTES.ADMIN_SYSTEM_RULES,
    payload,
  );
  return data;
}
