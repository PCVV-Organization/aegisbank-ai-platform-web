import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[var(--primary)] text-white shadow-2xs",
        secondary:
          "border border-[var(--secondary-border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        success:
          "border border-[var(--financial-positive-border)] bg-[var(--financial-positive-bg)] text-[var(--financial-positive-fg)] shadow-2xs",
        warning:
          "border border-[var(--financial-pending-border)] bg-[var(--financial-pending-bg)] text-[var(--financial-pending-fg)] shadow-2xs",
        destructive:
          "border border-[var(--financial-critical-border)] bg-[var(--financial-critical-bg)] text-[var(--financial-critical-fg)] shadow-2xs",
        outline: "border border-slate-300 text-slate-700",
        sidebarOnline:
          "border border-emerald-400/20 bg-emerald-400/15 text-emerald-200",
        ai: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold uppercase tracking-wider text-[10px] shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
