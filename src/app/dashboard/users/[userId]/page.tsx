import Link from "next/link";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { ROUTES } from "@/lib/constants";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  Shield,
  UserCircle,
  FileText,
} from "lucide-react";

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
        <h2 className="text-lg font-semibold text-foreground">
          Không tìm thấy người dùng
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Không tồn tại người dùng với ID &ldquo;{userId}&rdquo;.
        </p>
        <Link href={ROUTES.USERS} className="mt-5">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Chi tiết người dùng
          </h1>
          <p className="text-sm text-muted-foreground">
            Hồ sơ của {user.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Profile Card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <Avatar name={user.name} size="lg" />
            <h2 className="mt-4 text-lg font-bold text-foreground">
              {user.name}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {user.email}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="default">{user.role}</Badge>
              <Badge
                variant={user.status === "active" ? "success" : "destructive"}
              >
                {user.status}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid w-full grid-cols-2 gap-3">
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {user.tripsCount}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Chuyến đi
                </p>
              </div>
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-xl font-bold text-foreground">
                  {Math.floor(
                    (Date.now() - createdDate.getTime()) / 86_400_000
                  )}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  Ngày hoạt động
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right — Details */}
        <Card className="lg:col-span-2" title="Thông tin tài khoản">
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
              value={user.status}
              badge={user.status === "active" ? "success" : "destructive"}
            />
            <div className="sm:col-span-2">
              <DetailRow icon={FileText} label="Giới thiệu" value={user.bio} />
            </div>
          </div>
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
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
  badge?: "success" | "destructive";
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
        {badge ? (
          <Badge variant={badge} className="mt-1">
            {value}
          </Badge>
        ) : (
          <p
            className={`mt-0.5 text-sm font-medium text-foreground ${
              mono ? "font-mono text-xs" : ""
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
