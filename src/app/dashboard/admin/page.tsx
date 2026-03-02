import { requireRole } from "@/server/auth/dal";
import { Shield, Users, ScrollText, Settings } from "lucide-react";

export default async function AdminPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Khu vực Quản trị</h1>
        <p className="text-muted-foreground mt-1">
          Chỉ dành cho tài khoản có vai trò <strong>Admin</strong>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Users,
            title: "Quản lý người dùng",
            desc: "Khóa, mở khóa và phân quyền tài khoản.",
            href: "/dashboard/users",
          },
          {
            icon: ScrollText,
            title: "Nhật ký hệ thống",
            desc: "Xem lịch sử hoạt động toàn hệ thống.",
            href: "/dashboard/audit-logs",
          },
          {
            icon: Settings,
            title: "Cài đặt hệ thống",
            desc: "Cấu hình nền tảng và tích hợp.",
            href: "/dashboard/settings",
          },
        ].map(({ icon: Icon, title, desc, href }) => (
          <a
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {title}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80">
          Trang này và các tính năng bên dưới chỉ hiển thị với tài khoản{" "}
          <strong className="text-primary">Admin</strong>. Moderator sẽ bị chặn
          bởi route guard.
        </p>
      </div>
    </div>
  );
}
