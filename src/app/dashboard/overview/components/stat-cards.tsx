import { Users, Lock, MapPin, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const stats = [
  { title: "Tổng người dùng", value: "1.248", prev: "1.109", change: { value: "+12,5%", positive: true }, icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50", sparkColor: "#3b82f6", sparkData: [{ v: 1080 }, { v: 1095 }, { v: 1120 }, { v: 1142 }, { v: 1165 }, { v: 1198 }, { v: 1248 }] },
  { title: "Tài khoản bị khóa", value: "23", prev: "22", change: { value: "+3,2%", positive: false }, icon: Lock, iconColor: "text-rose-600", iconBg: "bg-rose-50", sparkColor: "#f43f5e", sparkData: [{ v: 18 }, { v: 19 }, { v: 20 }, { v: 19 }, { v: 21 }, { v: 22 }, { v: 23 }] },
  { title: "Tổng chuyến đi", value: "562", prev: "520", change: { value: "+8,1%", positive: true }, icon: MapPin, iconColor: "text-emerald-600", iconBg: "bg-emerald-50", sparkColor: "#10b981", sparkData: [{ v: 480 }, { v: 495 }, { v: 510 }, { v: 525 }, { v: 538 }, { v: 550 }, { v: 562 }] },
  { title: "Báo cáo chờ xử lý", value: "17", prev: "15", change: { value: "+2 mới", positive: false }, icon: AlertTriangle, iconColor: "text-amber-600", iconBg: "bg-amber-50", sparkColor: "#f59e0b", sparkData: [{ v: 12 }, { v: 14 }, { v: 13 }, { v: 15 }, { v: 16 }, { v: 15 }, { v: 17 }] },
];

function StatCard({ title, value, prev, change, icon: Icon, iconColor, iconBg, sparkColor, sparkData }: {
  title: string; value: string; prev: string; change: { value: string; positive: boolean };
  icon: LucideIcon; iconColor: string; iconBg: string; sparkColor: string; sparkData: { v: number }[];
}) {
  return (
    <Card className="border border-border/50 shadow-none hover:shadow-md transition-all duration-200 py-0 group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-colors", iconBg)}>
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
          <span className={cn("inline-flex items-center gap-0.5 text-[12px] font-medium rounded-full px-2 py-0.5", change.positive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50")}>
            {change.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change.value}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[26px] font-semibold tracking-tight text-foreground leading-none">{value}</p>
            <p className="text-[13px] text-muted-foreground mt-1.5">{title}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Tháng trước: {prev}</p>
          </div>
          <div className="h-10 w-20 opacity-40 group-hover:opacity-70 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
