import { requireAnyRole } from "@/server/auth/dal";
import TripDetailClient from "./trip-detail-client";

export default async function TripDetailPage() {
  const session = await requireAnyRole(["ADMIN", "MODERATOR"]);
  return <TripDetailClient role={session.role} />;
}
