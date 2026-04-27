"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { logoutAction } from "@/server/auth/actions";
import { ROUTES } from "@/lib/constants";
import type { Role } from "@/types";
import { getMyProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ChevronDown, User } from "lucide-react";

interface NavbarProps {
  email: string;
  role: Role;
}

function initials(email: string): string {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar({ email, role }: NavbarProps) {
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    let ignore = false;

    void getMyProfile()
      .then((response) => {
        if (ignore) return;

        const raw = response.data as Record<string, unknown>;
        const profile = raw.profile as Record<string, unknown> | undefined;
        const avatar =
          (typeof raw.avatarUrl === "string" && raw.avatarUrl) ||
          (typeof raw.avatar_url === "string" && raw.avatar_url) ||
          (typeof profile?.avatarUrl === "string" && profile.avatarUrl) ||
          (typeof profile?.avatar_url === "string" && profile.avatar_url) ||
          "";

        setAvatarUrl(avatar);
      })
      .catch(() => undefined);

    const handleAvatarUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ avatarUrl?: string }>).detail;
      if (typeof detail?.avatarUrl === "string") {
        setAvatarUrl(detail.avatarUrl);
      }
    };

    window.addEventListener("profile-avatar-updated", handleAvatarUpdated);

    return () => {
      ignore = true;
      window.removeEventListener("profile-avatar-updated", handleAvatarUpdated);
    };
  }, []);

  function handleLogout() {
    startTransition(() => {
      logoutAction();
    });
  }

  const roleLabel = role === "MODERATOR" ? "Kiểm duyệt viên" : "Quản trị viên";
  const isAdmin = role === "ADMIN";
  const isModerator = role === "MODERATOR";

  return (
    <div className="flex h-full items-center justify-between pr-6">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1.5 h-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl} alt="Ảnh đại diện" />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary-dark">
                  {initials(email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">{roleLabel}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{email}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-semibold">{roleLabel}</p>
              <p className="text-xs font-normal text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            {isModerator && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.PROFILE} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Thông tin cá nhân
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
