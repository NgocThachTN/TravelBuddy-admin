import { Package } from "lucide-react";
import styles from "./subscriptions.module.css";

export default function SubscriptionsPage() {
  return (
    <div className={styles.page}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Gói đăng ký Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các gói đăng ký và thanh toán Planner
          </p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Package className="h-5 w-5 text-primary-dark" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-20">
        <Package className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Tính năng đang được phát triển
        </p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Quản lý gói đăng ký sẽ sớm ra mắt
        </p>
      </div>
    </div>
  );
}
