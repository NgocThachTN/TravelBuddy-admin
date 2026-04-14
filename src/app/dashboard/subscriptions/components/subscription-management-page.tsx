import Link from "next/link";
import { Package } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTable from "./SubscriptionTable";
import PartnerCommissionSettings from "./partner-commission-settings";

interface SubscriptionManagementPageProps {
  currentTab: "users" | "partner-commissions";
}

const TAB_CONFIG = {
  users: {
    description: "Quản lý gói dịch vụ dành cho người dùng",
    href: ROUTES.SUBSCRIPTIONS_USERS,
    label: "Gói người dùng",
  },
  "partner-commissions": {
    description: "Quản lý chính sách hoa hồng cứu hộ dành cho đối tác",
    href: ROUTES.SUBSCRIPTIONS_PARTNER_COMMISSIONS,
    label: "Hoa hồng đối tác",
  },
} as const;

export default function SubscriptionManagementPage({
  currentTab,
}: SubscriptionManagementPageProps) {
  const current = TAB_CONFIG[currentTab];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý chính sách phí</h1>
          <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <Tabs value={currentTab}>
        <TabsList>
          <TabsTrigger value="users" asChild>
            <Link href={TAB_CONFIG.users.href}>{TAB_CONFIG.users.label}</Link>
          </TabsTrigger>
          <TabsTrigger value="partner-commissions" asChild>
            <Link href={TAB_CONFIG["partner-commissions"].href}>
              {TAB_CONFIG["partner-commissions"].label}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {currentTab === "users" ? <SubscriptionTable /> : <PartnerCommissionSettings />}
    </div>
  );
}
