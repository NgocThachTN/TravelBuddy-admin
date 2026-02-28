import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "destructive" | "warning" | "info" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary-light text-primary-dark",
  success: "bg-success-light text-success-dark",
  destructive: "bg-destructive-light text-destructive",
  warning: "bg-warning-light text-amber-700",
  info: "bg-info-light text-info",
  outline: "border border-border text-muted-foreground bg-transparent",
};

export default function Badge({
  variant = "default",
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
