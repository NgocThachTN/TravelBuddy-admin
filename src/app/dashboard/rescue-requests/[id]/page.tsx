import { requireRole } from "@/server/auth/dal";
import RescueRequestDetailClient from "./rescue-request-detail-client";

export default async function RescueRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("MODERATOR");
  const { id } = await params;

  return <RescueRequestDetailClient rescueRequestId={id} />;
}
