"use client";

import { Users, Lock, MapPin, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import StatCard from "./components/ui/StatCard";
import Card from "./components/ui/Card";
import Badge from "./components/ui/Badge";
import Avatar from "./components/ui/Avatar";
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
import styles from "./dashboard.module.css";

/* ── Mock Data ── */
const stats = [
  {
    title: "Tổng người dùng",
    value: "1.248",
    change: { value: "12,5%", positive: true },
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    title: "Bị khóa",
    value: "23",
    change: { value: "3,2%", positive: false },
    icon: Lock,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
  },
  {
    title: "Tổng chuyến đi",
    value: "562",
    change: { value: "8,1%", positive: true },
    icon: MapPin,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    title: "Báo cáo chờ",
    value: "17",
    change: { value: "2 mới", positive: false },
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
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

const typeBadge: Record<string, { variant: "info" | "destructive" | "success" | "default"; label: string }> = {
  trip: { variant: "info", label: "Chuyến đi" },
  alert: { variant: "destructive", label: "Cảnh báo" },
  user: { variant: "default", label: "Người dùng" },
  success: { variant: "success", label: "Hoàn tất" },
};

export default function DashboardPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Tổng quan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng quan hoạt động nền tảng TravelBuddy
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card
          title="Tăng trưởng người dùng"
          description="Lượng đăng ký mới theo thời gian"
          headerAction={
            <div className="flex items-center gap-1.5 text-xs font-medium text-success-dark">
              <TrendingUp className="h-3.5 w-3.5" />
              +12.5%
            </div>
          }
          className="lg:col-span-4"
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCD240" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FCD240" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1B2532", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", padding: "8px 14px" }}
                  itemStyle={{ color: "#FCD240" }}
                  labelStyle={{ color: "#9BADBD", marginBottom: 4 }}
                />
                <Area type="monotone" dataKey="users" stroke="#FCD240" strokeWidth={2.5} fill="url(#userGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          title="Hoạt động chuyến đi"
          description="Số chuyến đi tạo mỗi tháng"
          headerAction={
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              This year
            </div>
          }
          className="lg:col-span-3"
        >
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#667085" }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1B2532", border: "none", borderRadius: "12px", color: "#fff", fontSize: "13px", padding: "8px 14px" }}
                  itemStyle={{ color: "#32D394" }}
                  labelStyle={{ color: "#9BADBD", marginBottom: 4 }}
                />
                <Bar dataKey="trips" fill="#32D394" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Hoạt động gần đây" description="Các hành động mới nhất trên nền tảng">
        <div className="space-y-0 divide-y divide-border/60">
          {recentActivity.map((item, idx) => {
            const badge = typeBadge[item.type];
            return (
              <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <Avatar name={item.user} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{item.user}</p>
                    <Badge variant={badge.variant} className="shrink-0">{badge.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.action}{" "}
                    <span className="text-foreground/70">· {item.detail}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground/70">{item.time}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
