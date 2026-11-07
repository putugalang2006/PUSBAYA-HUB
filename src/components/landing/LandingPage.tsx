"use client";

import { ArrowRight, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="relative flex h-[100svh] min-h-[540px] flex-col overflow-hidden">
      <div className="app-backdrop" />

      {/* Photography background with layered contrast for readable text */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-[center_48%]"
          style={{
            filter: "brightness(0.64) contrast(1.06) saturate(0.9)",
          }}
        />

        {/* Global darkening + vignette so gold and white text stay dominant */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,12,0.76)_0%,rgba(8,9,12,0.5)_26%,rgba(8,9,12,0.62)_60%,rgba(8,9,12,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_64%_58%_at_50%_45%,rgba(8,9,12,0.78)_0%,rgba(8,9,12,0.52)_48%,rgba(8,9,12,0.18)_72%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,12,0.62)_0%,transparent_26%,transparent_74%,rgba(8,9,12,0.62)_100%)]" />

        <div className="landing-float-a absolute -left-[18%] top-[6%] h-[58vmin] w-[58vmin] rounded-full bg-amber-500/10 blur-[90px]" />
        <div className="landing-float-b absolute -right-[12%] bottom-[2%] h-[66vmin] w-[66vmin] rounded-full bg-yellow-400/[0.08] blur-[100px]" />
        <div className="landing-sweep absolute -top-1/4 bottom-1/4 left-0 w-[32%] bg-gradient-to-r from-transparent via-amber-300/[0.06] to-transparent blur-2xl" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #facc15 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-3 hidden rounded-[28px] border border-white/[0.045] sm:inset-5 sm:block" />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-3 pt-2 text-center sm:px-8">
        <div className="relative animate-fade-up">
          <div className="absolute inset-0 animate-pulse-soft rounded-full bg-amber-400/20 blur-3xl" />
          <LogoMark size={112} className="relative drop-shadow-[0_8px_30px_rgba(234,179,8,0.35)]" />
        </div>

        <h1 className="mt-4 animate-fade-up [animation-delay:70ms] drop-shadow-[0_4px_28px_rgba(0,0,0,0.7)] sm:mt-5">
          <span className="gold-text block text-[clamp(2rem,10vw,4.5rem)] font-extrabold uppercase leading-[0.98] tracking-[0.06em]">
            Pusbaya Hub
          </span>
          <span className="mx-auto mt-3 block max-w-2xl text-balance text-[17px] font-medium leading-snug tracking-[0.01em] text-slate-50 sm:mt-4 sm:text-2xl lg:text-[27px]">
            Sistem Pendataan &amp; Administrasi{" "}
            <span className="text-amber-200">Terpadu Banjar</span>
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-balance text-xs leading-relaxed text-slate-200/85 drop-shadow-[0_2px_16px_rgba(0,0,0,0.65)] sm:text-sm">
          Pusat Pendataan Terpadu Anggota ST Putra Settu Bhakti Jaya, Banjar
          Campuan, Desa Adat Kerobokan.
        </p>

        <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-2.5 sm:mt-7 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onEnter}
            className="landing-cta landing-cta-primary w-full sm:w-auto sm:min-w-[224px]"
          >
            <span className="landing-cta-icon">
              <UserRound className="h-4 w-4" />
            </span>
            <span className="landing-cta-label">Masuk ke Sistem</span>
            <span className="landing-cta-trail">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="landing-cta landing-cta-secondary w-full sm:w-auto sm:min-w-[212px]"
          >
            <span className="landing-cta-icon">
              <UserPlus className="h-4 w-4" />
            </span>
            <span className="landing-cta-label">Registrasi / Login</span>
            <span className="landing-cta-trail">
              <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        <p className="mt-3 flex items-center justify-center gap-2 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-300/75 drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:text-[10px]">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Satu akun · Satu data anggota · KTA digital otomatis
        </p>
      </section>

      <footer className="relative z-10 shrink-0 border-t border-white/[0.08] bg-[#08090c]/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-5 py-3 sm:flex-row sm:px-8 sm:py-3.5">
          <p className="text-[9.5px] font-medium text-slate-400 sm:text-[10.5px]">
            Hak Cipta © 2026{" "}
            <span className="text-slate-200">PUSBAYA HUB</span>
          </p>
          <p className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.16em] text-slate-400 sm:text-[9.5px]">
            <ShieldCheck className="h-3 w-3 text-amber-400/80" />
            Banjar Campuan · Kerobokan
          </p>
        </div>
      </footer>
    </main>
  );
}
