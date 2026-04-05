import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import ProfileClientPage from "./profile-client";

export default async function ProfilePage() {
  const session = await getAdminSession();
  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  if (session.role === "ADMIN") {
    redirect(ROUTES.SETTINGS);
  }

  return <ProfileClientPage />;
}
