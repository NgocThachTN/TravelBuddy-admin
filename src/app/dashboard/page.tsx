import { requireAnyRole } from "@/server/auth/dal";
import AdminDashboardClient from "./admin-dashboard-client";
import ModeratorDashboardClient from "./moderator-dashboard-client";

export default async function DashboardPage() {
  const session = await requireAnyRole(["ADMIN", "MODERATOR"]);

  if (session.role === "MODERATOR") {
    return <ModeratorDashboardClient />;
  }

  return <AdminDashboardClient />;
}
