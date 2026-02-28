"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { logoutAdmin } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Search, Bell, LogOut, ChevronDown } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logoutAdmin();
    } catch {
      // ignore
    }
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

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
                  QT
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">
                  Quản trị viên
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  admin@travelbuddy.vn
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="sm:hidden">
              <p className="font-semibold">Quản trị viên</p>
              <p className="text-xs font-normal text-muted-foreground">
                admin@travelbuddy.vn
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
