"use client";

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  Trash2,
  UserRound,
  UserPlus,
  Wifi,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { APP_SUBTITLE } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fileToAvatarDataUrl } from "@/lib/image";
import { LogoLockup } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/ui/UserAvatar";

type UserMode = "login" | "register";

const LOGIN_MOTES = [
  { left: "6%", top: "72%", delay: "0s", duration: "14s", size: 3 },
  { left: "14%", top: "36%", delay: "3.2s", duration: "17s", size: 2 },
  { left: "26%", top: "84%", delay: "6.1s", duration: "15s", size: 3 },
  { left: "38%", top: "22%", delay: "1.8s", duration: "19s", size: 2 },
  { left: "49%", top: "78%", delay: "7.4s", duration: "16s", size: 2 },
  { left: "62%", top: "30%", delay: "4.6s", duration: "18s", size: 3 },
  { left: "74%", top: "86%", delay: "9.2s", duration: "15s", size: 2 },
  { left: "85%", top: "48%", delay: "5.5s", duration: "17s", size: 3 },
  { left: "93%", top: "74%", delay: "11.3s", duration: "14s", size: 2 },
];

export function LoginScreen({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  const { login, registerAccount } = useApp();
  const [role, setRole] = useState<Role>("PENGGUNA");
  const [mode, setMode] = useState<UserMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isRegister = role === "PENGGUNA" && mode === "register";

  const switchRole = (next: Role) => {
    setRole(next);
    setMode("login");
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const switchMode = (next: UserMode) => {
    setMode(next);
    setError("");
    setPassword("");
    setShowPassword(false);
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setPhoto(dataUrl);
      setPhotoName(file.name);
    } catch (photoError) {
      setError(
        photoError instanceof Error
          ? photoError.message
          : "Foto profil gagal diproses.",
      );
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);

    try {
      if (role === "ADMIN") {
        const result = await login(username, "ADMIN", password);
        if (!result.ok) {
          setError(result.error ?? "Username atau Password Admin salah!");
          return;
        }
        onSuccess();
        return;
      }

      if (mode === "register") {
        if (username.trim().length < 3) {
          setError("Username minimal 3 karakter.");
          return;
        }
        if (password.length < 6) {
          setError("Password minimal 6 karakter.");
          return;
        }
        const result = await registerAccount({
          username,
          password,
          photo: photo || undefined,
          photoName: photoName || undefined,
        });
        if (!result.ok) {
          setError(result.error ?? "Registrasi gagal. Coba lagi.");
          return;
        }
        onSuccess();
        return;
      }

      const result = await login(username, "PENGGUNA", password);
      if (!result.ok) {
        setError(result.error ?? "Username atau password salah.");
        return;
      }
      onSuccess();
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : JSON.stringify(error) || String(error);
      const message = detail.startsWith("Gagal upload foto:")
        ? detail
        : `Koneksi Gagal: ${detail}`;
      setError(message);
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const cardTitle =
    role === "ADMIN"
      ? "Masuk sebagai Admin"
      : mode === "register"
        ? "Daftar Akun Baru"
        : "Masuk sebagai Pengguna";

  const cardDescription =
    role === "ADMIN"
      ? "Gunakan kredensial khusus pengurus untuk akses penuh."
      : mode === "register"
        ? "Buat akun pengguna untuk mengakses dashboard PUSBAYA HUB."
        : "Masuk dengan username dan password akun Anda.";

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="app-backdrop" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[58%] top-[44%] h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 sm:h-[130vmin] sm:w-[130vmin]">
          <div
            className="bg-aurora absolute inset-0 rounded-full blur-[80px] sm:blur-[100px]"
            style={{
              background:
                "conic-gradient(from 210deg, transparent 0deg, rgba(250,204,21,0.32) 54deg, transparent 142deg, transparent 212deg, rgba(255,255,255,0.11) 272deg, transparent 350deg)",
            }}
          />
        </div>

        <div className="landing-float-a absolute -left-36 top-10 h-[460px] w-[460px] rounded-full bg-amber-500/[0.055] blur-[100px]" />
        <div className="landing-float-b absolute -right-40 bottom-0 h-[520px] w-[520px] rounded-full bg-yellow-600/[0.045] blur-[110px]" />

        <div className="absolute left-[4%] top-1/2 hidden w-[min(58vw,620px)] -translate-y-1/2 lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-stt.png"
            alt=""
            aria-hidden="true"
            className="login-watermark w-full max-w-none blur-[42px] saturate-150"
          />
        </div>
        <div className="login-orbit absolute left-[10%] top-1/2 hidden h-[560px] w-[560px] rounded-full border border-white/[0.035] border-t-amber-400/20 lg:block" />
        <div className="login-orbit-reverse absolute left-[16%] top-1/2 hidden h-[400px] w-[400px] rounded-full border border-white/[0.03] border-b-amber-400/15 lg:block" />

        <div className="landing-sweep absolute -top-1/4 bottom-1/4 left-0 w-[38%] bg-gradient-to-r from-transparent via-amber-300/[0.05] to-transparent blur-2xl" />

        {LOGIN_MOTES.map((mote, index) => (
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

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_28%,rgba(7,8,11,0.52)_100%)]" />
      </div>

      <div className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-5 pt-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11px] font-semibold text-slate-400 transition hover:border-amber-400/30 hover:bg-amber-400/[0.06] hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Beranda
        </button>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-6 pt-4 sm:px-8 lg:justify-center lg:py-8">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          {/* Branding column */}
          <section className="animate-fade-up hidden flex-col lg:flex">
            <LogoLockup size={48} />

            <div className="mt-12 max-w-xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Banjar Campuan · Desa Adat Kerobokan
              </p>
              <h1 className="text-balance text-[44px] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
                Satu data untuk{" "}
                <span className="gold-text">generasi PUSBAYA</span> yang
                terhubung.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
                Pusat pendataan terpadu anggota ST Putra Settu Bhakti Jaya.
                Buat akun, kelola anggota, absensi sangkep, hingga kartu tanda
                anggota digital dalam satu dashboard.
              </p>
            </div>
          </section>

          {/* Auth column */}
          <section className="animate-fade-up mx-auto w-full max-w-[430px] [animation-delay:120ms]">
            <div className="mb-7 flex flex-col items-center text-center lg:hidden">
              <LogoLockup size={44} />
              <p className="mt-4 max-w-xs text-[10px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-slate-500">
                {APP_SUBTITLE}
              </p>
            </div>

            <div className="panel overflow-hidden">
              <div className="gold-line h-px w-full" />
              <div className="p-4 sm:p-8">
                <div className="mb-5">
                  <h2 className="text-xl font-extrabold tracking-tight text-white">
                    {cardTitle}
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                    {cardDescription}
                  </p>
                </div>

                <div
                  className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-white/[0.07] bg-black/30 p-1"
                  role="tablist"
                  aria-label="Pilih role login"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={role === "PENGGUNA"}
                    onClick={() => switchRole("PENGGUNA")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200",
                      role === "PENGGUNA"
                        ? "bg-gradient-to-b from-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    Pengguna
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={role === "ADMIN"}
                    onClick={() => switchRole("ADMIN")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200",
                      role === "ADMIN"
                        ? "bg-gradient-to-b from-amber-300 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="login-username" className="label">
                      {role === "ADMIN" ? "Username Admin" : "Username"}
                    </label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder={
                          role === "ADMIN"
                            ? "Masukkan username admin"
                            : "Pilih username Anda"
                        }
                        className="field pl-10"
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        maxLength={24}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="login-password" className="label">
                      Password
                    </label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder={
                          isRegister
                            ? "Minimal 6 karakter"
                            : "Masukkan password"
                        }
                        className="field pl-10 pr-11"
                        autoComplete={
                          isRegister ? "new-password" : "current-password"
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                        aria-label={
                          showPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {isRegister && (
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        Password wajib terdiri dari minimal 6 karakter.
                      </p>
                    )}
                  </div>

                  {isRegister && (
                    <div className="animate-fade-in">
                      <span className="label">Foto Profil (Opsional)</span>
                      <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                        <UserAvatar
                          name={username || "Pengguna"}
                          photo={photo || undefined}
                          size={54}
                          className="text-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              disabled={photoBusy}
                              className="btn btn-outline btn-sm"
                            >
                              <ImagePlus className="h-3.5 w-3.5" />
                              {photoBusy
                                ? "Memproses…"
                                : photo
                                  ? "Ganti Foto"
                                  : "Upload Foto"}
                            </button>
                            {photo && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoto("");
                                  setPhotoName("");
                                }}
                                className="btn btn-ghost btn-sm text-red-400/80 hover:text-red-300"
                              >
                                <Trash2 className="h-3 w-3" />
                                Hapus
                              </button>
                            )}
                          </div>
                          <p className="mt-1.5 text-[9.5px] leading-relaxed text-slate-500">
                            JPG/PNG/WEBP · otomatis dipotong persegi. Tanpa
                            foto, avatar memakai inisial username.
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          handlePhoto(event.target.files?.[0])
                        }
                      />
                    </div>
                  )}

                  {error && (
                    <div
                      className="animate-fade-in rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-[12px] font-medium text-red-300"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || photoBusy}
                    aria-busy={submitting}
                    className="btn btn-gold group mt-1 w-full py-3 text-[13px] disabled:cursor-wait disabled:opacity-75"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                        {isRegister ? "Menyimpan ke Supabase…" : "Memverifikasi…"}
                      </>
                    ) : role === "ADMIN" ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Masuk ke Dashboard
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    ) : isRegister ? (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Daftar Akun Baru
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4" />
                        Masuk ke Dashboard
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                {role === "PENGGUNA" && (
                  <div className="mt-5 border-t border-white/[0.06] pt-4 text-center">
                    <p className="text-[11.5px] text-slate-500">
                      {isRegister ? (
                        <>
                          Sudah memiliki akun?{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("login")}
                            className="font-bold text-amber-400 transition hover:text-amber-300"
                          >
                            Masuk di sini
                          </button>
                        </>
                      ) : (
                        <>
                          Belum memiliki akun?{" "}
                          <button
                            type="button"
                            onClick={() => switchMode("register")}
                            className="font-bold text-amber-400 transition hover:text-amber-300"
                          >
                            Daftar di sini
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2">
                  <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-[10.5px] text-slate-500">
                    Akun & data tersimpan aman di Supabase
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-slate-600">
              © 2026 ST PUSBAYA · Banjar Campuan
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
