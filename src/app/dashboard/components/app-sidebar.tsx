"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { getNavGroupsForRole } from "@/lib/nav";
import type { NavItem, Role } from "@/types";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/server/auth/actions";

function matchesItem(pathname: string, searchParams: URLSearchParams, item: NavItem): boolean {
  if (!item.href) return false;

  const [targetPathname, queryString] = item.href.split("?");
  if (targetPathname === ROUTES.DASHBOARD) {
    return pathname === targetPathname;
  }

  if (targetPathname === ROUTES.USERS && pathname.startsWith(ROUTES.USERS_MODERATORS)) {
    return false;
  }

  const pathMatches = item.exact
    ? pathname === targetPathname
    : pathname === targetPathname || pathname.startsWith(`${targetPathname}/`);

  if (!pathMatches) return false;
  if (!queryString) return true;

  const targetParams = new URLSearchParams(queryString);
  for (const [key, value] of targetParams.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

function hasActiveChild(pathname: string, searchParams: URLSearchParams, item: NavItem): boolean {
  return item.children?.some((child) => matchesItem(pathname, searchParams, child)) ?? false;
}

interface AppSidebarProps {
  role: Role;
  email: string;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navGroups = getNavGroupsForRole(role);
  const adminPortalLabel = "C\u1ed5ng qu\u1ea3n tr\u1ecb";
  const logoutLabel = "\u0110\u0103ng xu\u1ea5t";
  const logoutPendingLabel = "\u0110ang xu\u1ea5t...";

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  function toggleMenu(label: string) {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  }

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.DASHBOARD}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
                  <Image
                    src="/images/travelbuddy-logo-dark.png"
                    alt="TravelBuddy logo"
                    width={28}
                    height={28}
                    className="h-7 w-7 object-contain"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">TravelBuddy</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    {adminPortalLabel}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.key}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = matchesItem(pathname, searchParams, item);
                  const childActive = hasActiveChild(pathname, searchParams, item);
                  const isOpen = openMenus[item.label] ?? childActive;

                  if (item.children?.length) {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          isActive={active || childActive}
                          tooltip={item.label}
                          onClick={() => toggleMenu(item.label)}
                        >
                          <Icon />
                          <span>{item.label}</span>
                          <ChevronDown
                            className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </SidebarMenuButton>

                        {isOpen && (
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const childIsActive = matchesItem(pathname, searchParams, child);

                              return (
                                <SidebarMenuSubItem key={child.href ?? child.label}>
                                  <SidebarMenuSubButton asChild isActive={childIsActive}>
                                    <Link href={child.href!}>
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.href ?? item.label}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href!}>
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={handleLogout}
              disabled={isPending}
              tooltip={logoutLabel}
              className="text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>{isPending ? logoutPendingLabel : logoutLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
