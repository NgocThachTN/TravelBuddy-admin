import UserTable from "./components/UserTable";
import { Users } from "lucide-react";
import styles from "./users.module.css";

export default function UsersPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản, vai trò và quyền truy cập
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Users className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <UserTable />
    </div>
  );
}
