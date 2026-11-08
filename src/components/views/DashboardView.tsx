"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Crown,
  IdCard,
  MapPin,
  MapPinned,
  Phone,
  PhoneCall,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { ST_NAME, TEMPEKAN_LIST } from "@/lib/constants";
import { cn, formatDateShort, formatNumber, percent } from "@/lib/utils";
import { MemberForm } from "@/components/members/MemberForm";
import { LogoMark } from "@/components/ui/Logo";
import type { Member, PageKey } from "@/lib/types";

export function DashboardView({
  onNavigate,
}: {
  onNavigate: (page: PageKey) => void;
}) {
  const {
    members,
    addMember,
    auth,
    pushToast,
    registeredMember,
    isRegistered,
  } = useApp();
  const isAdmin = auth?.role === "ADMIN";

  const stats = useMemo(() => {
    const counts = TEMPEKAN_LIST.map((tempekan) => ({
      tempekan,
      count: members.filter((member) => member.tempekan === tempekan).length,
    }));
    const top = [...counts].sort((a, b) => b.count - a.count)[0];
    const contacts = members.filter(
      (member) => member.whatsapp.replace(/\D/g, "").length >= 9,
    ).length;
    return {
      counts,
      contacts,
      top,
      topLabel: top && top.count > 0 ? top.tempekan : "Belum tersedia",
    };
  }, [members]);

  const needsRegistration = !isAdmin && !isRegistered;
  const showDashboardContent = !isAdmin || members.length > 0;

  if (needsRegistration) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <section className="panel animate-fade-up relative overflow-hidden p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-400/[0.08] blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-yellow-600/[0.05] blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-400">
                <UserPlus className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <span className="badge badge-gold">Registrasi Wajib</span>
                <h2 className="mt-2 text-balance text-xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-2xl">
                  Lengkapi data anggota Anda terlebih dahulu
                </h2>
                <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400 sm:text-[13px]">
                  Halo{" "}
                  <span className="font-semibold text-slate-200">
                    {auth?.name ?? "Pengguna"}
                  </span>
                  , isi formulir di bawah ini untuk mengaktifkan dashboard dan
                  KTA digital Anda.
                </p>
              </div>
            </div>

            <div className="mt-4 hidden grid-cols-1 gap-2 sm:grid sm:grid-cols-3">
              {[
                { icon: UserRound, title: "Data diri", desc: "Identitas & kontak" },
                { icon: IdCard, title: "KTA otomatis", desc: "Terbit setelah disimpan" },
                { icon: BadgeCheck, title: "Akses dashboard", desc: "Modul langsung terbuka" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.07] text-amber-400/90">
                    <item.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-200">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[8.5px] text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-400/[0.12] bg-black/25 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-amber-400/80">
                    Formulir Registrasi
                  </p>
                  <h3 className="mt-0.5 text-[14px] font-bold text-white">
                    Data Anggota Baru
                  </h3>
                </div>
                <span className="badge badge-gold">1 akun · 1 anggota</span>
              </div>

              <MemberForm
                compact
                submitLabel="Daftarkan Saya"
                onSubmit={async (input) => {
                  const created = await addMember(input);
                  if (!created) return false;
                  pushToast(
                    "success",
                    "Registrasi Berhasil!",
                    "KTA Digital Anda telah terbit.",
                  );
                  return true;
                }}
              />
            </div>

            <p className="mt-4 rounded-lg border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2.5 text-[10px] leading-relaxed text-amber-200/60">
              Pastikan data sudah benar. Setelah tersimpan, dashboard lengkap
              dan KTA digital akan otomatis terbuka.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {isAdmin && (
        <section className="panel animate-fade-up relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-400/[0.08] blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-yellow-600/[0.05] blur-3xl" />
          </div>

          <div className="relative grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                  <UserPlus className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-amber-400/80">
                    Registrasi Anggota
                  </p>
                  <h2 className="mt-0.5 text-[17px] font-bold text-white">
                    Registrasi Anggota Baru
                  </h2>
                </div>
              </div>
              <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-slate-400">
                Isi formulir registrasi berikut. Data akan langsung tersimpan
                dan tersinkron ke dashboard, absensi, serta KTA digital.
              </p>
              <p className="mt-3 hidden rounded-lg border border-amber-400/10 bg-amber-400/[0.04] px-3 py-2.5 text-[10px] leading-relaxed text-amber-200/60 lg:block">
                Formulir ini selalu berada di bagian paling atas dashboard agar
                registrasi anggota baru lebih cepat dilakukan.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/[0.12] bg-black/25 p-4 sm:p-5">
              <MemberForm
                submitLabel="Daftarkan Anggota"
                onSubmit={async (input) => {
                  const created = await addMember(input);
                  if (!created) return false;
                  pushToast(
                    "success",
                    "Anggota berhasil didaftarkan",
                    `${created.nama} · ${created.id} · ${created.tempekan}`,
                  );
                  return true;
                }}
              />
            </div>
          </div>
        </section>
      )}

      {showDashboardContent && (
        <>
          {/* Hero */}
          <section className="panel animate-fade-up relative overflow-hidden p-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/[0.09] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-yellow-600/[0.06] blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #facc15 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-balance text-2xl font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[30px]">
              Pusat Pendataan Terpadu Anggota{" "}
              <span className="gold-text">ST Putra Settu Bhakti Jaya</span>
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-slate-400">
              {ST_NAME}. Kelola data anggota, presensi sangkep, dan identitas
              digital dalam satu platform yang rapi dan transparan.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate("members")}
                className="btn btn-gold group"
              >
                <Users className="h-4 w-4" />
                LIHAT SEMUA ANGGOTA
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate("attendance")}
                className="btn btn-outline"
              >
                Absensi Sangkep
              </button>
            </div>
          </div>

          <div className="relative flex shrink-0 items-center gap-5 self-start rounded-2xl border border-white/[0.07] bg-black/20 px-5 py-4 backdrop-blur-sm lg:self-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl" />
              <LogoMark size={64} className="animate-float relative" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Anggota Terdaftar
              </p>
              <p className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                {formatNumber(members.length)}
                <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400/80">
                  Orang
                </span>
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Data realtime · Banjar Campuan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <KpiCard
          icon={Users}
          label="Total Anggota"
          value={formatNumber(members.length)}
          suffix="Anggota"
          hint="Terdaftar dalam sistem"
          delay="60ms"
        />
        <KpiCard
          icon={PhoneCall}
          label="Kontak Terdaftar"
          value={formatNumber(stats.contacts)}
          suffix="WhatsApp"
          hint="Nomor aktif terhubung"
          delay="120ms"
        />
        <KpiCard
          icon={Crown}
          label="Tempekan Terpadat"
          value={stats.top?.count ? String(stats.top.count) : "—"}
          suffix={stats.top?.count ? "Anggota" : "Belum ada"}
          hint={
            stats.topLabel === "Belum tersedia"
              ? "Tambahkan anggota pertama"
              : stats.topLabel
          }
          delay="180ms"
        />
      </section>

      <div
        className={cn(
          "grid grid-cols-1 gap-5",
          !isAdmin && "xl:grid-cols-[0.9fr_1.1fr]",
        )}
      >
        {/* Membership status */}
        {!isAdmin && isRegistered && registeredMember && (
          <section
            className="panel animate-fade-up p-5 sm:p-6"
            style={{ animationDelay: "140ms" }}
          >
            <RegisteredMemberCard
              member={registeredMember}
              onNavigate={onNavigate}
            />
          </section>
        )}

        {/* Distribution */}
        <section
          className="panel animate-fade-up p-5 sm:p-6"
          style={{ animationDelay: "200ms" }}
        >
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-white">
                Distribusi Anggota Per Tempekan
              </h3>
              <p className="mt-0.5 text-[11.5px] text-slate-400">
                Persentase sebaran anggota dari {members.length} data terdaftar.
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-400">
              <MapPinned className="h-5 w-5" />
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {stats.counts.map((item, index) => {
              const pct = percent(item.count, members.length);
              return (
                <div
                  key={item.tempekan}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-amber-400/20 hover:bg-amber-400/[0.03]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.07] text-amber-400/90">
                        <Building2 className="h-3.5 w-3.5" />
                      </span>
                      <p className="text-[11.5px] font-semibold leading-tight text-slate-300">
                        {item.tempekan}
                      </p>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-300">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2.5">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="min-w-[42px] text-right text-[10px] font-medium text-slate-500">
                      {item.count} org
                    </span>
                  </div>
                  <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Wilayah {String(index + 1).padStart(2, "0")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-white/[0.08] bg-black/20 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Terdata
                </p>
                <p className="text-[12px] font-semibold text-slate-200">
                  {formatNumber(members.length)} anggota ·{" "}
                  {formatNumber(stats.contacts)} kontak
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("members")}
              className="text-[10px] font-bold uppercase tracking-wider text-amber-400 transition hover:text-amber-300"
            >
              Kelola →
            </button>
          </div>
        </section>
      </div>
        </>
      )}
    </div>
  );
}

function RegisteredMemberCard({
  member,
  onNavigate,
}: {
  member: Member;
  onNavigate: (page: PageKey) => void;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-white">
              Status Keanggotaan
            </h3>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-400">
              Akun Anda sudah terhubung dengan data anggota.
            </p>
          </div>
        </div>
        <span className="badge badge-green hidden shrink-0 sm:inline-flex">
          <CheckCircle2 className="h-3 w-3" />
          Terverifikasi
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4">
        <p className="flex items-start gap-2 text-[12px] font-bold leading-snug text-emerald-300">
          <span aria-hidden="true">✅</span>
          Terdaftar sebagai Anggota ST PUSBAYA
        </p>
        <p className="mt-1.5 pl-5 font-mono text-[10px] text-emerald-200/50">
          {member.id} · Terdaftar{" "}
          {formatDateShort(member.createdAt.slice(0, 10))}
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <SummaryRow icon={UserRound} label="Nama Lengkap" value={member.nama} />
        <SummaryRow icon={Phone} label="Nomor WhatsApp" value={member.whatsapp} mono />
        <SummaryRow
          icon={MapPin}
          label="Alamat"
          value={member.alamat}
          className="sm:col-span-2"
        />
        <SummaryRow
          icon={Building2}
          label="Wilayah Tempekan"
          value={member.tempekan}
          className="sm:col-span-2"
        />
      </div>

      <button
        type="button"
        onClick={() => onNavigate("kta")}
        className="btn btn-gold group mt-5 w-full"
      >
        <IdCard className="h-4 w-4" />
        Lihat KTA Digital Saya
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      <p className="mt-3 text-center text-[9.5px] leading-relaxed text-slate-500">
        Satu akun hanya dapat mendaftarkan satu data anggota. Hubungi admin
        jika data perlu diperbaiki.
      </p>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  mono = false,
  className,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5",
        className,
      )}
    >
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.07] text-amber-400/90">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 break-words text-[11.5px] font-semibold leading-relaxed text-slate-200",
            mono && "font-mono text-[10.5px]",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  delay,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  suffix: string;
  hint: string;
  delay: string;
}) {
  return (
    <div
      className="panel animate-fade-up group relative overflow-hidden p-5"
      style={{ animationDelay: delay }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/[0.06] blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-[26px] font-extrabold leading-none tracking-tight text-white">
              {value}
            </span>
            <span className="pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400/80">
              {suffix}
            </span>
          </div>
          <p
            className={cn(
              "mt-2.5 text-[10.5px] font-medium text-slate-500",
              label === "Tempekan Terpadat" && "text-amber-300/70",
            )}
          >
            {hint}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-gradient-to-b from-amber-400/[0.12] to-transparent text-amber-400">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}
