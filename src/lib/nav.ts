import {
  CreditCard,
  Handshake,
  LayoutDashboard,
  Map,
  Megaphone,
  Package,
  ScrollText,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import type { NavGroup, NavItem, Role } from "@/types";
import { ROUTES } from "./constants";

export type { NavItem, NavGroup } from "@/types";

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "T\u1ed5ng quan",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    label: "Qu\u1ea3n l\u00fd ng\u01b0\u1eddi d\u00f9ng",
    icon: Users,
    roles: ["ADMIN"],
    children: [
      {
        label: "Ng\u01b0\u1eddi d\u00f9ng",
        href: ROUTES.USERS,
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        label: "Ki\u1ec3m duy\u1ec7t vi\u00ean",
        href: ROUTES.USERS_MODERATORS,
        icon: Shield,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Qu\u1ea3n l\u00fd \u0111\u1ed1i t\u00e1c",
    href: ROUTES.PARTNERS,
    icon: Handshake,
    roles: ["ADMIN"],
  },
  {
    label: "B\u00e1o c\u00e1o & Khi\u1ebfu n\u1ea1i",
    href: ROUTES.REPORTS,
    icon: Megaphone,
    roles: ["ADMIN"],
  },
  {
    label: "Qu\u1ea3n l\u00fd g\u00f3i d\u1ecbch v\u1ee5",
    icon: Package,
    roles: ["ADMIN"],
    children: [
      {
        label: "G\u00f3i \u0111\u1ed1i t\u00e1c",
        href: ROUTES.SUBSCRIPTIONS_PARTNERS,
        icon: Package,
        roles: ["ADMIN"],
      },
      {
        label: "G\u00f3i ng\u01b0\u1eddi d\u00f9ng",
        href: ROUTES.SUBSCRIPTIONS_USERS,
        icon: Package,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Qu\u1ea3n l\u00fd giao d\u1ecbch",
    href: ROUTES.TRANSACTIONS,
    icon: CreditCard,
    roles: ["ADMIN"],
  },
  {
    label: "Nh\u1eadt k\u00fd",
    href: ROUTES.AUDIT_LOGS,
    icon: ScrollText,
    roles: ["ADMIN"],
  },
  {
    label: "C\u00e0i \u0111\u1eb7t",
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: ["ADMIN"],
  },
];

const MODERATOR_NAV_ITEMS: NavItem[] = [
  {
    label: "T\u1ed5ng quan",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: ["MODERATOR"],
  },
  {
    label: "Ki\u1ec3m duy\u1ec7t",
    href: ROUTES.MODERATION,
    icon: Shield,
    roles: ["MODERATOR"],
  },
  {
    label: "Qu\u1ea3n l\u00fd chuy\u1ebfn \u0111i",
    href: ROUTES.TRIPS,
    icon: Map,
    roles: ["MODERATOR"],
  },
  {
    label: "Qu\u1ea3n l\u00fd b\u00e1o c\u00e1o",
    icon: Megaphone,
    roles: ["MODERATOR"],
    children: [
      {
        label: "T\u1ea5t c\u1ea3 b\u00e1o c\u00e1o",
        href: ROUTES.MODERATION_REPORTS,
        icon: Megaphone,
        roles: ["MODERATOR"],
        exact: true,
      },
      {
        label: "Chuy\u1ebfn \u0111i",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("Trip"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "Tin nh\u1eafn chuy\u1ebfn \u0111i",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("TripMessage"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "B\u00e0i vi\u1ebft",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("Post"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "B\u00ecnh lu\u1eadn b\u00e0i vi\u1ebft",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("PostComment"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "Y\u00eau c\u1ea7u c\u1ee9u h\u1ed9",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("RescueRequest"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "Tin nh\u1eafn c\u1ee9u h\u1ed9",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("RescueRequestMessage"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "Checkpoint x\u00e3 h\u1ed9i",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("SocialCheckpoint"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
    ],
  },
  {
    label: "C\u00e0i \u0111\u1eb7t",
    href: ROUTES.SETTINGS,
    icon: Settings,
    roles: ["MODERATOR"],
  },
];

const ROLE_NAV_GROUPS: Record<Role, NavGroup[]> = {
  ADMIN: [{ key: "admin", items: ADMIN_NAV_ITEMS }],
  MODERATOR: [{ key: "moderator", items: MODERATOR_NAV_ITEMS }],
};

export function getNavGroupsForRole(role: Role): NavGroup[] {
  return ROLE_NAV_GROUPS[role] ?? [];
}
