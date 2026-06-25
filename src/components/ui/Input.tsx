import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label-md text-on-surface">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded px-3 py-2.5 text-body-sm bg-surface-low border border-border",
            "placeholder:text-text-secondary",
            "focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-label-sm text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label-md text-on-surface">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded px-3 py-2.5 text-body-sm bg-surface-low border border-border resize-y min-h-[96px]",
            "placeholder:text-text-secondary",
            "focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        />
        {error && <span className="text-label-sm text-error">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label-md text-on-surface">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded px-3 py-2.5 text-body-sm bg-surface-low border border-border",
            "focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-label-sm text-error">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
