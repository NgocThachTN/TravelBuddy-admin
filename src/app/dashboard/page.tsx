"use client";

import {
  Users,
  Lock,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MoreHorizontal,
  CalendarDays,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/* ── Mock Data ── */
const stats = [
  {
    title: "TỔNG NGƯỜI DÙNG",
    value: "1.248",
    change: { value: "12,5%", positive: true, label: "so với tháng trước" },
    icon: Users,
    accent: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10 ring-blue-500/20",
  },
  {
    title: "TÀI KHOẢN BỊ KHÓA",
    value: "23",
    change: { value: "3,2%", positive: false, label: "so với tháng trước" },
    icon: Lock,
    accent: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-500/10 ring-rose-500/20",
  },
  {
    title: "TỔNG CHUYẾN ĐI",
    value: "562",
    change: { value: "8,1%", positive: true, label: "so với tháng trước" },
    icon: MapPin,
    accent: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10 ring-emerald-500/20",
  },
  {
    title: "BÁO CÁO CHỜ",
    value: "17",
    change: { value: "2 mới", positive: false, label: "so với tháng trước" },
    icon: AlertTriangle,
    accent: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10 ring-amber-500/20",
  },
];

const userGrowthData = [
  { month: "Th8", users: 820 },
  { month: "Th9", users: 890 },
  { month: "Th10", users: 960 },
  { month: "Th11", users: 1050 },
  { month: "Th12", users: 1130 },
  { month: "Th1", users: 1180 },
  { month: "Th2", users: 1248 },
];

const tripData = [
  { month: "Th8", trips: 65 },
  { month: "Th9", trips: 78 },
  { month: "Th10", trips: 92 },
  { month: "Th11", trips: 85 },
  { month: "Th12", trips: 110 },
  { month: "Th1", trips: 98 },
  { month: "Th2", trips: 34 },
];

const recentActivity = [
  {
    user: "Nguyễn Văn A",
    action: "Tạo chuyến đi mới",
    detail: "Hà Giang Loop 5 Ngày",
    time: "2 phút trước",
    type: "trip" as const,
  },
  {
    user: "Trần Thị B",
    action: "Tài khoản bị khóa",
    detail: "Báo cáo vi phạm #42",
    time: "15 phút trước",
    type: "alert" as const,
  },
  {
    user: "Lê Văn C",
    action: "Đăng ký mới",
    detail: "qua Google OAuth",
    time: "1 giờ trước",
    type: "user" as const,
  },
  {
    user: "Phạm Thị D",
    action: "Hoàn thành chuyến đi",
    detail: "Đà Lạt 3 Ngày",
    time: "3 giờ trước",
    type: "success" as const,
  },
  {
    user: "Hoàng Văn E",
    action: "Cập nhật hồ sơ",
    detail: "Đổi tiểu sử & ảnh đại diện",
    time: "5 giờ trước",
    type: "user" as const,
  },
];

const typeBadge: Record<
  string,
  { label: string; className: string }
> = {
  trip: { label: "Chuyến đi", className: "bg-info/10 text-info border-info/20" },
  alert: { label: "Cảnh báo", className: "bg-destructive/10 text-destructive border-destructive/20" },
  user: { label: "Người dùng", className: "bg-secondary text-muted-foreground border-border" },
  success: { label: "Hoàn tất", className: "bg-success/10 text-success-dark border-success/20" },
};

/* ── Stat Card ── */
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
  accent,
}: {
  title: string;
  value: string;
  change: { value: string; positive: boolean; label: string };
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  accent: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 py-0">
      {/* Gradient accent bar */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />
      <CardContent className="relative p-5 pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {title}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
            <div className="flex items-center gap-1.5 pt-1">
              {change.positive ? (
                <span className="flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold text-success-dark">
                  <ArrowUpRight className="h-3 w-3" />
                  {change.value}
                </span>
              ) : (
                <span className="flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[11px] font-semibold text-destructive">
                  <ArrowDownRight className="h-3 w-3" />
                  {change.value}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground/60">{change.label}</span>
            </div>
          </div>
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Initials helper ── */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

/* ── Today helper ── */
function getToday() {
  return new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2532] via-[#2A3743] to-[#1B2532] p-6 sm:p-8 text-white shadow-xl">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-info/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Xin chào, Quản trị viên 👋
              </h1>
              <p className="mt-2 text-sm text-white/60 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {getToday()}
              </p>
              <p className="mt-1 text-sm text-white/70">
                Tổng quan hoạt động nền tảng TravelBuddy
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              >
                <Clock className="mr-1.5 h-3.5 w-3.5" />
                Xuất báo cáo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* User Growth */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Tăng trưởng người dùng
              </CardTitle>
              <CardDescription className="mt-0.5">Lượng đăng ký mới theo thời gian</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success-dark">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FCD240" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FCD240" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E8F0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#9BADBD" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9BADBD" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1B2532",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                      padding: "10px 16px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    }}
                    itemStyle={{ color: "#FCD240" }}
                    labelStyle={{ color: "#9BADBD", marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#FCD240"
                    strokeWidth={2.5}
                    fill="url(#userGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: "#FCD240", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trip Activity */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Hoạt động chuyến đi
              </CardTitle>
              <CardDescription className="mt-0.5">Số chuyến đi tạo mỗi tháng</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Activity className="h-3 w-3" />
                Năm nay
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E1E8F0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#9BADBD" }}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#9BADBD" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1B2532",
                      border: "none",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "13px",
                      padding: "10px 16px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    }}
                    itemStyle={{ color: "#32D394" }}
                    labelStyle={{ color: "#9BADBD", marginBottom: 4 }}
                    cursor={{ fill: "rgba(50,211,148,0.05)" }}
                  />
                  <Bar
                    dataKey="trips"
                    fill="#32D394"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Hoạt động gần đây</CardTitle>
            <CardDescription className="mt-0.5">Các hành động mới nhất trên nền tảng</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            Xem tất cả
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.map((item, idx) => {
              const badge = typeBadge[item.type];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
                    <AvatarFallback className={cn("text-xs font-bold", getAvatarColor(item.user))}>
                      {getInitials(item.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{item.user}</p>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 rounded-full px-2 py-0 text-[10px] font-medium", badge.className)}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.action}
                      <span className="mx-1 text-border">·</span>
                      <span className="text-foreground/60">{item.detail}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground/60">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
