"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { cn } from "@/lib/utils";

const DURATION = 2400;

export function LoginSuccessScreen({ onDone }: { onDone: () => void }) {
  const { auth } = useApp();
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDoneRef.current();
  }, []);

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const value = Math.min(100, ((now - start) / DURATION) * 100);
      setProgress(value);
      if (value < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        timer = window.setTimeout(finish, 300);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [finish]);

  const isAdmin = auth?.role === "ADMIN";
  const displayName = auth?.name ?? "Pengguna PUSBAYA";
  const roleLabel = isAdmin ? "Administrator Utama" : "Pengguna ST PUSBAYA";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <div className="app-backdrop" />
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.09] blur-3xl" />
      </div>

      <section className="animate-scale-in relative z-10 w-full max-w-md">
        <div className="panel overflow-hidden rounded-2xl border-amber-400/20 shadow-[0_0_80px_-24px_rgba(234,179,8,0.55)]">
          <div className="gold-line h-px w-full" />

          <div className="p-4 text-center sm:p-8">
            <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-1 rounded-full bg-amber-400/20 blur-2xl animate-pulse-soft" />
              <span className="success-ring absolute inset-0 rounded-full border border-amber-400/25" />
              <span className="success-pop relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-300/20 via-amber-400/10 to-yellow-600/5 shadow-[0_0_42px_rgba(234,179,8,0.35)]">
                <svg
                  viewBox="0 0 52 52"
                  fill="none"
                  aria-hidden="true"
                  className="h-10 w-10"
                >
                  <path
                    d="M14 27.5 22.5 36 38 18.5"
                    className="success-check"
                    stroke="#facc15"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.24em] text-amber-400/80">
              Autentikasi Berhasil
            </p>

            <h1 className="text-balance mt-2 text-xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-2xl">
              Selamat Datang Kembali,
              <br />
              <span className="gold-text">{displayName}</span>!
            </h1>

            <span
              className={cn(
                "badge mt-3 px-3 py-1",
                isAdmin
                  ? "badge-gold"
                  : "border-sky-400/30 bg-sky-400/10 text-sky-300",
              )}
            >
              {isAdmin ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <UserRound className="h-3 w-3" />
              )}
              {roleLabel}
            </span>

            <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-slate-400 sm:text-[13px]">
              Autentikasi berhasil. Memuat data dan mengalihkan Anda ke
              Dashboard PUSBAYA HUB...
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Sparkles className="h-3 w-3 text-amber-400/80" />
                  Menyiapkan dashboard
                </span>
                <span className="font-mono text-amber-300">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_14px_rgba(234,179,8,0.55)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={finish}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-amber-300/80 transition hover:bg-amber-400/[0.06] hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
            >
              Lanjut ke Dashboard Sekarang
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="border-t border-white/[0.06] bg-black/20 px-6 py-3">
            <p className="flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-600">
              <ShieldCheck className="h-3 w-3 text-emerald-400/80" />
              Sesi aman · data tersimpan lokal
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
