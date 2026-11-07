"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { LandingPage } from "@/components/landing/LandingPage";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { LoginSuccessScreen } from "@/components/auth/LoginSuccessScreen";
import { AppShell } from "@/components/layout/AppShell";
import { LogoMark } from "@/components/ui/Logo";

export default function HomePage() {
  const { auth, hydrated } = useApp();
  const [showAuth, setShowAuth] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (auth) {
      setShowAuth(false);
    } else {
      setShowSuccess(false);
    }
  }, [auth]);

  if (!hydrated) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="app-backdrop" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-2xl" />
            <LogoMark size={88} className="animate-float relative" />
          </div>
          <p className="mt-5 text-sm font-extrabold uppercase tracking-[0.22em] text-white">
            Pusbaya <span className="gold-text">Hub</span>
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-1 w-1 animate-pulse rounded-full bg-amber-400" />
            <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Menyiapkan dashboard
            </p>
          </div>
          <div className="mt-5 h-0.5 w-36 overflow-hidden rounded-full bg-white/10">
            <div className="skeleton h-full w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!auth) {
    return showAuth ? (
      <LoginScreen
        onBack={() => setShowAuth(false)}
        onSuccess={() => setShowSuccess(true)}
      />
    ) : (
      <LandingPage onEnter={() => setShowAuth(true)} />
    );
  }

  if (showSuccess) {
    return <LoginSuccessScreen onDone={() => setShowSuccess(false)} />;
  }

  return <AppShell />;
}
