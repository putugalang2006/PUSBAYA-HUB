"use client";

import { useRef, useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldAlert } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { PageKey } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { DashboardView } from "@/components/views/DashboardView";
import { MembersView } from "@/components/views/MembersView";
import { AttendanceView } from "@/components/views/AttendanceView";
import { BlastView } from "@/components/views/BlastView";
import { KtaView } from "@/components/views/KtaView";

export function AppShell() {
  const { auth } = useApp();
  const [page, setPage] = useState<PageKey>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const isAdmin = auth?.role === "ADMIN";

  const navigate = (next: PageKey) => {
    setPage(next);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isLocked = page === "blast" && !isAdmin;

  return (
    <div className="relative min-h-screen">
      <div className="app-backdrop" />

      <div className="relative z-10 flex h-dvh overflow-hidden">
        <Sidebar
          activePage={page}
          onNavigate={navigate}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
          <Header page={page} onOpenMobile={() => setMobileOpen(true)} />

          <main
            ref={mainRef}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <div className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
              <div className="mx-auto w-full max-w-[1440px]">
                <div key={page} className="animate-fade-in">
                  {isLocked ? (
                    <AccessDenied onBack={() => navigate("dashboard")} />
                  ) : page === "dashboard" ? (
                    <DashboardView onNavigate={navigate} />
                  ) : page === "members" ? (
                    <MembersView onNavigate={navigate} />
                  ) : page === "attendance" ? (
                    <AttendanceView onNavigate={navigate} />
                  ) : page === "blast" ? (
                    <BlastView />
                  ) : (
                    <KtaView onNavigate={navigate} />
                  )}
                </div>
              </div>
            </div>

            <footer className="mt-auto border-t border-white/[0.05] px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-1.5 text-center sm:flex-row sm:text-left">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                  PUSBAYA HUB · Sistem Pendataan Organisasi
                </p>
                <p className="text-[9px] font-medium text-slate-700">
                  ST Putra Settu Bhakti Jaya · Banjar Campuan ·{" "}
                  {new Date().getFullYear()}
                </p>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

function AccessDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="panel animate-fade-up flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-red-400/10 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.07] text-red-400">
          <ShieldAlert className="h-7 w-7" strokeWidth={1.6} />
        </div>
      </div>
      <span className="badge badge-red mt-5">
        <LockKeyhole className="h-2.5 w-2.5" />
        Akses Terbatas
      </span>
      <h2 className="mt-3 text-lg font-extrabold text-white">
        Halaman khusus Admin
      </h2>
      <p className="text-balance mt-2 max-w-md text-[12.5px] leading-relaxed text-slate-400">
        Modul WA Blast hanya dapat diakses oleh pengurus dengan role ADMIN.
        Silakan hubungi admin organisasi jika Anda memerlukan akses.
      </p>
      <button type="button" onClick={onBack} className="btn btn-gold mt-6">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </button>
    </div>
  );
}
