import Link from "next/link";
import { Package } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionTable from "./SubscriptionTable";
import ServicePartnerFeeTable from "./ServicePartnerFeeTable";

interface SubscriptionManagementPageProps {
  currentTab: "partners" | "users";
}

const TAB_CONFIG = {
  partners: {
    description: "Quản lý gói dịch vụ dành cho đối tác",
    href: ROUTES.SUBSCRIPTIONS_PARTNERS,
  },
  users: {
    description: "Quản lý gói dịch vụ dành cho người dùng",
    href: ROUTES.SUBSCRIPTIONS_USERS,
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
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý gói dịch vụ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {current.description}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Package className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <Tabs value={currentTab}>
        <TabsList>
          <TabsTrigger value="partners" asChild>
            <Link href={TAB_CONFIG.partners.href}>Gói đối tác</Link>
          </TabsTrigger>
          <TabsTrigger value="users" asChild>
            <Link href={TAB_CONFIG.users.href}>Gói người dùng</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {currentTab === "partners" ? <ServicePartnerFeeTable /> : <SubscriptionTable />}
    </div>
  );
}
