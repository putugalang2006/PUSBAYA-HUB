"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  MapPin,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import {
  AGE_GROUP_LIST,
  MEMBER_STATUS_LIST,
  TEMPEKAN_LIST,
} from "@/lib/constants";
import type {
  AgeGroup,
  Member,
  MemberInput,
  MemberStatus,
  Tempekan,
} from "@/lib/types";
import { cn, isValidWhatsApp } from "@/lib/utils";

export function MemberForm({
  initial,
  onSubmit,
  submitLabel = "Simpan Anggota",
  onCancel,
  compact = false,
}: {
  initial?: Member;
  onSubmit: (
    input: MemberInput,
  ) => Promise<boolean | void> | boolean | void;
  submitLabel?: string;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [nama, setNama] = useState(initial?.nama ?? "");
  const [alamat, setAlamat] = useState(initial?.alamat ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp ?? "");
  const [tempekan, setTempekan] = useState<Tempekan>(
    initial?.tempekan ?? TEMPEKAN_LIST[0],
  );
  const [status, setStatus] = useState<MemberStatus>(
    initial?.status ?? "Anggota",
  );
  const [usia, setUsia] = useState<AgeGroup>(initial?.usia ?? "Dewasa");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (nama.trim().length < 3) {
      setError("Nama lengkap minimal 3 karakter.");
      return;
    }
    if (!isValidWhatsApp(whatsapp)) {
      setError("Nomor WhatsApp tidak valid (contoh: 081234567890).");
      return;
    }
    if (alamat.trim().length < 5) {
      setError("Alamat lengkap minimal 5 karakter.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const saved = await onSubmit({
        nama: nama.trim(),
        alamat: alamat.trim(),
        whatsapp: whatsapp.trim(),
        tempekan,
        status,
        usia,
      });
      if (saved === false) return;
      if (!initial) {
        setNama("");
        setAlamat("");
        setWhatsapp("");
        setTempekan(TEMPEKAN_LIST[0]);
        setStatus("Anggota");
        setUsia("Dewasa");
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Data gagal disimpan. Coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="member-nama" className="label">
          Nama Lengkap <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="member-nama"
            type="text"
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: I Made Aditya Pratama"
            className="field pl-10"
            maxLength={80}
          />
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <div>
          <label htmlFor="member-wa" className="label">
            Nomor WhatsApp <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="member-wa"
              type="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="0812 3456 7890"
              className="field pl-10"
              inputMode="tel"
              maxLength={20}
            />
          </div>
        </div>

        <div>
          <label htmlFor="member-tempekan" className="label">
            Tempekan <span className="text-amber-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <select
              id="member-tempekan"
              value={tempekan}
              onChange={(event) => setTempekan(event.target.value as Tempekan)}
              className="field pl-10"
            >
              {TEMPEKAN_LIST.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="member-alamat" className="label">
          Alamat Lengkap <span className="text-amber-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <textarea
            id="member-alamat"
            value={alamat}
            onChange={(event) => setAlamat(event.target.value)}
            placeholder="Banjar Campuan, Desa Adat Kerobokan…"
            rows={compact ? 2 : 3}
            className="field resize-none pl-10"
            maxLength={180}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="member-status" className="label">
            Status
          </label>
          <select
            id="member-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as MemberStatus)}
            className="field"
          >
            {MEMBER_STATUS_LIST.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="member-usia" className="label">
            Kategori Usia
          </label>
          <select
            id="member-usia"
            value={usia}
            onChange={(event) => setUsia(event.target.value as AgeGroup)}
            className="field"
          >
            {AGE_GROUP_LIST.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div
          className="rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-[12px] font-medium text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className={cn("flex gap-2", onCancel ? "justify-end" : "")}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            <X className="h-4 w-4" />
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className={cn(
            "btn btn-gold",
            onCancel ? "" : "w-full",
            submitting && "cursor-wait opacity-75",
          )}
        >
          {submitting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {submitting ? "Menyimpan ke Supabase…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
