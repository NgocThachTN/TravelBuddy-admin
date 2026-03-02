import { requireAnyRole } from "@/server/auth/dal";
import { Shield, Flag, MessageSquareWarning, CheckCircle } from "lucide-react";

export default async function ModerationPage() {
  const session = await requireAnyRole(["ADMIN", "MODERATOR"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kiểm duyệt nội dung</h1>
        <p className="text-muted-foreground mt-1">
          Đang đăng nhập với vai trò{" "}
          <strong>{session.role === "ADMIN" ? "Admin" : "Kiểm duyệt viên"}</strong>.
          Cả Admin và Moderator đều có thể truy cập trang này.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: Flag,
            title: "Nội dung bị báo cáo",
            count: 12,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
          {
            icon: MessageSquareWarning,
            title: "Bình luận chờ duyệt",
            count: 5,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            icon: CheckCircle,
            title: "Đã xử lý hôm nay",
            count: 28,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
        ].map(({ icon: Icon, title, count, color, bg }) => (
          <div
            key={title}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-muted-foreground">{title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-400/20 bg-blue-500/5 p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80">
          Route <code className="bg-muted px-1 rounded">/dashboard/moderation</code> có thể
          truy cập bởi cả <strong>Admin</strong> và{" "}
          <strong className="text-blue-600 dark:text-blue-400">Moderator</strong>.
        </p>
      </div>
    </div>
  );
}
