import { Shield } from "lucide-react";
import { requireAnyRole } from "@/server/auth/dal";
import TripModerationTaskTable from "./components/TripModerationTaskTable";

export default async function ModerationPage() {
  const session = await requireAnyRole(["ADMIN", "MODERATOR"]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Duyet trip cho moderator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI chi quet noi dung. {session.role === "ADMIN" ? "Admin" : "Moderator"} se duyet thu cong theo format ket qua moderation ma backend dang co san.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <TripModerationTaskTable />
    </div>
  );
}
