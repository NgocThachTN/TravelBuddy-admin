import {
  BriefcaseBusiness,
  ClipboardCheck,
  MapPin,
  MessageSquareText,
  UserRoundCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardKpis } from "@/types";

type StatItem = {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

function StatCard({ title, value, icon: Icon, iconColor, iconBg }: StatItem) {
  return (
    <Card className="border border-border/50 py-0 shadow-none">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              iconBg,
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
        </div>
        <p className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
          {value.toLocaleString("vi-VN")}
        </p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

export function StatCards({ kpis }: { kpis: DashboardKpis }) {
  const stats: StatItem[] = [
    {
      title: "Tổng người dùng",
      value: kpis.totalUsers,
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "Tổng chuyến đi",
      value: kpis.totalTrips,
      icon: MapPin,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "Tổng bài viết mạng xã hội",
      value: kpis.totalSocialPosts,
      icon: MessageSquareText,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      title: "Tổng đối tác",
      value: kpis.totalServicePartners,
      icon: BriefcaseBusiness,
      iconColor: "text-cyan-700",
      iconBg: "bg-cyan-50",
    },
    {
      title: "Chuyến đi cần duyệt",
      value: kpis.pendingTripApprovals,
      icon: ClipboardCheck,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50",
    },
    {
      title: "Đối tác cần duyệt",
      value: kpis.pendingPartnerRequests,
      icon: UserRoundCheck,
      iconColor: "text-rose-600",
      iconBg: "bg-rose-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
