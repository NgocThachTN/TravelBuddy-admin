import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-primary-dark",
  iconBg = "bg-primary/10",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-md hover:border-border",
        className
      )}
    >
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                change.positive ? "text-success-dark" : "text-destructive"
              )}
            >
              <span>{change.positive ? "↑" : "↓"}</span>
              {change.value}
              <span className="text-muted-foreground">so với tháng trước</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </div>
  );
}
