"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  Menu,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PAGE_META } from "@/lib/constants";
import type { PageKey } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";

function useWitaClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!now) {
    return {
      date: "Memuat tanggal…",
      time: "--:--:--",
    };
  }

  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    date: `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`,
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
  };
}

export function Header({
  page,
  onOpenMobile,
}: {
  page: PageKey;
  onOpenMobile: () => void;
}) {
  const { online, refresh, refreshing, lastSyncedAt, auth } = useApp();
  const { date, time } = useWitaClock();
  const meta = PAGE_META[page];
  const isAdmin = auth?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-amber-400/[0.08] bg-[#08090c]/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#08090c]/88">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_-30%,rgba(234,179,8,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(234,179,8,0.025),transparent_45%)]" />
      </div>

      <div className="relative flex min-h-[78px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:min-h-[84px] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobile}
          className="icon-btn lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="hidden h-8 w-[2px] shrink-0 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-700 shadow-[0_0_12px_rgba(234,179,8,0.35)] sm:block" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-bold uppercase tracking-[0.26em] text-amber-400/90">
                  PUSBAYA HUB
                </span>
                <span className="hidden h-px w-5 bg-gradient-to-r from-amber-400/50 to-transparent sm:block" />
                <span className="hidden text-[8px] font-semibold uppercase tracking-[0.2em] text-slate-600 sm:block">
                  Portal Anggota
                </span>
              </div>
              <h1 className="mt-0.5 truncate text-[19px] font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-[22px]">
                {meta?.title ?? "Dashboard"}
              </h1>
            </div>
          </div>
          <p className="mt-0.5 truncate text-[9.5px] font-medium tracking-[0.01em] text-slate-500 sm:mt-1 sm:pl-[18px] sm:text-[10.5px]">
            {meta?.subtitle ?? "Sistem pendataan organisasi ST PUSBAYA"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] xl:inline-flex",
              online
                ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-400"
                : "border-red-400/20 bg-red-400/[0.07] text-red-400",
            )}
            title={online ? "Terhubung ke jaringan" : "Koneksi terputus"}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                online
                  ? "animate-pulse-soft bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]"
                  : "bg-red-400",
              )}
            />
            {online ? "Online" : "Offline"}
          </span>

          <div className="hidden items-center gap-2.5 rounded-xl border border-amber-400/10 bg-gradient-to-br from-white/[0.045] to-white/[0.012] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex">
            <Clock3 className="h-3.5 w-3.5 text-amber-400/80" />
            <div className="leading-tight">
              <p className="whitespace-nowrap text-[9px] font-medium text-slate-500">
                {date}
              </p>
              <p className="font-mono text-[11px] font-bold tracking-wide text-amber-300">
                {time}{" "}
                <span className="text-[8px] font-semibold text-amber-500/80">
                  WITA
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="group flex h-9 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-2.5 text-[11px] font-semibold text-slate-300 transition hover:border-amber-400/25 hover:bg-amber-400/[0.06] hover:text-amber-300 disabled:opacity-60 xl:px-3"
            title={
              lastSyncedAt
                ? `Terakhir disegarkan ${lastSyncedAt}`
                : "Segarkan data"
            }
          >
            <RefreshCw
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-500",
                refreshing && "animate-spin",
              )}
            />
            <span className="hidden xl:inline">
              {refreshing ? "Menyegarkan" : "Refresh Data"}
            </span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 xl:px-2 xl:py-1.5">
            <UserAvatar
              name={auth?.name ?? "Pengguna"}
              photo={auth?.photo}
              size={30}
              className="text-[9px]"
            />
            <div className="hidden min-w-0 leading-tight xl:block">
              <p className="max-w-[112px] truncate text-[10.5px] font-bold text-white">
                {auth?.name ?? "Pengguna"}
              </p>
              <p className="mt-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em] text-amber-400/70">
                {isAdmin ? "Administrator" : "Anggota"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 border-t border-white/[0.05] pt-2 md:hidden">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.1em]",
              online
                ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-400"
                : "border-red-400/20 bg-red-400/[0.07] text-red-400",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                online
                  ? "animate-pulse-soft bg-emerald-400"
                  : "bg-red-400",
              )}
            />
            {online ? "Online" : "Offline"}
          </span>
          <span className="hidden truncate text-[9px] font-medium text-slate-600 sm:block">
            {date}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
            <Clock3 className="h-3 w-3 text-amber-400/80" />
            <span className="font-mono font-semibold text-amber-300/90">
              {time}
            </span>
            <span className="text-[8.5px] font-semibold text-amber-500/70">
              WITA
            </span>
          </span>
        </div>
      </div>

      <div className="gold-line h-px w-full opacity-50" />
    </header>
  );
}
