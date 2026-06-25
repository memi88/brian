import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "pending" | "done" | "neutral";
}

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-semibold",
        variant === "default" && "bg-secondary text-on-surface",
        variant === "pending" && "bg-tertiary/20 text-tertiary",
        variant === "done" && "bg-primary/15 text-primary-dark",
        variant === "neutral" && "bg-surface-container text-text-secondary",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
