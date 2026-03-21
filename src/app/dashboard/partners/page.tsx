"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerRequestsTable from "./components/PartnerRequestsTable";
import ServicePartnersTable from "./components/ServicePartnersTable";

export default function PartnersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "active" ? "active" : "requests";

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`/dashboard/partners?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý đối tác dịch vụ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Theo dõi hồ sơ đăng ký đối tác và danh sách đối tác dịch vụ đã được
          phê duyệt.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-5">
        <TabsList className="h-auto w-full max-w-[460px] gap-3 bg-transparent p-0">
          <TabsTrigger
            value="requests"
            className="h-11 flex-1 rounded-2xl border border-[#d7deea] bg-white px-5 text-base font-semibold text-slate-800 shadow-sm transition data-[state=active]:border-[#ffcd38] data-[state=active]:bg-[#ffcd38] data-[state=active]:text-slate-900"
          >
            Hồ sơ cần duyệt
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="h-11 flex-1 rounded-2xl border border-[#d7deea] bg-white px-5 text-base font-semibold text-slate-800 shadow-sm transition data-[state=active]:border-[#ffcd38] data-[state=active]:bg-[#ffcd38] data-[state=active]:text-slate-900"
          >
            Đối tác đang hợp tác
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <PartnerRequestsTable />
        </TabsContent>

        <TabsContent value="active">
          <ServicePartnersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
