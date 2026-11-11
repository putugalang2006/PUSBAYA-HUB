"use client";

import { ArrowRight, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";

const LANDING_MOTES = [
  { left: "7%", top: "76%", delay: "0s", duration: "13s", size: 3 },
  { left: "15%", top: "58%", delay: "2.4s", duration: "16s", size: 2 },
  { left: "24%", top: "82%", delay: "5.1s", duration: "14s", size: 4 },
  { left: "34%", top: "64%", delay: "1.2s", duration: "18s", size: 2 },
  { left: "45%", top: "86%", delay: "7.3s", duration: "15s", size: 3 },
  { left: "56%", top: "70%", delay: "3.6s", duration: "17s", size: 2 },
  { left: "66%", top: "80%", delay: "8.4s", duration: "14s", size: 4 },
  { left: "76%", top: "62%", delay: "4.8s", duration: "19s", size: 2 },
  { left: "86%", top: "78%", delay: "6.2s", duration: "13s", size: 3 },
  { left: "92%", top: "54%", delay: "9.1s", duration: "16s", size: 2 },
  { left: "29%", top: "42%", delay: "10.4s", duration: "18s", size: 2 },
  { left: "71%", top: "38%", delay: "11.8s", duration: "15s", size: 3 },
];

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <main className="relative flex min-h-[100svh] flex-col overflow-hidden bg-zinc-950">
      <div className="app-backdrop" />

      {/* Ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-12%] h-[64vmin] w-[64vmin] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -left-[12%] bottom-[-14%] h-[54vmin] w-[54vmin] rounded-full bg-yellow-600/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[18%] h-[48vmin] w-[48vmin] rounded-full bg-amber-400/[0.07] blur-[120px]" />

        <div className="absolute left-1/2 top-1/2 h-[145vmin] w-[145vmin] -translate-x-1/2 -translate-y-1/2">
          <div
            className="bg-aurora absolute inset-0 rounded-full blur-[100px]"
            style={{
              background:
                "conic-gradient(from 40deg, transparent 0deg, rgba(250,204,21,0.32) 58deg, transparent 148deg, transparent 218deg, rgba(255,255,255,0.11) 280deg, transparent 350deg)",
            }}
          />
        </div>

        <div className="landing-float-a absolute -left-[16%] top-[6%] h-[56vmin] w-[56vmin] rounded-full bg-amber-500/10 blur-[110px]" />
        <div className="landing-float-b absolute -right-[12%] bottom-[2%] h-[62vmin] w-[62vmin] rounded-full bg-yellow-400/[0.08] blur-[120px]" />
        <div className="landing-sweep absolute -top-1/4 bottom-1/4 left-0 w-[32%] bg-gradient-to-r from-transparent via-amber-300/[0.06] to-transparent blur-2xl" />

        {LANDING_MOTES.map((mote, index) => (
          <span
            key={index}
            className="landing-mote"
            style={{
              left: mote.left,
              top: mote.top,
              width: mote.size,
              height: mote.size,
              animationDelay: mote.delay,
              animationDuration: mote.duration,
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #facc15 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_26%,rgba(9,9,11,0.74)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-3 hidden rounded-[28px] border border-white/[0.045] sm:inset-5 sm:block" />

      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 py-8 text-center sm:px-8 sm:py-12">
        <div className="relative w-full max-w-3xl animate-fade-up overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-900/40 px-6 py-9 shadow-2xl shadow-amber-500/10 backdrop-blur-xl sm:px-12 sm:py-14">
          <div className="gold-line absolute inset-x-0 top-0 h-px" />
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-yellow-600/10 blur-[110px]" />

          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 animate-pulse-soft rounded-full bg-amber-400/20 blur-3xl" />
            <LogoMark
              size={104}
              className="relative drop-shadow-[0_10px_40px_rgba(234,179,8,0.4)]"
            />
          </div>

          <span className="relative mt-7 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Banjar Campuan · Desa Adat Kerobokan
          </span>

          <h1 className="relative mt-5">
            <span className="block bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-[clamp(2rem,9vw,4.25rem)] font-extrabold uppercase leading-[0.98] tracking-[0.06em] text-transparent">
              Pusbaya Hub
            </span>
            <span className="mx-auto mt-3 block max-w-2xl text-balance text-[17px] font-medium leading-snug tracking-[0.01em] text-zinc-100 sm:mt-4 sm:text-2xl lg:text-[27px]">
              Sistem Pendataan &amp; Administrasi{" "}
              <span className="text-amber-300">Sekaa Truna</span>
            </span>
          </h1>

          <p className="relative mx-auto mt-5 max-w-xl text-balance text-xs leading-relaxed text-zinc-400 sm:text-sm">
            Pusat Pendataan Terpadu Anggota ST Putra Settu Bhakti Jaya, Banjar
            Campuan, Desa Adat Kerobokan.
          </p>

          <div className="relative mt-8 flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row sm:items-center">
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
        </div>
      </section>

      <footer className="relative z-10 shrink-0 border-t border-white/[0.06] bg-zinc-950/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-5 py-3 sm:flex-row sm:px-8 sm:py-3.5">
          <p className="text-[9.5px] font-medium text-zinc-400 sm:text-[10.5px]">
            Hak Cipta © 2026{" "}
            <span className="text-zinc-200">PUSBAYA HUB</span>
          </p>
          <p className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.16em] text-zinc-400 sm:text-[9.5px]">
            <ShieldCheck className="h-3 w-3 text-amber-400/80" />
            Banjar Campuan · Kerobokan
          </p>
        </div>
      </footer>
    </main>
  );
}
