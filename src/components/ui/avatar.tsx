import * as React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  initials?: string;
  size?: "sm" | "default" | "lg";
  showStatus?: boolean;
}

export function getInitials(name?: string): string {
  if (!name) return "CU";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];
  if (first && second) {
    return `${first}${second}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "CU";
}

export function Avatar({
  name,
  initials,
  size = "default",
  showStatus = false,
  className,
  ...props
}: AvatarProps) {
  const displayInitials = initials ?? getInitials(name);
  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    default: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 font-bold text-white shadow-inner ring-2 ring-white/10 select-none",
          sizeClasses,
          className,
        )}
        title={name}
        aria-label={name ? `Avatar de ${name}` : "Avatar de usuario"}
        {...props}
      >
        {displayInitials}
      </div>
      {showStatus && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0f2747]" />
      )}
    </div>
  );
}
