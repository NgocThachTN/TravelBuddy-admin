"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, API_ROUTES } from "@/lib/constants";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Map,
  Megaphone,
  CreditCard,
  Package,
  Handshake,
  LifeBuoy,
  ScrollText,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";

/* ── Nav data ── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_MAIN: NavItem[] = [
  { label: "Tổng quan", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Người dùng", href: ROUTES.USERS, icon: Users },
  { label: "Chuyến đi", href: ROUTES.TRIPS, icon: Map },
  { label: "Đối tác", href: ROUTES.PARTNERS, icon: Handshake },
];

const NAV_OPERATIONS: NavItem[] = [
  { label: "Báo cáo & Khiếu nại", href: ROUTES.REPORTS, icon: Megaphone, badge: 3 },
  { label: "Giao dịch", href: ROUTES.TRANSACTIONS, icon: CreditCard },
  { label: "Gói đăng ký", href: ROUTES.SUBSCRIPTIONS, icon: Package },
  { label: "Hỗ trợ", href: ROUTES.SUPPORT, icon: LifeBuoy },
];

const NAV_SYSTEM: NavItem[] = [
  { label: "Nhật ký", href: ROUTES.AUDIT_LOGS, icon: ScrollText },
  { label: "Cài đặt", href: ROUTES.SETTINGS, icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.DASHBOARD) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
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
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <BarChart3 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">TravelBuddy</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Cổng quản trị
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Content ── */}
      <SidebarContent>
        {/* Main */}
        <NavGroup items={NAV_MAIN} pathname={pathname} />

        {/* Operations */}
        <NavGroup label="Vận hành" items={NAV_OPERATIONS} pathname={pathname} />

        {/* System */}
        <NavGroup label="Hệ thống" items={NAV_SYSTEM} pathname={pathname} />
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/* ── Reusable nav group ── */
function NavGroup({
  label,
  items,
  pathname,
}: {
  label?: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge != null && item.badge > 0 && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
