import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none rounded-lg border border-border bg-surface px-3.5 pr-9 py-2 text-sm text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
