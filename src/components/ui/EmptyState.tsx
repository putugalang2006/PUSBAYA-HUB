import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 text-center",
        compact ? "py-10" : "py-16",
        className,
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-2xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-gradient-to-b from-amber-400/10 to-transparent text-amber-400">
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </div>
      </div>
      <h3 className="mt-4 text-sm font-bold text-white sm:text-base">{title}</h3>
      <p className="text-balance mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400 sm:text-[13px]">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
