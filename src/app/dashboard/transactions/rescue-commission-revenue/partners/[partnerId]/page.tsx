import { requireRole } from "@/server/auth/dal";
import PartnerRescueCommissionRequestsClient from "./partner-rescue-commission-requests-client";

function readSearchParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnerRescueCommissionRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ partnerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN");

  const { partnerId } = await params;
  const query = await searchParams;

  return (
    <PartnerRescueCommissionRequestsClient
      partnerId={partnerId}
      initialContext={{
        partnerName: readSearchParam(query.partnerName),
        partnerAvatarUrl: readSearchParam(query.partnerAvatarUrl),
        completedRequestCount: readSearchParam(query.completedRequestCount),
        grossRevenueVnd: readSearchParam(query.grossRevenueVnd),
        commissionRevenueVnd: readSearchParam(query.commissionRevenueVnd),
        fromUtc: readSearchParam(query.fromUtc),
        toUtc: readSearchParam(query.toUtc),
        windowDays: readSearchParam(query.windowDays),
      }}
    />
  );
}
