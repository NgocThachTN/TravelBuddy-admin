import type { LucideIcon } from "lucide-react";
import type { Role } from "./auth";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: number;
  roles: Role[];
  children?: NavItem[];
  exact?: boolean;
}

export interface NavGroup {
  key: string;
  label?: string;
  items: NavItem[];
}
