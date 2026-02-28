import { LifeBuoy } from "lucide-react";
import styles from "./support.module.css";

export default function SupportPage() {
  return (
    <div className={styles.page}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Hỗ trợ khách hàng
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý danh mục và xử lý các ticket hỗ trợ từ người dùng
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <LifeBuoy className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-20">
        <LifeBuoy className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Tính năng đang được phát triển
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Hỗ trợ khách hàng sẽ sớm ra mắt
        </p>
      </div>
    </div>
  );
}
