"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchPartnerRequestById, fetchServicePartnerById } from "@/lib/api";
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
import type { Role } from "@/types";

const LABELS: Record<string, string> = {
  dashboard: "Tổng quan",
  users: "Người dùng",
  trips: "Chuyến đi",
  partners: "Đối tác",
  requests: "Hồ sơ đăng ký",
  active: "Đối tác đang hợp tác",
  moderation: "Kiểm duyệt",
  "rescue-requests": "\u0110\u01a1n c\u1ee9u h\u1ed9",
  reports: "Báo cáo",
  transactions: "Giao dịch",
  deposits: "N\u1ea1p ti\u1ec1n",
  "user-subscriptions": "Mua g\u00f3i ng\u01b0\u1eddi d\u00f9ng",
  "rescue-commission-revenue": "Chi ti\u1ebft hoa h\u1ed3ng",
  subscriptions: "Chính sách phí",
  "partner-commissions": "Hoa h\u1ed3ng \u0111\u1ed1i t\u00e1c",
  categories: "Danh mục",
  support: "Hỗ trợ",
  "audit-logs": "Nhật ký",
  settings: "Cài đặt",
  profile: "Thông tin cá nhân",
  admin: "Quản trị",
};

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const segments = pathname.split("/").filter(Boolean);
  const [detailLabel, setDetailLabel] = useState<string | null>(null);
  const isPartnerRequestDetail =
    segments.length === 4 &&
    segments[0] === "dashboard" &&
    segments[1] === "partners" &&
    segments[2] === "requests";
  const isActivePartnerDetail =
    segments.length === 4 &&
    segments[0] === "dashboard" &&
    segments[1] === "partners" &&
    segments[2] === "active";
  const isRescueRequestDetail =
    segments.length === 3 &&
    segments[0] === "dashboard" &&
    segments[1] === "rescue-requests";
  const isRescueCommissionPartnerDetail =
    segments.length === 5 &&
    segments[0] === "dashboard" &&
    segments[1] === "transactions" &&
    segments[2] === "rescue-commission-revenue" &&
    segments[3] === "partners";

  useEffect(() => {
    let ignore = false;

    async function loadDetailLabel() {
      if (!isPartnerRequestDetail && !isActivePartnerDetail) {
        setDetailLabel(null);
        return;
      }

      try {
        if (isPartnerRequestDetail) {
          const result = await fetchPartnerRequestById(segments[3]);
          if (!ignore) {
            setDetailLabel(result.data.requestCode || "Chi tiết hồ sơ");
          }
          return;
        }

        const result = await fetchServicePartnerById(segments[3]);
        if (!ignore) {
          setDetailLabel(
            result.data.servicePartnerName ||
              result.data.companyName ||
              "Chi tiết đối tác",
          );
        }
      } catch {
        if (!ignore) {
          setDetailLabel(null);
        }
      }
    }

    loadDetailLabel();
    return () => {
      ignore = true;
    };
  }, [isActivePartnerDetail, isPartnerRequestDetail, segments]);

  if (segments.length <= 1) return null;

  const visibleSegments =
    isPartnerRequestDetail || isActivePartnerDetail
      ? [segments[0], segments[1], segments[3]]
      : isRescueCommissionPartnerDetail
        ? [segments[0], segments[1], segments[2], segments[3], segments[4]]
      : segments;

  const crumbs = visibleSegments.map((seg, i) => {
    const isPartnerDetailLastCrumb =
      i === visibleSegments.length - 1 &&
      (isPartnerRequestDetail || isActivePartnerDetail);
    const isRescueRequestLastCrumb =
      i === visibleSegments.length - 1 && isRescueRequestDetail;
    const isRescueCommissionPartnerLastCrumb =
      i === visibleSegments.length - 1 && isRescueCommissionPartnerDetail;
    const partnerName = searchParams.get("partnerName")?.trim();

    return {
      label: isPartnerDetailLastCrumb
        ? detailLabel ||
          (isPartnerRequestDetail
            ? "Chi tiết hồ sơ"
            : "Chi tiết đối tác")
        : isRescueRequestLastCrumb
          ? `#${seg.slice(0, 8)}`
          : isRescueCommissionPartnerLastCrumb
            ? partnerName || `#${seg.slice(0, 8)}`
          : (LABELS[seg] ?? seg),
      href:
        isPartnerDetailLastCrumb ||
        isRescueRequestLastCrumb ||
        isRescueCommissionPartnerLastCrumb
        ? pathname
        : "/" + visibleSegments.slice(0, i + 1).join("/"),
    };
  });

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

interface DashboardShellProps {
  children: React.ReactNode;
  role: Role;
  email: string;
}

export function DashboardShell({ children, role, email }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} email={email} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DashboardBreadcrumb />
          </div>
          <div className="flex-1">
            <Navbar email={email} role={role} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
