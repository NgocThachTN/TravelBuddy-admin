"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import {
  LayoutDashboard,
  Users,
  Map,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Tổng quan",
    href: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Người dùng",
    href: ROUTES.ADMIN_USERS,
    icon: Users,
  },
  {
    label: "Chuyến đi",
    href: "#",
    icon: Map,
    disabled: true,
    badge: "Sắp ra",
  },
  {
    label: "Báo cáo",
    href: "#",
    icon: FileBarChart,
    disabled: true,
    badge: "Sắp ra",
  },
];

const BOTTOM_ITEMS = [
  {
    label: "Cài đặt",
    href: "#",
    icon: Settings,
    disabled: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col bg-sidebar transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-accent px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Compass className="h-5 w-5 text-primary-foreground" />
        </div>
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          <span className="whitespace-nowrap text-base font-bold text-primary">
            TravelBuddy
          </span>
          <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Quản trị viên
          </p>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Section Label */}
      <div
        className={cn(
          "mt-6 px-4 transition-all duration-300",
          collapsed ? "opacity-0" : "opacity-100"
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
          Danh mục
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href) && item.href !== "#";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(252,210,64,0.3)]"
                  : item.disabled
                  ? "cursor-not-allowed text-sidebar-foreground/25"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-muted hover:text-sidebar-foreground"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active
                    ? "text-primary-foreground"
                    : item.disabled
                    ? "text-sidebar-foreground/25"
                    : "text-sidebar-foreground/40 group-hover:text-sidebar-foreground"
                )}
              />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
              {item.badge && !collapsed && (
                <span className="ml-auto rounded-md bg-sidebar-muted px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                  {item.badge}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {item.label}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-foreground" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="space-y-1 border-t border-sidebar-accent px-3 py-3">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                item.disabled
                  ? "cursor-not-allowed text-sidebar-foreground/25"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-muted hover:text-sidebar-foreground"
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/40" />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Version */}
        <div
          className={cn(
            "px-3 pt-2 transition-all duration-300",
            collapsed ? "opacity-0" : "opacity-100"
          )}
        >
          <p className="text-[10px] text-sidebar-foreground/20">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
