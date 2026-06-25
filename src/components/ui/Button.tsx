import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outlined" | "ghost" | "danger";
  size?: "sm" | "md";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          size === "md" && "px-5 py-2.5 text-body-sm",
          size === "sm" && "px-3 py-1.5 text-label-sm",
          variant === "primary" && "bg-primary text-white hover:bg-primary-dark",
          variant === "secondary" && "bg-secondary text-on-surface hover:bg-primary-light",
          variant === "outlined" && "border border-border text-on-surface hover:bg-surface-container",
          variant === "ghost" && "text-on-surface-variant hover:bg-surface-container",
          variant === "danger" && "bg-error-container text-error hover:bg-error hover:text-white",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
