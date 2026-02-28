import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-dark active:scale-[0.98] shadow-[4px_8px_24px_0_rgba(252,210,64,0.20)] hover:shadow-[4px_12px_32px_0_rgba(252,210,64,0.30)]",
      secondary:
        "bg-transparent border-[1.5px] border-primary text-primary-dark hover:bg-primary-light active:border-primary-dark",
      destructive:
        "bg-destructive text-white hover:bg-destructive-dark active:bg-destructive-dark/90 shadow-sm",
      ghost:
        "bg-transparent hover:bg-muted active:bg-muted/80 text-foreground",
      outline:
        "bg-transparent border border-border text-foreground hover:bg-muted active:bg-muted/80",
    };

    const sizes: Record<string, string> = {
      sm: "h-8 px-3 text-xs rounded-lg",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
