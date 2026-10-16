import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Skeleton({ className, asChild = false, ...props }: SkeletonProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-lg bg-slate-200/80 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
