import { requireRole } from "@/server/auth/dal";
import RescueCommissionRevenuePage from "../components/rescue-commission-revenue-page";

export default async function RescueCommissionRevenueRoute() {
  await requireRole("ADMIN");

  return <RescueCommissionRevenuePage />;
}
