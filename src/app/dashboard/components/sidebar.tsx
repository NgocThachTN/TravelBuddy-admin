"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES, API_ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  Map,
  Megaphone,
  CreditCard,
  Package,
  Settings,
  ChevronLeft,
  BarChart3,
  LogOut,
  UserCircle,
  Handshake,
  LifeBuoy,
  ScrollText,
} from "lucide-react";
import styles from "./sidebar.module.css";

/* ── Nav data ── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tổng quan", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Quản lý người dùng", href: ROUTES.USERS, icon: Users },
  { label: "Quản lý chuyến đi", href: ROUTES.TRIPS, icon: Map },
  { label: "Quản lý đối tác", href: ROUTES.PARTNERS, icon: Handshake },
  {
    label: "Báo cáo & Khiếu nại",
    href: ROUTES.REPORTS,
    icon: Megaphone,
    badgeCount: 3,
  },
  {
    label: "Quản lý giao dịch",
    href: ROUTES.TRANSACTIONS,
    icon: CreditCard,
  },
  {
    label: "Gói đăng ký Planner",
    href: ROUTES.SUBSCRIPTIONS,
    icon: Package,
  },
  {
    label: "Hỗ trợ khách hàng",
    href: ROUTES.SUPPORT,
    icon: LifeBuoy,
  },
  {
    label: "Nhật ký hệ thống",
    href: ROUTES.AUDIT_LOGS,
    icon: ScrollText,
  },
  {
    label: "Cài đặt hệ thống",
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(API_ROUTES.AUTH_LOGOUT, { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <aside className={styles.sidebar}>
      {/* ── Header ── */}
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
            <BarChart3 className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-[15px] font-bold text-gray-900">
            TravelBuddy
          </span>
        </div>
        <button
          aria-label="Thu gọn sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* ── Nav list ── */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-[#F6D351] text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active
                    ? "text-gray-900"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badgeCount != null && item.badgeCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-none text-white">
                  {item.badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
