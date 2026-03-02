"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { ROUTES } from "@/lib/constants";
import type { Role } from "@/lib/rbac";
import { getNavGroupsForRole } from "@/lib/nav";
import { logoutAction } from "@/server/auth/actions";
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
import { BarChart3, LogOut } from "lucide-react";

function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.DASHBOARD) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

interface AppSidebarProps {
  role: Role;
  phone: string;
}

export function AppSidebar({ role, phone: _phone }: AppSidebarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const navGroups = getNavGroupsForRole(role);

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
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

      {/* ── Content: role-filtered nav groups ── */}
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.key}>
            {group.label && (
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
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
        ))}
      </SidebarContent>

      <SidebarSeparator />

      {/* ── Footer: Logout ── */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleLogout}
              disabled={isPending}
              tooltip="Đăng xuất"
              className="text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>{isPending ? "Đang xuất…" : "Đăng xuất"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
