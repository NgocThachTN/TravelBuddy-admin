"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import Navbar from "./components/Navbar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* ── Route ↔ label map ── */
const LABELS: Record<string, string> = {
  dashboard: "Tổng quan",
  users: "Người dùng",
  trips: "Chuyến đi",
  partners: "Đối tác",
  reports: "Báo cáo",
  transactions: "Giao dịch",
  subscriptions: "Gói đăng ký",
  support: "Hỗ trợ",
  "audit-logs": "Nhật ký",
  settings: "Cài đặt",
};

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "users", ...]

  if (segments.length <= 1) return null; // just /dashboard → no breadcrumb

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {!isLast ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DashboardBreadcrumb />
          </div>
          <div className="flex-1">
            <Navbar />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
