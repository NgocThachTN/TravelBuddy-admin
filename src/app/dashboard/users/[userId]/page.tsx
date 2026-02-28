import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Shield,
  UserCircle,
  FileText,
} from "lucide-react";

/* ── Avatar helpers ── */
const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

// Mock user detail — replace with real API fetch when backend is ready.
const MOCK_USERS: Record<
  string,
  {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "locked";
    createdAt: string;
    bio: string;
    tripsCount: number;
  }
> = {
  usr_001: {
    id: "usr_001",
    name: "Nguyen Van A",
    email: "vana@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-06-15T08:30:00Z",
    bio: "Backpacker exploring the beauty of Vietnam's northern mountains.",
    tripsCount: 12,
  },
  usr_002: {
    id: "usr_002",
    name: "Tran Thi B",
    email: "thib@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-07-01T10:00:00Z",
    bio: "Passionate about local cuisine and hidden gems.",
    tripsCount: 8,
  },
  usr_003: {
    id: "usr_003",
    name: "Le Van C",
    email: "vanc@example.com",
    role: "host",
    status: "locked",
    createdAt: "2025-07-20T14:15:00Z",
    bio: "Homestay owner in Da Lat with 5 years of hosting.",
    tripsCount: 0,
  },
  usr_004: {
    id: "usr_004",
    name: "Pham Thi D",
    email: "thid@example.com",
    role: "traveler",
    status: "active",
    createdAt: "2025-08-05T09:45:00Z",
    bio: "Solo traveler and photography enthusiast.",
    tripsCount: 5,
  },
  usr_005: {
    id: "usr_005",
    name: "Hoang Van E",
    email: "vane@example.com",
    role: "host",
    status: "active",
    createdAt: "2025-09-12T16:20:00Z",
    bio: "Tour guide based in Hoi An.",
    tripsCount: 3,
  },
  usr_006: {
    id: "usr_006",
    name: "Vo Thi F",
    email: "thif@example.com",
    role: "traveler",
    status: "locked",
    createdAt: "2025-10-03T11:30:00Z",
    bio: "Account under review.",
    tripsCount: 1,
  },
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const user = MOCK_USERS[userId];

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Không tìm thấy người dùng</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Không tồn tại người dùng với ID &ldquo;{userId}&rdquo;.
        </p>
        <Link href={ROUTES.USERS} className="mt-5">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  const createdDate = new Date(user.createdAt);

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
          <p className="text-sm text-muted-foreground">Hồ sơ của {user.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <Avatar className="h-16 w-16">
              <AvatarFallback className={cn("text-lg font-bold", getAvatarColor(user.name))}>
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-lg font-bold">{user.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary">{user.role}</Badge>
              <Badge
                variant={user.status === "active" ? "default" : "destructive"}
                className={cn(
                  user.status === "active" && "bg-success-light text-success-dark border-0"
                )}
              >
                {user.status === "active" ? "Hoạt động" : "Bị khóa"}
              </Badge>
            </div>

            <Separator className="my-5" />

            {/* Quick Stats */}
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xl font-bold">{user.tripsCount}</p>
                <p className="text-[11px] font-medium text-muted-foreground">Chuyến đi</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-xl font-bold">
                  {Math.floor((Date.now() - createdDate.getTime()) / 86_400_000)}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">Ngày hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right — Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailRow icon={UserCircle} label="Mã người dùng" value={user.id} mono />
              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow icon={Shield} label="Vai trò" value={user.role} />
              <DetailRow
                icon={Calendar}
                label="Ngày tạo"
                value={createdDate.toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              />
              <DetailRow icon={MapPin} label="Số chuyến đi" value={user.tripsCount.toString()} />
              <DetailRow
                icon={Shield}
                label="Trạng thái"
                value={user.status === "active" ? "Hoạt động" : "Bị khóa"}
                badgeVariant={user.status === "active" ? "default" : "destructive"}
                badgeClassName={user.status === "active" ? "bg-success-light text-success-dark border-0" : ""}
              />
              <div className="sm:col-span-2">
                <DetailRow icon={FileText} label="Giới thiệu" value={user.bio} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
          <p className={cn("mt-0.5 text-sm font-medium", mono && "font-mono text-xs")}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
