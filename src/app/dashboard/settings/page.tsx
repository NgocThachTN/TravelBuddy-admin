import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  if (session.role === "MODERATOR") {
    redirect(ROUTES.PROFILE);
  }

  return <SettingsClient />;
}
