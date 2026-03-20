import { Shield } from "lucide-react";
import CreateModeratorButton from "../components/CreateModeratorButton";
import UserTable from "../components/UserTable";

export default function ModeratorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý kiểm duyệt viên
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản kiểm duyệt viên và quyền vận hành
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateModeratorButton />
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary-dark" />
          </div>
        </div>
      </div>

      <UserTable
        fixedRole="Moderator"
        hideRoleFilter
        totalLabel="kiểm duyệt viên"
      />
    </div>
  );
}
