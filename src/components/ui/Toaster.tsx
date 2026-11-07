"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const config = {
  success: {
    icon: CheckCircle2,
    accent: "text-emerald-400",
    ring: "border-emerald-400/20",
    bar: "bg-emerald-400",
  },
  error: {
    icon: AlertCircle,
    accent: "text-red-400",
    ring: "border-red-400/20",
    bar: "bg-red-400",
  },
  info: {
    icon: Info,
    accent: "text-amber-400",
    ring: "border-amber-400/20",
    bar: "bg-amber-400",
  },
} as const;

export function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
      {toasts.map((toast) => {
        const item = config[toast.type];
        const Icon = item.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              "glass animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border p-3.5 pr-3 shadow-2xl shadow-black/50",
              item.ring,
            )}
            role="status"
          >
            <span className={cn("mt-0.5", item.accent)}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
