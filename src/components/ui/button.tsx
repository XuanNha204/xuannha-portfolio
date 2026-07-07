import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm hover:bg-secondary hover:shadow-md hover:-translate-y-0.5",
        accent:
          "bg-accent text-white shadow-sm hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-border bg-surface text-primary hover:border-accent hover:text-accent hover:-translate-y-0.5",
        ghost: "text-secondary hover:bg-border/50 hover:text-primary",
        danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
