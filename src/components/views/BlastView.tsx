"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCheck,
  ExternalLink,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
  Users,
  Variable,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { WA_BLAST_TARGETS } from "@/lib/constants";
import type { Member } from "@/lib/types";
import {
  cn,
  formatDateLong,
  initials,
  normalizePhone,
  todayInput,
  waLink,
} from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

type Target = (typeof WA_BLAST_TARGETS)[number];

export function BlastView() {
  const { members, pushToast } = useApp();
  const [target, setTarget] = useState<Target>("Semua Anggota");
  const [message, setMessage] = useState("");
  const [queueOpen, setQueueOpen] = useState(false);
  const [sentIds, setSentIds] = useState<string[]>([]);

  const recipients = useMemo(() => {
    if (target === "Semua Anggota") return members;
    if (target === "Pengurus")
      return members.filter(
        (member) => member.status === "Ketua" || member.status === "Pengurus",
      );
    return members.filter((member) => member.tempekan === target);
  }, [members, target]);

  const today = formatDateLong(todayInput());

  const renderMessage = (member: Member) =>
    message
      .replaceAll("{nama_anggota}", member.nama)
      .replaceAll("{tanggal}", today);

  const previewMember = recipients[0];
  const previewText = previewMember
    ? renderMessage(previewMember)
    : message
        .replaceAll("{nama_anggota}", "Nama Anggota")
        .replaceAll("{tanggal}", today);

  const canSend = message.trim().length >= 5 && recipients.length > 0;

  const insertVariable = (variable: string) => {
    setMessage((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${variable} `);
  };

  const openForMember = (member: Member) => {
    const text = renderMessage(member);
    window.open(waLink(member.whatsapp, text), "_blank", "noopener,noreferrer");
    setSentIds((prev) =>
      prev.includes(member.id) ? prev : [...prev, member.id],
    );
  };

  const handleBroadcast = () => {
    if (message.trim().length < 5) {
      pushToast(
        "error",
        "Pesan terlalu pendek",
        "Tulis isi pengumuman minimal 5 karakter.",
      );
      return;
    }
    if (recipients.length === 0) {
      pushToast(
        "error",
        "Tidak ada penerima",
        "Target yang dipilih belum memiliki anggota.",
      );
      return;
    }
    setSentIds([]);
    setQueueOpen(true);
    // Open the first direct intent immediately, then continue from the queue.
    openForMember(recipients[0]);
    pushToast(
      "info",
      "Broadcast disiapkan",
      `${recipients.length} penerima. WhatsApp dibuka untuk ${recipients[0].nama}.`,
    );
  };

  if (members.length === 0) {
    return (
      <div className="panel animate-fade-up">
        <EmptyState
          icon={Send}
          title="Belum ada penerima broadcast"
          description="WA Blast membutuhkan data anggota beserta nomor WhatsApp. Daftarkan anggota terlebih dahulu untuk mulai mengirim pengumuman massal."
          action={
            <a href="#dashboard" className="btn btn-outline">
              Kelola dari Daftar Pengguna
            </a>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Composer */}
        <section className="panel animate-fade-up p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-white">
                Broadcast Massal
              </h3>
              <p className="mt-0.5 text-[11.5px] text-slate-400">
                Kirim pengumuman langsung ke WhatsApp anggota.
              </p>
            </div>
            <span className="badge badge-gold">
              <Send className="h-2.5 w-2.5" />
              Admin
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="blast-target" className="label">
                Target Penerima
              </label>
              <div className="relative">
                <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <select
                  id="blast-target"
                  value={target}
                  onChange={(event) => setTarget(event.target.value as Target)}
                  className="field pl-10"
                >
                  {WA_BLAST_TARGETS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {recipients.length} penerima siap dihubungi
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="blast-message" className="label mb-0">
                  Pesan Pengumuman
                </label>
                <span className="text-[9.5px] font-medium text-slate-600">
                  {message.length} karakter
                </span>
              </div>
              <textarea
                id="blast-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={7}
                placeholder={`Contoh:\nOm Swastyastu,\n\nMenyambut rapat rutin pada {tanggal}, kami mengundang seluruh anggota untuk hadir di Balai Banjar Campuan pukul 19.00 WITA.\n\nTerima kasih.\n— Pengurus ST PUSBAYA`}
                className="field resize-none leading-relaxed"
                maxLength={1200}
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  <Variable className="h-3 w-3" />
                  Variabel:
                </span>
                {["{nama_anggota}", "{tanggal}"].map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="rounded-md border border-amber-400/20 bg-amber-400/[0.06] px-2 py-1 font-mono text-[9.5px] text-amber-300/80 transition hover:border-amber-400/40 hover:text-amber-200"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-3">
              <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-400/70" />
                Pesan otomatis dipersonalisasi per anggota.
              </div>
              <button
                type="button"
                onClick={handleBroadcast}
                disabled={!canSend}
                className="btn btn-gold"
              >
                <Send className="h-4 w-4" />
                Kirim Broadcast WA
              </button>
            </div>

            {!canSend && (
              <p className="text-center text-[10px] text-slate-600">
                Isi pesan minimal 5 karakter dan pastikan target memiliki
                anggota.
              </p>
            )}
          </div>
        </section>

        {/* Preview & recipients */}
        <div className="space-y-5">
          <section
            className="panel animate-fade-up overflow-hidden"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-amber-400" />
                <h3 className="text-[12.5px] font-bold text-white">
                  Pratinjau WhatsApp
                </h3>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </span>
            </div>

            <div
              className="relative min-h-[280px] px-4 py-5"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(234,179,8,0.05), transparent 45%), #0a0f0d",
              }}
            >
              <div className="mx-auto max-w-[340px] rounded-xl border border-white/[0.07] bg-[#0b141a]/80 p-3">
                <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11.5px] font-bold text-white">
                      ST PUSBAYA
                    </p>
                    <p className="text-[9px] text-emerald-400/80">
                      {previewMember
                        ? `Untuk ${previewMember.nama}`
                        : "Belum ada penerima"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-none border border-amber-400/20 bg-gradient-to-br from-[#2a2410] to-[#1d1a0d] px-3 py-2.5 shadow-lg">
                    <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-amber-50/90">
                      {previewText.trim() ||
                        "Isi pesan pengumuman akan tampil di sini…"}
                    </p>
                    <p className="mt-1.5 flex items-center justify-end gap-1 text-[8.5px] text-amber-200/40">
                      09:41
                      <CheckCheck className="h-2.5 w-2.5 text-sky-400" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/[0.06] px-5 py-3">
              <p className="text-[10px] leading-relaxed text-slate-500">
                Pratinjau menggunakan variabel yang sudah dirender untuk
                penerima pertama.
              </p>
            </div>
          </section>

          <section
            className="panel animate-fade-up overflow-hidden"
            style={{ animationDelay: "140ms" }}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <h3 className="text-[12.5px] font-bold text-white">
                Daftar Penerima
              </h3>
              <span className="badge badge-slate">
                {recipients.length} anggota
              </span>
            </div>
            {recipients.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title="Tidak ada penerima pada target ini"
                description="Belum ada anggota yang cocok dengan target yang dipilih."
              />
            ) : (
              <ul className="max-h-[250px] divide-y divide-white/[0.045] overflow-y-auto">
                {recipients.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-2.5 px-5 py-2.5"
                  >
                    <span className="avatar h-7 w-7 text-[9px]">
                      {initials(member.nama)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-semibold text-slate-200">
                        {member.nama}
                      </p>
                      <p className="text-[9px] text-slate-500">
                        {normalizePhone(member.whatsapp)}
                      </p>
                    </div>
                    <span className="badge badge-slate">
                      {member.tempekan.replace("Tempek ", "")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Modal
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        title="Antrian Broadcast WhatsApp"
        description={`${recipients.length} pesan dipersonalisasi siap dikirim. Buka satu per satu untuk menghindari pemblokiran popup.`}
        size="lg"
      >
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.05] px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
          <p className="text-[10.5px] leading-relaxed text-amber-200/70">
            WhatsApp akan dibuka di tab baru untuk setiap penerima. Pastikan
            Anda sudah login ke WhatsApp Web. Beberapa browser dapat memblokir
            pembukaan tab otomatis.
          </p>
        </div>

        <ul className="space-y-1.5">
          {recipients.map((member, index) => {
            const sent = sentIds.includes(member.id);
            return (
              <li
                key={member.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                  sent
                    ? "border-emerald-400/20 bg-emerald-400/[0.04]"
                    : "border-white/[0.06] bg-white/[0.02]",
                )}
              >
                <span className="w-5 text-center font-mono text-[10px] text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="avatar h-8 w-8 text-[9px]">
                  {initials(member.nama)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-white">
                    {member.nama}
                  </p>
                  <p className="flex items-center gap-1 text-[9.5px] text-slate-500">
                    <Phone className="h-2.5 w-2.5" />
                    {normalizePhone(member.whatsapp)}
                  </p>
                </div>
                {sent ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Dibuka
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openForMember(member)}
                    className="btn btn-outline btn-sm"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Kirim
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3">
          <p className="text-[10.5px] text-slate-500">
            {sentIds.length} dari {recipients.length} pesan telah dibuka
          </p>
          <button
            type="button"
            onClick={() => {
              recipients.forEach((member, index) => {
                if (sentIds.includes(member.id)) return;
                window.setTimeout(() => openForMember(member), index * 900);
              });
              pushToast(
                "info",
                "Membuka antrian WhatsApp",
                "Izinkan popup pada browser bila diminta.",
              );
            }}
            className="btn btn-gold btn-sm"
          >
            <Send className="h-3.5 w-3.5" />
            Buka Semua
          </button>
        </div>
      </Modal>
    </div>
  );
}
