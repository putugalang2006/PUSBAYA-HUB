"use client";

import {
  CalendarCheck,
  ChevronRight,
  Home,
  IdCard,
  Lock,
  LogOut,
  Send,
  Users,
  X,
} from "lucide-react";
import type { PageKey } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";import { useApp } from "@/context/AppContext";
import { LogoLockup } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EditProfileButton } from "@/components/profile/EditProfileButton";

const ICONS = {
  dashboard: Home,
  members: Users,
  attendance: CalendarCheck,
  blast: Send,
  kta: IdCard,
} as const;

export function Sidebar({
  activePage,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { auth, logout } = useApp();
  const isAdmin = auth?.role === "ADMIN";

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-6 pt-5">
        <LogoLockup size={38} />
        <button
          type="button"
          onClick={onCloseMobile}
          className="icon-btn lg:hidden"
          aria-label="Tutup menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3.5">
        <div className="panel-soft relative overflow-hidden rounded-xl p-3">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <UserAvatar
              name={auth?.name ?? "Pengguna"}
              photo={auth?.photo}
              size={40}
              className="text-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-white">
                {auth?.name ?? "Pengguna"}
              </p>
              <span
                className={cn(
                  "badge mt-1.5",
                  isAdmin ? "badge-gold" : "badge-slate",
                )}
              >
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    isAdmin ? "bg-amber-400" : "bg-slate-400",
                  )}
                />
                {auth?.role ?? "PENGGUNA"}
              </span>
            </div>
          </div>
          <EditProfileButton
            variant="outline"
            compact
            label="Edit Profil"
            className="relative mt-3 w-full justify-center"
          />
        </div>
      </div>

      <nav className="mt-6 flex-1 overflow-y-auto px-3.5 pb-4" aria-label="Navigasi utama">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.key];
            const isActive = activePage === item.key;
            const isLocked = item.key === "blast" && !isAdmin;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(item.key as PageKey);
                    onCloseMobile();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-semibold transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-amber-400/[0.14] to-amber-400/[0.03] text-amber-300 shadow-[inset_0_0_0_1px_rgba(234,179,8,0.16)]"
                      : "text-slate-400 hover:bg-white/[0.035] hover:text-slate-100",
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-r-full bg-amber-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                  )}
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      isActive
                        ? "border-amber-400/25 bg-amber-400/10 text-amber-400"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500 group-hover:text-slate-300",
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isLocked ? (
                    <Lock className="h-3.5 w-3.5 text-slate-600" />
                  ) : (
                    isActive && (
                      <ChevronRight className="h-3.5 w-3.5 text-amber-400/70" />
                    )
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/[0.06] p-3.5">
        <div className="mb-3 flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            Status Sesi
          </span>
          <span className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            Aktif
          </span>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2.5 text-[12.5px] font-semibold text-red-400/90 transition-all hover:border-red-400/25 hover:bg-red-400/[0.09] hover:text-red-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/15 bg-red-400/[0.06]">
            <LogOut className="h-4 w-4" />
          </span>
          Logout
        </button>
        <p className="mt-3 text-center text-[9px] font-medium uppercase tracking-[0.14em] text-slate-700">
          PUSBAYA HUB · v1.0 · 2026
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-white/[0.055] bg-[#0a0b0f]/80 backdrop-blur-xl lg:block">
        {content}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onCloseMobile}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-full w-[280px] border-r border-white/[0.07] bg-[#0a0b0f] shadow-2xl shadow-black transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {content}
        </aside>
      </div>
    </>
  );
}
