"use client";

import { useTransition } from "react";
import { logoutAction } from "@/server/auth/actions";
import type { Role } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/rbac";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell, LogOut, ChevronDown } from "lucide-react";

interface NavbarProps {
  phone: string;
  role: Role;
}

/** Format +84862648911 → 0862 648 911 for display */
function formatPhone(phone: string): string {
  const local = phone.startsWith("+84")
    ? "0" + phone.slice(3)
    : phone;
  return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
}

function initials(phone: string): string {
  const local = phone.startsWith("+84") ? "0" + phone.slice(3) : phone;
  return local.slice(-2).toUpperCase();
}

export default function Navbar({ phone, role }: NavbarProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  const displayPhone = formatPhone(phone);
  const roleLabel = ROLE_LABELS[role];
  const isAdmin = role === "ADMIN";

  return (
    <div className="flex h-full items-center justify-between pr-6">
      {/* Left — Search */}
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm người dùng, chuyến đi…"
          className="h-9 pl-9 pr-4 text-sm bg-background"
        />
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Role Badge */}
        <Badge
          variant="outline"
          className={
            isAdmin
              ? "border-primary/40 bg-primary/10 text-primary font-semibold text-[11px]"
              : "border-blue-400/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[11px]"
          }
        >
          {roleLabel}
        </Badge>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1.5 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary-dark">
                  {initials(phone)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">
                  {roleLabel}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {displayPhone}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold">{roleLabel}</p>
              <p className="text-xs font-normal text-muted-foreground">
                {displayPhone}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Đang đăng xuất…" : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
