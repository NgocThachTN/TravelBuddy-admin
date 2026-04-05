import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect(ROUTES.LOGIN);
  }

  if (session.role === "MODERATOR") {
    redirect(ROUTES.PROFILE);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Cài đặt
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Các chức năng cài đặt cho admin sẽ được bổ sung sớm.
        </p>
      </div>
    </div>
  );
}
