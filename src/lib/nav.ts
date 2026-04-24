import {
  CreditCard,
  HandCoins,
  Handshake,
  LayoutDashboard,
  Map,
  Megaphone,
  Package,
  Siren,
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
    label: "Qu\u1ea3n l\u00fd chuy\u1ebfn \u0111i",
    href: ROUTES.TRIPS,
    icon: Map,
    roles: ["ADMIN"],
  },
  {
    label: "B\u00e1o c\u00e1o & Khi\u1ebfu n\u1ea1i",
    href: ROUTES.REPORTS,
    icon: Megaphone,
    roles: ["ADMIN"],
  },
  {
    label: "Qu\u1ea3n l\u00fd ch\u00ednh s\u00e1ch ph\u00ed",
    icon: Package,
    roles: ["ADMIN"],
    children: [
      {
        label: "G\u00f3i ng\u01b0\u1eddi d\u00f9ng",
        href: ROUTES.SUBSCRIPTIONS_USERS,
        icon: Package,
        roles: ["ADMIN"],
      },
      {
        label: "Hoa h\u1ed3ng \u0111\u1ed1i t\u00e1c",
        href: ROUTES.SUBSCRIPTIONS_PARTNER_COMMISSIONS,
        icon: Package,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Qu\u1ea3n l\u00fd giao d\u1ecbch",
    icon: CreditCard,
    roles: ["ADMIN"],
    children: [
      {
        label: "Giao d\u1ecbch ng\u01b0\u1eddi d\u00f9ng",
        href: ROUTES.TRANSACTIONS_USER_TRANSACTIONS,
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Giao d\u1ecbch n\u1ea1p ti\u1ec1n",
        href: ROUTES.TRANSACTIONS_DEPOSITS,
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "R\u00fat ti\u1ec1n v\u00ed",
        href: ROUTES.TRANSACTIONS_WALLET_WITHDRAWALS,
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Mua g\u00f3i ng\u01b0\u1eddi d\u00f9ng",
        href: ROUTES.TRANSACTIONS_USER_SUBSCRIPTIONS,
        icon: CreditCard,
        roles: ["ADMIN"],
      },
      {
        label: "Chi ti\u1ebft hoa h\u1ed3ng",
        href: ROUTES.TRANSACTIONS_RESCUE_COMMISSION_REVENUE,
        icon: HandCoins,
        roles: ["ADMIN"],
      },
    ],
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
    label: "\u0110\u01a1n c\u1ee9u h\u1ed9",
    href: ROUTES.RESCUE_REQUESTS,
    icon: Siren,
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
        label: "Điểm cộng đồng",
        href: ROUTES.MODERATION_REPORTS_BY_TYPE("SocialCheckpoint"),
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
      {
        label: "B\u00e1o c\u00e1o c\u1ee7a t\u00f4i",
        href: ROUTES.MODERATION_MY_REPORTS,
        icon: Megaphone,
        roles: ["MODERATOR"],
      },
    ],
  },
];

const ROLE_NAV_GROUPS: Record<Role, NavGroup[]> = {
  ADMIN: [{ key: "admin", items: ADMIN_NAV_ITEMS }],
  MODERATOR: [{ key: "moderator", items: MODERATOR_NAV_ITEMS }],
};

export function getNavGroupsForRole(role: Role): NavGroup[] {
  return ROLE_NAV_GROUPS[role] ?? [];
}
