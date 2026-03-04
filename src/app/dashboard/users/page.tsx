import UserTable from "./components/UserTable";
import CreateModeratorButton from "./components/CreateModeratorButton";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản, vai trò và quyền truy cập
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CreateModeratorButton />
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary-dark" />
          </div>
        </div>
      </div>

      <UserTable />
    </div>
  );
}
