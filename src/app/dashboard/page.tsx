"use client";

import { useState } from "react";
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
  UserPlus,
  Map,
  FileBarChart,
  Download,
  Server,
  Compass,
  Mountain,
  Palmtree,
  Building2,
  Globe,
  RefreshCw,
  ChevronRight,
  Star,
  Eye,
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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/* ── Time range ── */
type TimeRange = "7d" | "30d" | "90d";
const timeRangeLabels: Record<TimeRange, string> = {
  "7d": "7 ngày",
  "30d": "30 ngày",
  "90d": "90 ngày",
};

/* ── Data ── */
const stats = [
  {
    title: "Tổng người dùng",
    value: "1.248",
    prev: "1.109",
    change: { value: "+12,5%", positive: true },
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    sparkColor: "#3b82f6",
    sparkData: [
      { v: 1080 }, { v: 1095 }, { v: 1120 }, { v: 1142 }, { v: 1165 }, { v: 1198 }, { v: 1248 },
    ],
  },
  {
    title: "Tài khoản bị khóa",
    value: "23",
    prev: "22",
    change: { value: "+3,2%", positive: false },
    icon: Lock,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
    sparkColor: "#f43f5e",
    sparkData: [
      { v: 18 }, { v: 19 }, { v: 20 }, { v: 19 }, { v: 21 }, { v: 22 }, { v: 23 },
    ],
  },
  {
    title: "Tổng chuyến đi",
    value: "562",
    prev: "520",
    change: { value: "+8,1%", positive: true },
    icon: MapPin,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    sparkColor: "#10b981",
    sparkData: [
      { v: 480 }, { v: 495 }, { v: 510 }, { v: 525 }, { v: 538 }, { v: 550 }, { v: 562 },
    ],
  },
  {
    title: "Báo cáo chờ xử lý",
    value: "17",
    prev: "15",
    change: { value: "+2 mới", positive: false },
    icon: AlertTriangle,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    sparkColor: "#f59e0b",
    sparkData: [
      { v: 12 }, { v: 14 }, { v: 13 }, { v: 15 }, { v: 16 }, { v: 15 }, { v: 17 },
    ],
  },
];

const userGrowthData = [
  { month: "Th8", users: 820, prev: 720 },
  { month: "Th9", users: 890, prev: 780 },
  { month: "Th10", users: 960, prev: 850 },
  { month: "Th11", users: 1050, prev: 910 },
  { month: "Th12", users: 1130, prev: 980 },
  { month: "Th1", users: 1180, prev: 1020 },
  { month: "Th2", users: 1248, prev: 1109 },
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

const tripCategoryData = [
  { name: "Phiêu lưu", value: 145, color: "#3b82f6", icon: Compass },
  { name: "Văn hóa", value: 120, color: "#8b5cf6", icon: Building2 },
  { name: "Biển", value: 98, color: "#06b6d4", icon: Palmtree },
  { name: "Núi", value: 112, color: "#10b981", icon: Mountain },
  { name: "Thành phố", value: 87, color: "#f59e0b", icon: Globe },
];

const topDestinations = [
  { name: "Hà Giang", trips: 89, rating: 4.8, growth: "+23%", img: "🏔️" },
  { name: "Đà Lạt", trips: 76, rating: 4.7, growth: "+15%", img: "🌺" },
  { name: "Phú Quốc", trips: 64, rating: 4.6, growth: "+31%", img: "🏖️" },
  { name: "Hội An", trips: 52, rating: 4.9, growth: "+8%", img: "🏮" },
  { name: "Sa Pa", trips: 48, rating: 4.5, growth: "+12%", img: "🌄" },
];

const quickActions = [
  { icon: UserPlus, label: "Thêm người dùng", desc: "Tạo tài khoản mới", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100/80" },
  { icon: Map, label: "Quản lý chuyến đi", desc: "Xem & chỉnh sửa", color: "text-emerald-600", bg: "bg-emerald-50 hover:bg-emerald-100/80" },
  { icon: FileBarChart, label: "Xem báo cáo", desc: "Phân tích dữ liệu", color: "text-violet-600", bg: "bg-violet-50 hover:bg-violet-100/80" },
  { icon: Download, label: "Xuất dữ liệu", desc: "CSV, Excel, PDF", color: "text-amber-600", bg: "bg-amber-50 hover:bg-amber-100/80" },
];

const systemServices = [
  { label: "API Server", latency: "12ms", uptime: "99.98%" },
  { label: "Database", latency: "3ms", uptime: "99.99%" },
  { label: "CDN", latency: "8ms", uptime: "100%" },
  { label: "Auth Service", latency: "5ms", uptime: "99.97%" },
];

const recentActivity = [
  { user: "Nguyễn Văn A", action: "đã tạo chuyến đi mới", detail: "Hà Giang Loop 5N4Đ", time: "2 phút trước", type: "trip" as const },
  { user: "Trần Thị B", action: "bị khóa tài khoản", detail: "Vi phạm nội quy #42", time: "15 phút trước", type: "alert" as const },
  { user: "Lê Minh C", action: "vừa đăng ký tài khoản", detail: "Google OAuth", time: "1 giờ trước", type: "user" as const },
  { user: "Phạm Thị D", action: "hoàn thành chuyến đi", detail: "Đà Lạt 3N2Đ", time: "3 giờ trước", type: "success" as const },
  { user: "Hoàng Văn E", action: "cập nhật hồ sơ cá nhân", detail: "Ảnh đại diện & tiểu sử", time: "5 giờ trước", type: "user" as const },
  { user: "Đặng Thùy F", action: "đã tạo chuyến đi mới", detail: "Phú Quốc 4N3Đ", time: "6 giờ trước", type: "trip" as const },
  { user: "Vũ Hoàng G", action: "gửi báo cáo vi phạm", detail: "Nội dung không phù hợp", time: "8 giờ trước", type: "alert" as const },
];

const typeBadge: Record<string, { label: string; dot: string; className: string }> = {
  trip: { label: "Chuyến đi", dot: "bg-blue-500", className: "text-blue-700" },
  alert: { label: "Cảnh báo", dot: "bg-rose-500", className: "text-rose-700" },
  user: { label: "Người dùng", dot: "bg-slate-400", className: "text-slate-600" },
  success: { label: "Hoàn tất", dot: "bg-emerald-500", className: "text-emerald-700" },
};

/* ── Components ── */

function StatCard({ title, value, prev, change, icon: Icon, iconColor, iconBg, sparkColor, sparkData }: {
  title: string; value: string; prev: string;
  change: { value: string; positive: boolean };
  icon: LucideIcon; iconColor: string; iconBg: string; sparkColor: string; sparkData: { v: number }[];
}) {
  return (
    <Card className="border border-border/50 shadow-none hover:shadow-md transition-all duration-200 py-0 group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg transition-colors", iconBg)}>
            <Icon className={cn("h-[18px] w-[18px]", iconColor)} />
          </div>
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[12px] font-medium rounded-full px-2 py-0.5",
            change.positive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
          )}>
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

function TimeRangeSelector({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {(Object.keys(timeRangeLabels) as TimeRange[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "px-2.5 py-1 text-[12px] font-medium rounded-md transition-all cursor-pointer",
            value === key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {timeRangeLabels[key]}
        </button>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700", "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getToday() {
  return new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltipContent({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[13px] font-medium" style={{ color: p.stroke || p.fill }}>
          {p.value?.toLocaleString("vi-VN")} {unit}
        </p>
      ))}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState<TimeRange>("30d");
  const totalTrips = tripCategoryData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Tổng quan</h1>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{getToday()}</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Hệ thống ổn định
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-muted-foreground h-8 text-[13px]">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 h-8 text-[13px]">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-10">
        {/* User Growth — with previous period comparison */}
        <Card className="lg:col-span-4 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div>
              <CardTitle className="text-sm font-medium">Tăng trưởng người dùng</CardTitle>
              <CardDescription className="text-[13px]">So sánh với kỳ trước</CardDescription>
            </div>
            <TimeRangeSelector value={chartRange} onChange={setChartRange} />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="h-2 w-5 rounded-full bg-[#FCD240]" />
                <span className="text-muted-foreground">Kỳ này</span>
              </div>
              <div className="flex items-center gap-1.5 text-[12px]">
                <span className="h-2 w-5 rounded-full bg-border" />
                <span className="text-muted-foreground">Kỳ trước</span>
              </div>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FCD240" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#FCD240" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={36} />
                  <RechartsTooltip content={<ChartTooltipContent unit="người" />} />
                  <Area type="monotone" dataKey="prev" stroke="#e5e7eb" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
                  <Area type="monotone" dataKey="users" stroke="#FCD240" strokeWidth={2} fill="url(#currentGrad)" dot={false}
                    activeDot={{ r: 4, fill: "#FCD240", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trip Activity */}
        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div>
              <CardTitle className="text-sm font-medium">Chuyến đi mới</CardTitle>
              <CardDescription className="text-[13px]">Số lượng theo tháng</CardDescription>
            </div>
            <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Activity className="h-3 w-3" /> 7 tháng
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tripData} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                  <RechartsTooltip content={<ChartTooltipContent unit="chuyến" />} />
                  <Bar dataKey="trips" radius={[5, 5, 0, 0]} maxBarSize={28}>
                    {tripData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === tripData.length - 1 ? "#10b98166" : "#10b981"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trip Categories */}
        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <div>
              <CardTitle className="text-sm font-medium">Phân loại chuyến đi</CardTitle>
              <CardDescription className="text-[13px]">Phân bổ {totalTrips} chuyến</CardDescription>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={tripCategoryData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {tripCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", padding: "8px 12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-1">
              {tripCategoryData.map((cat) => {
                const pct = Math.round((cat.value / totalTrips) * 100);
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-[13px] text-foreground/80 flex-1">{cat.name}</span>
                    <span className="text-[12px] tabular-nums text-muted-foreground">{cat.value}</span>
                    <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                    </div>
                    <span className="text-[12px] tabular-nums font-medium text-foreground/70 w-7 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Top Destinations + Quick Actions + System ── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Top Destinations */}
        <Card className="lg:col-span-5 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Điểm đến phổ biến</CardTitle>
              <CardDescription className="text-[13px]">Xếp hạng theo số chuyến đi</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[12px] text-muted-foreground hover:text-foreground h-7">
              Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {topDestinations.map((dest, idx) => (
                <div key={dest.name} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/30 transition-colors -mx-1">
                  <span className="text-[13px] font-medium text-muted-foreground/50 w-4 tabular-nums">{idx + 1}</span>
                  <span className="text-lg">{dest.img}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{dest.name}</p>
                    <p className="text-[11px] text-muted-foreground">{dest.trips} chuyến đi · <Star className="inline h-3 w-3 text-amber-400 fill-amber-400 -mt-0.5" /> {dest.rating}</p>
                  </div>
                  <span className="text-[12px] font-medium text-emerald-600">{dest.growth}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-4 border border-border/50 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Thao tác nhanh</CardTitle>
            <CardDescription className="text-[13px]">Truy cập nhanh chức năng chính</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(({ icon: QIcon, label, desc, color, bg }) => (
                <button
                  key={label}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 text-center transition-all cursor-pointer border border-transparent hover:border-border",
                    bg
                  )}
                >
                  <QIcon className={cn("h-5 w-5", color)} />
                  <p className="text-[12px] font-medium text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-3 border border-border/50 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Hệ thống</CardTitle>
            <span className="text-[11px] text-muted-foreground/60">30s trước</span>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {systemServices.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-lg px-3 py-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="flex h-[6px] w-[6px] rounded-full bg-emerald-500" />
                    <span className="text-[13px] text-foreground">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground tabular-nums">
                    <span>{s.latency}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-emerald-600">{s.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Trung bình phản hồi</span>
                <span className="font-medium text-foreground">7ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity — Timeline style ── */}
      <Card className="border border-border/50 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div>
            <CardTitle className="text-sm font-medium">Hoạt động gần đây</CardTitle>
            <CardDescription className="text-[13px]">Dòng thời gian hoạt động trên nền tảng</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-[13px] text-muted-foreground hover:text-foreground h-8">
            Xem tất cả <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/60" />

            {recentActivity.map((item, idx) => {
              const badge = typeBadge[item.type];
              const isLast = idx === recentActivity.length - 1;
              return (
                <div key={idx} className={cn("relative flex gap-4 pb-5", isLast && "pb-1")}>
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
                    <Avatar className="h-9 w-9 ring-2 ring-background">
                      <AvatarFallback className={cn("text-[10px] font-semibold", getAvatarColor(item.user))}>
                        {getInitials(item.user)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[13px] text-foreground leading-snug">
                      <span className="font-semibold">{item.user}</span>{" "}
                      <span className="text-muted-foreground">{item.action}</span>
                    </p>
                    <p className="text-[12px] text-foreground/60 mt-0.5">{item.detail}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", badge.className)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground/50">·</span>
                      <span className="text-[11px] text-muted-foreground/60 tabular-nums">{item.time}</span>
                    </div>
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
