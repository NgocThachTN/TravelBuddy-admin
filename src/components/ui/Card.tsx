import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional card title rendered as h3 */
  title?: string;
  /** Optional description under the title */
  description?: string;
  /** Additional header content (right side) */
  headerAction?: React.ReactNode;
  /** Disable border */
  noBorder?: boolean;
}

export default function Card({
  title,
  description,
  headerAction,
  noBorder,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        !noBorder && "border border-border/60",
        className
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Sub-components ── */

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
