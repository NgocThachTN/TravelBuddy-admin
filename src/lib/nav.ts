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
  Shield,
} from "lucide-react";
import type { Role, NavItem, NavGroup } from "@/types";
import { ROUTES } from "./constants";

export type { NavItem, NavGroup } from "@/types";

const ALL_NAV_ITEMS: NavItem[] = [
  // ── Main ──
  {
    label: "Tổng quan",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["ADMIN", "MODERATOR"],
  },
  { label: "Người dùng", href: ROUTES.USERS, icon: Users, roles: ["ADMIN"] },
  { label: "Chuyến đi", href: ROUTES.TRIPS, icon: Map, roles: ["ADMIN"] },
  {
    label: "Đối tác",
    href: ROUTES.PARTNERS,
    icon: Handshake,
    roles: ["ADMIN"],
  },

  // ── Community / Safety ──
  {
    label: "Kiểm duyệt",
    href: ROUTES.MODERATION,
    icon: Shield,
    roles: ["ADMIN", "MODERATOR"],
  },
  {
    label: "Báo cáo & Khiếu nại",
    href: ROUTES.REPORTS,
    icon: Megaphone,
    badge: 3,
    roles: ["ADMIN", "MODERATOR"],
  },
  {
    label: "Hỗ trợ",
    href: ROUTES.SUPPORT,
    icon: LifeBuoy,
    roles: ["ADMIN", "MODERATOR"],
  },

  // ── Operations ──
  {
    label: "Giao dịch",
    href: ROUTES.TRANSACTIONS,
    icon: CreditCard,
    roles: ["ADMIN"],
  },
  {
    label: "Gói đăng ký",
    href: ROUTES.SUBSCRIPTIONS,
    icon: Package,
    roles: ["ADMIN"],
  },

  // ── System ──
  {
    label: "Nhật ký",
    href: ROUTES.AUDIT_LOGS,
    icon: ScrollText,
    roles: ["ADMIN"],
  },
  {
    label: "Cài đặt",
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: ["ADMIN"],
  },
];

/** Map of item href → group key (for grouping in sidebar) */
const ITEM_GROUP: Record<string, string> = {
  [ROUTES.DASHBOARD]: "main",
  [ROUTES.USERS]: "main",
  [ROUTES.TRIPS]: "main",
  [ROUTES.PARTNERS]: "main",
  [ROUTES.MODERATION]: "community",
  [ROUTES.REPORTS]: "community",
  [ROUTES.SUPPORT]: "community",
  [ROUTES.TRANSACTIONS]: "operations",
  [ROUTES.SUBSCRIPTIONS]: "operations",
  [ROUTES.AUDIT_LOGS]: "system",
  [ROUTES.SETTINGS]: "system",
};

const GROUP_LABELS: Record<string, string | undefined> = {
  main: undefined,
  community: "Cộng đồng & An toàn",
  operations: "Vận hành",
  system: "Hệ thống",
};

export function getNavGroupsForRole(role: Role): NavGroup[] {
  const filtered = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));

  // Group items preserving insertion order
  const groupOrder: string[] = [];
  const groupItems: Record<string, NavItem[]> = {};

  for (const item of filtered) {
    const groupKey = ITEM_GROUP[item.href] ?? "main";
    if (!groupItems[groupKey]) {
      groupOrder.push(groupKey);
      groupItems[groupKey] = [];
    }
    groupItems[groupKey].push(item);
  }

  return groupOrder.map((key) => ({
    key,
    label: GROUP_LABELS[key],
    items: groupItems[key],
  }));
}
