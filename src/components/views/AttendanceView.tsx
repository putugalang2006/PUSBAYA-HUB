"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarCheck,
  CalendarPlus,
  CalendarX2,
  Check,
  CheckCircle2,
  Clock3,
  QrCode,
  ScanLine,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DEFAULT_DENDA } from "@/lib/constants";
import type {
  AttendanceSession,
  AttendanceStatus,
  Member,
  PageKey,
} from "@/lib/types";
import {
  cn,
  formatDateLong,
  formatDateShort,
  formatRupiah,
  initials,
  percent,
  todayInput,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; dot: string; active: string; badge: string }
> = {
  HADIR: {
    label: "Hadir",
    dot: "bg-emerald-400",
    active:
      "border-emerald-400/45 bg-emerald-400/15 text-emerald-300 shadow-[0_0_16px_-6px_rgba(52,211,153,0.5)]",
    badge: "badge-green",
  },
  IZIN: {
    label: "Izin",
    dot: "bg-amber-400",
    active:
      "border-amber-400/45 bg-amber-400/15 text-amber-300 shadow-[0_0_16px_-6px_rgba(251,191,36,0.5)]",
    badge: "badge-amber",
  },
  ALPHA: {
    label: "Alpha",
    dot: "bg-red-400",
    active:
      "border-red-400/45 bg-red-400/15 text-red-300 shadow-[0_0_16px_-6px_rgba(248,113,113,0.5)]",
    badge: "badge-red",
  },
};

export function AttendanceView({
  onNavigate,
}: {
  onNavigate: (page: PageKey) => void;
}) {
  const {
    auth,
    members,
    sessions,
    createSession,
    deleteSession,
    setAttendance,
    pushToast,
  } = useApp();
  const isAdmin = auth?.role === "ADMIN";

  const [selectedId, setSelectedId] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [deleting, setDeleting] = useState<AttendanceSession | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      if (selectedId) setSelectedId("");
      return;
    }
    if (!sessions.some((session) => session.id === selectedId)) {
      setSelectedId(sessions[0].id);
    }
  }, [sessions, selectedId]);

  const session = useMemo(
    () => sessions.find((item) => item.id === selectedId) ?? sessions[0],
    [sessions, selectedId],
  );

  const recap = useMemo(() => {
    if (!session) {
      return {
        hadir: 0,
        izin: 0,
        alpha: 0,
        pct: 0,
        totalDenda: 0,
        alphaMembers: [] as typeof members,
      };
    }
    const statuses = members.map(
      (member) => session.records[member.id] ?? "ALPHA",
    );
    const hadir = statuses.filter((status) => status === "HADIR").length;
    const izin = statuses.filter((status) => status === "IZIN").length;
    const alpha = statuses.filter((status) => status === "ALPHA").length;
    return {
      hadir,
      izin,
      alpha,
      pct: percent(hadir, members.length),
      totalDenda: alpha * session.denda,
      alphaMembers: members.filter(
        (member) => (session.records[member.id] ?? "ALPHA") === "ALPHA",
      ),
    };
  }, [session, members]);

  if (members.length === 0) {
    return (
      <div className="panel animate-fade-up">
        <EmptyState
          icon={Users}
          title="Belum ada anggota untuk diabsen"
          description="Absensi digital membutuhkan data anggota. Daftarkan anggota terlebih dahulu, lalu buat sesi sangkep dan tandai kehadiran."
          action={
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className="btn btn-gold"
            >
              <Users className="h-4 w-4" />
              Daftarkan Anggota
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Session toolbar */}
      <section className="panel animate-fade-up p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                <CalendarCheck className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Sesi Aktif
                </p>
                <p className="text-[12px] font-semibold text-white">
                  {session ? session.nama : "Belum ada sesi"}
                </p>
              </div>
            </div>
            {sessions.length > 0 && (
              <select
                value={session?.id ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
                className="field w-full py-2.5 text-xs sm:max-w-[340px]"
                aria-label="Pilih sesi kegiatan"
              >
                {sessions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} · {formatDateShort(item.tanggal)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {session && (
              <span className="badge badge-slate">
                <Wallet className="h-2.5 w-2.5" />
                Denda {formatRupiah(session.denda)}
              </span>
            )}
            {isAdmin && (
              <>
                {session && (
                  <button
                    type="button"
                    onClick={() => setScanOpen(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    Scan QR KTA
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="btn btn-gold btn-sm"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Sesi Baru
                </button>
              </>
            )}
            {session && isAdmin && (
              <button
                type="button"
                onClick={() => setDeleting(session)}
                className="icon-btn"
                title="Hapus sesi"
                aria-label="Hapus sesi"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {!session ? (
        <section className="panel animate-fade-up" style={{ animationDelay: "80ms" }}>
          <EmptyState
            icon={CalendarX2}
            title="Belum ada sesi absensi"
            description={
              isAdmin
                ? "Buat sesi sangkep atau kegiatan pertama. Setelah sesi dibuat, tandai kehadiran anggota atau gunakan simulator scan QR KTA."
                : "Admin belum membuat sesi absensi. Silakan hubungi pengurus untuk membuka sesi sangkep."
            }
            action={
              isAdmin ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="btn btn-gold"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Buat Sesi Pertama
                </button>
              ) : undefined
            }
          />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          {/* Attendance list */}
          <section
            className="panel animate-fade-up overflow-hidden"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-3.5">
              <div>
                <h3 className="text-[13px] font-bold text-white">
                  {session.nama}
                </h3>
                <p className="mt-0.5 text-[10.5px] text-slate-500">
                  {formatDateLong(session.tanggal)} · {members.length} anggota
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {!isAdmin && (
                  <span className="badge badge-slate">
                    <Clock3 className="h-2.5 w-2.5" />
                    Read only
                  </span>
                )}
                {isAdmin && (
                  <span className="badge badge-gold">
                    <UserCheck className="h-2.5 w-2.5" />
                    Kelola presensi
                  </span>
                )}
              </div>
            </div>

            <div className="table-wrap hidden sm:block">
              <table className="data-table min-w-[620px]">
                <thead>
                  <tr>
                    <th className="w-[48px] text-center">No</th>
                    <th>Nama Anggota</th>
                    <th className="text-center">Status Kehadiran</th>
                    <th className="text-right">Denda</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => {
                    const status = session.records[member.id] ?? "ALPHA";
                    return (
                      <tr key={member.id}>
                        <td className="text-center">
                          <span className="font-mono text-[11px] text-slate-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="avatar h-8 w-8 text-[10px]">
                              {initials(member.nama)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-semibold text-white">
                                {member.nama}
                              </p>
                              <p className="mt-0.5 text-[9.5px] uppercase tracking-wider text-slate-500">
                                {member.tempekan.replace("Tempek ", "")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            {(
                              Object.keys(STATUS_CONFIG) as AttendanceStatus[]
                            ).map((option) => {
                              const config = STATUS_CONFIG[option];
                              const active = status === option;
                              if (!isAdmin) {
                                return active ? (
                                  <span
                                    key={option}
                                    className={cn("badge", config.badge)}
                                  >
                                    {config.label}
                                  </span>
                                ) : null;
                              }
                              return (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() =>
                                    setAttendance(
                                      session.id,
                                      member.id,
                                      option,
                                    )
                                  }
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9.5px] font-bold uppercase tracking-wider transition-all duration-150",
                                    active
                                      ? config.active
                                      : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300",
                                  )}
                                  aria-pressed={active}
                                >
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      active ? config.dot : "bg-slate-600",
                                    )}
                                  />
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="text-right">
                          <span
                            className={cn(
                              "font-mono text-[11.5px] font-semibold",
                              status === "ALPHA"
                                ? "text-red-400"
                                : "text-slate-600",
                            )}
                          >
                            {status === "ALPHA"
                              ? formatRupiah(session.denda)
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.06] sm:hidden">
              {members.map((member) => {
                const status = session.records[member.id] ?? "ALPHA";
                return (
                  <div key={member.id} className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="avatar h-8 w-8 shrink-0 text-[10px]">
                        {initials(member.nama)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold text-white">
                          {member.nama}
                        </p>
                        <p className="mt-0.5 text-[9.5px] uppercase tracking-wider text-slate-500">
                          {member.tempekan.replace("Tempek ", "")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-[10.5px] font-semibold",
                          status === "ALPHA"
                            ? "text-red-400"
                            : "text-slate-600",
                        )}
                      >
                        {status === "ALPHA" ? formatRupiah(session.denda) : "—"}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5">
                      {(
                        Object.keys(STATUS_CONFIG) as AttendanceStatus[]
                      ).map((option) => {
                        const config = STATUS_CONFIG[option];
                        const active = status === option;
                        if (!isAdmin) {
                          return active ? (
                            <span
                              key={option}
                              className={cn("badge", config.badge)}
                            >
                              {config.label}
                            </span>
                          ) : null;
                        }
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setAttendance(session.id, member.id, option)
                            }
                            className={cn(
                              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[9.5px] font-bold uppercase tracking-wider transition-all duration-150",
                              active
                                ? config.active
                                : "border-white/[0.07] bg-white/[0.02] text-slate-500 hover:border-white/20 hover:text-slate-300",
                            )}
                            aria-pressed={active}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                active ? config.dot : "bg-slate-600",
                              )}
                            />
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-black/20 px-5 py-3">
              <p className="text-[10.5px] text-slate-500">
                {isAdmin
                  ? "Tandai kehadiran manual atau gunakan simulator Scan QR KTA."
                  : "Status kehadiran dikelola oleh admin."}
              </p>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                {formatDateShort(session.tanggal)}
              </p>
            </div>
          </section>

          {/* Recap */}
          <section
            className="panel animate-fade-up p-5"
            style={{ animationDelay: "140ms" }}
          >
            <h3 className="text-[13px] font-bold text-white">
              Rekapitulasi Presensi
            </h3>
            <p className="mt-0.5 text-[10.5px] text-slate-500">
              Perhitungan otomatis dari sesi aktif
            </p>

            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-[104px] w-[104px] shrink-0">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="url(#attGradient)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - recap.pct / 100)}`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="attGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a16207" />
                      <stop offset="55%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#fde047" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[22px] font-extrabold leading-none text-white">
                    {recap.pct}%
                  </span>
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Kehadiran
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                {(
                  [
                    ["HADIR", recap.hadir, "Hadir"],
                    ["IZIN", recap.izin, "Izin"],
                    ["ALPHA", recap.alpha, "Alpha"],
                  ] as const
                ).map(([key, value, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5"
                  >
                    <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-400">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          STATUS_CONFIG[key].dot,
                        )}
                      />
                      {label}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-400">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-300/60">
                      Total Tagihan Denda
                    </p>
                    <p className="text-[8.5px] text-slate-500">
                      {recap.alpha} alpha × {formatRupiah(session.denda)}
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[14px] font-bold text-red-300">
                  {formatRupiah(recap.totalDenda)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Anggota Alpha
              </p>
              {recap.alphaMembers.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <p className="text-[11px] font-medium text-emerald-300/80">
                    Semua anggota tercatat hadir/izin.
                  </p>
                </div>
              ) : (
                <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {recap.alphaMembers.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="avatar h-6 w-6 text-[8px]">
                          {initials(member.nama)}
                        </span>
                        <span className="truncate text-[11px] text-slate-300">
                          {member.nama}
                        </span>
                      </div>
                      <span className="ml-2 shrink-0 font-mono text-[10px] font-semibold text-red-400">
                        {formatRupiah(session.denda)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}

      <CreateSessionModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(input) => {
          const created = createSession(input);
          if (!created) {
            pushToast("error", "Sesi gagal dibuat", "Lengkapi nama dan tanggal sesi.");
            return;
          }
          setSelectedId(created.id);
          setCreateOpen(false);
          pushToast(
            "success",
            "Sesi absensi dibuat",
            `${created.nama} · ${formatDateShort(created.tanggal)}`,
          );
        }}
      />

      {session && (
        <ScanModal
          open={scanOpen}
          onClose={() => setScanOpen(false)}
          members={members}
          sessionName={session.nama}
          onScanned={(memberId, memberName) => {
            setAttendance(session.id, memberId, "HADIR");
            pushToast(
              "success",
              "QR KTA terverifikasi",
              `${memberName} ditandai HADIR pada ${session.nama}.`,
            );
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Hapus sesi absensi?"
        description={
          deleting
            ? `Sesi "${deleting.nama}" beserta seluruh catatan presensi dan perhitungan dendanya akan dihapus permanen.`
            : ""
        }
        confirmLabel="Ya, Hapus Sesi"
        onConfirm={() => {
          if (!deleting) return;
          deleteSession(deleting.id);
          pushToast("info", "Sesi dihapus", deleting.nama);
          setDeleting(null);
        }}
      />
    </div>
  );
}

function CreateSessionModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { nama: string; tanggal: string; denda: number }) => void;
}) {
  const [nama, setNama] = useState("");
  const [tanggal, setTanggal] = useState(todayInput());
  const [denda, setDenda] = useState(String(DEFAULT_DENDA));
  const [error, setError] = useState("");

  const handleOpenReset = () => {
    setNama("");
    setTanggal(todayInput());
    setDenda(String(DEFAULT_DENDA));
    setError("");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        handleOpenReset();
      }}
      title="Buat Sesi Absensi"
      description="Semua anggota akan masuk dengan status awal ALPHA hingga ditandai hadir."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (nama.trim().length < 3) {
            setError("Nama kegiatan minimal 3 karakter.");
            return;
          }
          if (!tanggal) {
            setError("Tanggal kegiatan wajib diisi.");
            return;
          }
          const nominal = Number(denda);
          if (!Number.isFinite(nominal) || nominal < 0) {
            setError("Nominal denda tidak valid.");
            return;
          }
          onCreate({ nama: nama.trim(), tanggal, denda: nominal });
          handleOpenReset();
        }}
      >
        <div>
          <label htmlFor="session-nama" className="label">
            Nama Kegiatan
          </label>
          <input
            id="session-nama"
            type="text"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: Sangkep Rutin Bulanan"
            className="field"
            maxLength={70}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="session-tanggal" className="label">
              Tanggal
            </label>
            <input
              id="session-tanggal"
              type="date"
              value={tanggal}
              onChange={(event) => setTanggal(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="session-denda" className="label">
              Denda Ketidakhadiran (Rp)
            </label>
            <input
              id="session-denda"
              type="number"
              min={0}
              step={1000}
              value={denda}
              onChange={(event) => setDenda(event.target.value)}
              className="field"
            />
          </div>
        </div>
        <div className="rounded-lg border border-amber-400/15 bg-amber-400/[0.05] px-3 py-2.5 text-[11px] leading-relaxed text-amber-200/70">
          Denda akan otomatis dihitung untuk setiap anggota berstatus ALPHA pada
          sesi ini.
        </div>
        {error && (
          <div
            className="rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-[12px] font-medium text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              onClose();
              handleOpenReset();
            }}
          >
            <X className="h-4 w-4" />
            Batal
          </button>
          <button type="submit" className="btn btn-gold">
            <CalendarPlus className="h-4 w-4" />
            Buat Sesi
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ScanModal({
  open,
  onClose,
  members,
  sessionName,
  onScanned,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  sessionName: string;
  onScanned: (memberId: string, memberName: string) => void;
}) {
  const [memberId, setMemberId] = useState(members[0]?.id ?? "");
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setScanning(false);
      setSuccess("");
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    if (open && !members.some((member) => member.id === memberId)) {
      setMemberId(members[0]?.id ?? "");
    }
  }, [open, members, memberId]);

  const selected = members.find((member) => member.id === memberId);

  const startScan = () => {
    if (!selected || scanning) return;
    setSuccess("");
    setScanning(true);
    timer.current = setTimeout(() => {
      setScanning(false);
      setSuccess(selected.nama);
      onScanned(selected.id, selected.nama);
    }, 1650);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulator Scan QR KTA"
      description={`Presensi ${sessionName}. Pilih anggota lalu mulai pemindaian.`}
      size="sm"
      footer={
        success ? (
          <button type="button" className="btn btn-gold w-full" onClick={onClose}>
            <Check className="h-4 w-4" />
            Selesai
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              onClick={startScan}
              disabled={scanning || !selected}
              className="btn btn-gold"
            >
              {scanning ? (
                <>
                  <ScanLine className="h-4 w-4 animate-pulse" />
                  Memindai…
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4" />
                  Mulai Scan
                </>
              )}
            </button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="scan-member" className="label">
            Anggota Pemilik KTA
          </label>
          <select
            id="scan-member"
            value={memberId}
            onChange={(event) => {
              setMemberId(event.target.value);
              setSuccess("");
            }}
            className="field"
            disabled={scanning}
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nama} · {member.id}
              </option>
            ))}
          </select>
        </div>

        <div className="relative mx-auto flex h-52 w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border border-amber-400/20 bg-black/40">
          <div className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(250,204,21,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,.8) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          {/* Scanner corners */}
          {[
            "left-4 top-4 border-l-2 border-t-2 rounded-tl-lg",
            "right-4 top-4 border-r-2 border-t-2 rounded-tr-lg",
            "left-4 bottom-4 border-l-2 border-b-2 rounded-bl-lg",
            "right-4 bottom-4 border-r-2 border-b-2 rounded-br-lg",
          ].map((corner) => (
            <span
              key={corner}
              className={cn("absolute h-8 w-8 border-amber-400/70", corner)}
            />
          ))}

          {success ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-400">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <p className="mt-3 text-[13px] font-bold text-white">{success}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">
                Hadir · Terverifikasi
              </p>
            </div>
          ) : selected ? (
            <div className="relative z-10 flex flex-col items-center px-8 text-center">
              <span className="avatar h-16 w-16 text-lg">
                {initials(selected.nama)}
              </span>
              <p className="mt-3 max-w-full truncate text-[13px] font-bold text-white">
                {selected.nama}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-wider text-amber-400/80">
                {selected.id}
              </p>
              <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                <QrCode className="h-7 w-7 text-slate-400" />
              </div>
            </div>
          ) : (
            <p className="relative z-10 text-xs text-slate-500">
              Tidak ada anggota.
            </p>
          )}

          {scanning && <div className="scan-line" />}
        </div>

        <p className="text-center text-[10.5px] leading-relaxed text-slate-500">
          {scanning
            ? "Memverifikasi QR KTA anggota…"
            : "Simulasi pemindaian — status anggota otomatis berubah menjadi HADIR."}
        </p>
      </div>
    </Modal>
  );
}
