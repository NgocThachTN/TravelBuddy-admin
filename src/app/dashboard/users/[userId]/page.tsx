import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES, COOKIE_NAME } from "@/lib/constants";
import { backendApi } from "@/lib/axios";
import { verifyAdminToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { BePagedWrapper, TripListItem, UserDetail } from "@/types";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCircle,
  FileText,
  Fingerprint,
  BadgeCheck,
  Link as LinkIcon,
} from "lucide-react";
import UserTripsTabs from "@/app/dashboard/users/components/UserTripsTabs";

/* ── Avatar / name helpers ── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
function getAvatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(user: UserDetail) {
  const first = user.firstName?.trim();
  const last = user.lastName?.trim();
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return (user.username ?? "?").slice(0, 2).toUpperCase();
}
function getDisplayName(user: UserDetail) {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "(Chưa đặt tên)";
}

const ROLE_LABELS: Record<string, string> = {
  Traveler: "Du khách",
  ServicePartner: "Đối tác",
  Moderator: "Điều phối viên",
  Admin: "Quản trị viên",
};

const PROVIDER_LABELS: Record<string, string> = {
  Email: "Email",
  Phone: "Điện thoại",
  Google: "Google",
  Apple: "Apple",
  Facebook: "Facebook",
  Zalo: "Zalo",
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

const TRIP_PAGE_SIZE = 50;
const TRIP_MAX_PAGES = 6;

function sortTripsByStartDesc(items: TripListItem[]) {
  return [...items].sort((a, b) => {
    const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
    const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
    return bTime - aTime;
  });
}

async function fetchAdminUserTripsByType(
  token: string,
  userId: string,
  type: "owned" | "joined",
): Promise<TripListItem[]> {
  const allItems: TripListItem[] = [];

  for (let pageNumber = 1; pageNumber <= TRIP_MAX_PAGES; pageNumber++) {
    const { data } = await backendApi.get<BePagedWrapper<TripListItem>>(
      `/api/v1/admin/users/${userId}/trips/${type}`,
      {
        params: {
          pageNumber,
          pageSize: TRIP_PAGE_SIZE,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const pageItems = data?.data?.items ?? [];
    allItems.push(...pageItems);

    const totalPages = data?.data?.totalPages ?? pageNumber;
    if (pageNumber >= totalPages || pageItems.length === 0) break;
  }

  return allItems;
}

async function buildAdminUserTrips(userId: string, token: string) {
  const [ownedTrips, joinedTrips] = await Promise.all([
    fetchAdminUserTripsByType(token, userId, "owned"),
    fetchAdminUserTripsByType(token, userId, "joined"),
  ]);

  return {
    ownedTrips: sortTripsByStartDesc(ownedTrips),
    joinedTrips: sortTripsByStartDesc(joinedTrips),
  };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;

  // Get JWT token from cookie (server-side)
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    notFound();
  }

  const session = await verifyAdminToken(token);
  if (!session) {
    notFound();
  }

  let user: UserDetail;
  try {
    const { data } = await backendApi.get<{ success: boolean; data: UserDetail }>(
      `/api/v1/admin/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    user = data.data;
  } catch {
    notFound();
  }

  let joinedTrips: TripListItem[] = [];
  let ownedTrips: TripListItem[] = [];

  if (session.role === "ADMIN") {
    const userTrips = await buildAdminUserTrips(userId, token);
    joinedTrips = userTrips.joinedTrips;
    ownedTrips = userTrips.ownedTrips;
  }

  const displayName = getDisplayName(user);
  const createdDate = new Date(user.createdAt);
  const memberSince = createdDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={ROUTES.USERS}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chi tiết người dùng</h1>
          <p className="text-sm text-muted-foreground">Hồ sơ của {displayName}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Avatar className="h-16 w-16">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
              <AvatarFallback className={cn("text-lg font-bold", getAvatarColor(user.userId))}>
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-bold">{displayName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">@{user.username}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
              <Badge
                variant={!user.isLocked ? "default" : "destructive"}
                className={cn(!user.isLocked && "bg-success-light text-success-dark border-0")}
              >
                {!user.isLocked ? "Hoạt động" : "Bị khoá"}
              </Badge>
            </div>

            {/* Verification badges */}
            <div className="mt-3 flex gap-3">
              {user.isEmailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Email
                </span>
              )}
              {user.isPhoneVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  SĐT
                </span>
              )}
            </div>

            <Separator className="my-5" />

            {/* Stats */}
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xl font-bold">
                  {user.authProviders?.length ?? 0}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Liên kết</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-sm font-bold">{memberSince}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Ngày tham gia</p>
              </div>
            </div>

            {/* Auth Providers */}
            {user.authProviders?.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="w-full space-y-1.5">
                  <p className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Phương thức đăng nhập
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.authProviders.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs">
                        <LinkIcon className="mr-1 h-3 w-3" />
                        {PROVIDER_LABELS[p] ?? p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Right — Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailRow
                icon={Fingerprint}
                label="Mã người dùng"
                value={user.userId}
                mono
              />
              <DetailRow
                icon={UserCircle}
                label="Tên đăng nhập"
                value={user.username || "—"}
              />
              <DetailRow
                icon={Mail}
                label="Email"
                value={user.email || "—"}
              />
              <DetailRow
                icon={Phone}
                label="Số điện thoại"
                value={user.phone || "—"}
              />
              <DetailRow
                icon={Shield}
                label="Vai trò"
                value={ROLE_LABELS[user.role] ?? user.role}
              />
              <DetailRow
                icon={Shield}
                label="Trạng thái"
                value={!user.isLocked ? "Hoạt động" : "Bị khoá"}
                badgeVariant={!user.isLocked ? "default" : "destructive"}
                badgeClassName={!user.isLocked ? "bg-success-light text-success-dark border-0" : ""}
              />
              <DetailRow
                icon={Calendar}
                label="Ngày tạo"
                value={createdDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              {user.updatedAt && (
                <DetailRow
                  icon={Calendar}
                  label="Cập nhật lần cuối"
                  value={new Date(user.updatedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                />
              )}
              {user.relativePhone && (
                <DetailRow
                  icon={Phone}
                  label="SĐT người thân"
                  value={user.relativePhone}
                />
              )}
              {user.experienceLevel && (
                <DetailRow
                  icon={Shield}
                  label="Mức kinh nghiệm"
                  value={user.experienceLevel}
                />
              )}
              {user.bio && (
                <div className="sm:col-span-2">
                  <DetailRow
                    icon={FileText}
                    label="Giới thiệu"
                    value={user.bio}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {session.role === "ADMIN" && (
        <UserTripsTabs joinedTrips={joinedTrips} ownedTrips={ownedTrips} />
      )}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
  badgeVariant,
  badgeClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  badgeVariant?: "default" | "destructive" | "secondary" | "outline";
  badgeClassName?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {badgeVariant ? (
          <Badge variant={badgeVariant} className={cn("mt-1", badgeClassName)}>
            {value}
          </Badge>
        ) : (
          <p className={cn("mt-0.5 text-sm font-medium break-all", mono && "font-mono text-xs")}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
