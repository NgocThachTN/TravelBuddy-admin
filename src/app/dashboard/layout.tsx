import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Safety net (proxy.ts handles redirects, but this is server-side double-check)
  const session = await getAdminSession();
  if (!session) redirect("/login");

  return (
    <DashboardShell role={session.role} phone={session.phone}>
      {children}
    </DashboardShell>
  );
}
