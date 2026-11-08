"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Download,
  IdCard,
  Lock,
  MapPin,
  QrCode as QrIcon,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { toJpeg, toPng } from "html-to-image";
import QRCode from "qrcode";
import { useApp } from "@/context/AppContext";
import type { Member, PageKey } from "@/lib/types";
import {
  cn,
  formatDateShort,
  initials,
} from "@/lib/utils";
import { LogoMark } from "@/components/ui/Logo";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";

export function KtaView({
  onNavigate,
}: {
  onNavigate: (page: PageKey) => void;
}) {
  const { auth, members, pushToast, registeredMember } = useApp();
  const isAdmin = auth?.role === "ADMIN";
  const ownMember = registeredMember;

  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (members.length === 0) {
      setSelectedId("");
      return;
    }
    if (isAdmin) {
      if (!members.some((member) => member.id === selectedId)) {
        setSelectedId(members[0].id);
      }
    } else if (ownMember) {
      setSelectedId(ownMember.id);
    }
  }, [isAdmin, members, ownMember, selectedId]);

  const selected = useMemo(() => {
    if (isAdmin) {
      return members.find((member) => member.id === selectedId) ?? members[0];
    }
    if (ownMember) return ownMember;
    return members.find((member) => member.id === selectedId);
  }, [isAdmin, members, selectedId, ownMember]);

  if (members.length === 0) {
    return (
      <div className="panel animate-fade-up">
        <EmptyState
          icon={IdCard}
          title="Belum ada KTA digital"
          description="Kartu Tanda Anggota akan dibuat otomatis untuk setiap anggota terdaftar, lengkap dengan ID unik dan QR verifikasi."
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
      {/* Selector */}
      <section className="panel animate-fade-up p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
              <IdCard className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h3 className="text-[13px] font-bold text-white">
                {isAdmin ? "Pilih KTA Anggota" : "KTA Milik Anda"}
              </h3>
              <p className="mt-0.5 text-[10.5px] text-slate-500">
                {isAdmin
                  ? `${members.length} kartu tersedia untuk dicetak`
                  : "Dimuat otomatis dari data registrasi akun Anda"}
              </p>
            </div>
          </div>

          {isAdmin ? (
            <select
              value={selected?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
              className="field w-full py-2.5 text-xs sm:max-w-[380px]"
              aria-label="Pilih anggota untuk KTA"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.nama} · {member.id}
                </option>
              ))}
            </select>
          ) : (
            <span className="badge badge-gold self-start sm:self-auto">
              <ShieldCheck className="h-3 w-3" />
              {ownMember ? "Terverifikasi" : "Belum Terhubung"}
            </span>
          )}
        </div>
      </section>

      {!selected ? (
        <section className="panel animate-fade-up" style={{ animationDelay: "80ms" }}>
          <EmptyState
            icon={UserRound}
            title="KTA belum tersedia untuk akun ini"
            description={`Username "${auth?.username ?? "Pengguna"}" belum terhubung ke data anggota. Selesaikan registrasi anggota di Dashboard untuk menerbitkan KTA Digital Anda secara otomatis.`}
            action={
              <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                className="btn btn-gold"
              >
                Ke Registrasi Anggota
              </button>
            }
          />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <section
            className="panel animate-fade-up flex flex-col items-center justify-center p-6 sm:p-10"
            style={{ animationDelay: "80ms" }}
          >
            <div className="mb-5 flex w-full max-w-[560px] items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-white">
                  Kartu Tanda Anggota
                </h3>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  Tampilan digital · siap diunduh
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Aktif
              </span>
            </div>

            <KtaCard
              member={selected}
              photo={
                ownMember && selected.id === ownMember.id
                  ? auth?.photo
                  : undefined
              }
            />

            <div className="mt-5 grid w-full max-w-[560px] grid-cols-1 gap-2 sm:grid-cols-2">
              <DownloadButton member={selected} format="png" />
              <DownloadButton member={selected} format="pdf" />
              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 sm:col-span-2">
                <QrIcon className="h-4 w-4 shrink-0 text-amber-400/70" />
                <p className="text-[10px] leading-relaxed text-slate-500">
                  QR berisi identitas anggota untuk verifikasi kehadiran sangkep.
                </p>
              </div>
            </div>
          </section>

          {/* Detail */}
          <section
            className="panel animate-fade-up p-5"
            style={{ animationDelay: "140ms" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                <BadgeCheck className="h-[18px] w-[18px]" />
              </span>
              <div>
                <h3 className="text-[13px] font-bold text-white">
                  Detail Keanggotaan
                </h3>
                <p className="text-[10px] text-slate-500">
                  Data resmi anggota terdaftar
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-1">
              <DetailRow label="Nama Lengkap" value={selected.nama} />
              <DetailRow label="ID Anggota" value={selected.id} mono />
              <DetailRow label="Tempekan" value={selected.tempekan} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Kategori Usia" value={selected.usia} />
              <DetailRow
                label="Terdaftar"
                value={formatDateShort(selected.createdAt.slice(0, 10))}
              />
              <DetailRow label="Nomor WhatsApp" value={selected.whatsapp} mono />
              <DetailRow label="Masa Berlaku" value="31 Desember 2026" />
            </div>

            <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5">
              <div className="flex items-start gap-2.5">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400/80" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300/80">
                    Kartu Resmi Organisasi
                  </p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">
                    KTA ini diterbitkan oleh ST Putra Settu Bhakti Jaya, Banjar
                    Campuan. Gunakan dengan bertanggung jawab.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3.5 py-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Kelengkapan Profil
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Nama, ID, tempekan & QR
                </p>
              </div>
              <span className="font-mono text-[13px] font-bold text-emerald-400">
                100%
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.045] py-2.5 last:border-none">
      <span className="text-[10.5px] font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className={cn(
          "max-w-[60%] break-words text-right text-[11.5px] font-semibold text-slate-200",
          mono && "font-mono text-[10.5px] tracking-wide text-amber-300/90",
        )}
      >
        {value}
      </span>
    </div>
  );
}

const KTA_DESIGN_WIDTH = 560;
const KTA_DESIGN_HEIGHT = 353;

function KtaCard({ member, photo }: { member: Member; photo?: string }) {
  const [qr, setQr] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const payload = [
      "PUSBAYA HUB",
      `ID:${member.id}`,
      `NAMA:${member.nama}`,
      `TEMPEKAN:${member.tempekan}`,
      "ST PUTRA SETTU BHAKTI JAYA",
    ].join("|");
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 240,
      color: { dark: "#0b0b0b", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) setQr("");
      });
    return () => {
      cancelled = true;
    };
  }, [member]);

  // The card is designed at a fixed 560x353 canvas and scaled down to fit
  // the available width. This guarantees the exported image never clips,
  // because the real node captured by html-to-image keeps its full size.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => {
      const width = stage.clientWidth;
      if (!width) return;
      setScale(Math.min(1, width / KTA_DESIGN_WIDTH));
    };

    update();
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(update)
        : null;
    observer?.observe(stage);
    window.addEventListener("resize", update);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="relative w-full max-w-[560px] overflow-hidden rounded-2xl"
      style={{ aspectRatio: `${KTA_DESIGN_WIDTH} / ${KTA_DESIGN_HEIGHT}` }}
    >
      <div
        id="kta-card-node"
        className="kta-shell absolute left-0 top-0 box-border overflow-hidden rounded-2xl p-6"
        style={{
          width: KTA_DESIGN_WIDTH,
          height: KTA_DESIGN_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="kta-shine" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #facc15 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-amber-400/10" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-amber-400/10" />
        <LogoMark
          size={260}
          className="pointer-events-none absolute -bottom-24 -left-16 opacity-[0.045]"
        />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <LogoMark size={40} />
              <div>
                <p className="text-[13px] font-extrabold uppercase leading-none tracking-[0.12em]">
                  <span className="gold-text">Pusbaya Hub</span>
                </p>
                <p className="mt-1.5 text-[7.5px] font-semibold uppercase tracking-[0.18em] text-amber-200/50">
                  ST Putra Settu Bhakti Jaya · Banjar Campuan
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-amber-300/60">
                Kartu Tanda
              </p>
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-amber-300/60">
                Anggota
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl" />
              <div className="relative flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/50 bg-gradient-to-b from-amber-400/25 to-amber-900/20">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={`Foto ${member.nama}`}
                    crossOrigin="anonymous"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold tracking-wide text-amber-200">
                    {initials(member.nama)}
                  </span>
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/40 bg-[#12100a] text-amber-400">
                <ShieldCheck className="h-3 w-3" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[17px] font-extrabold leading-[1.15] text-white">
                {member.nama}
              </p>
              <p className="mt-1 font-mono text-[10.5px] font-bold tracking-[0.16em] text-amber-300/90">
                {member.id}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-amber-200">
                  <MapPin className="h-2 w-2" />
                  {member.tempekan}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.1em] text-slate-300">
                  <BadgeCheck className="h-2 w-2" />
                  {member.status}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center">
              <div className="rounded-lg bg-white p-1.5 shadow-lg shadow-black/40">
                {qr ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qr}
                    alt={`QR KTA ${member.nama}`}
                    crossOrigin="anonymous"
                    className="h-[58px] w-[58px]"
                  />
                ) : (
                  <div className="flex h-[58px] w-[58px] items-center justify-center bg-slate-100">
                    <QrIcon className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-[6.5px] font-bold uppercase tracking-[0.14em] text-amber-200/50">
                Scan Verifikasi
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-amber-400/15 pt-3">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-[0.18em] text-amber-200/40">
                  Bergabung
                </p>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-[8.5px] font-semibold text-slate-300">
                  <CalendarDays className="h-2 w-2 text-amber-400/60" />
                  {formatDateShort(member.createdAt.slice(0, 10))}
                </p>
              </div>
              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-[0.18em] text-amber-200/40">
                  Masa Berlaku
                </p>
                <p className="mt-0.5 font-mono text-[8.5px] font-semibold text-slate-300">
                  31 · 12 · 2026
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[6.5px] font-bold uppercase tracking-[0.16em] text-amber-300/40">
              <Sparkles className="h-2 w-2" />
              Banjar Campuan · Kerobokan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 &&
      window.matchMedia("(max-width: 1024px)").matches)
  );
}

function sanitizeFileName(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "anggota"
  );
}

async function waitForKtaImages(node: HTMLElement): Promise<void> {
  try {
    await document.fonts.ready;
  } catch {
    // Font embedding can continue even if the font set is unavailable.
  }

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) {
        try {
          await image.decode();
        } catch {
          // A failed image must not block the rest of the card export.
        }
        return;
      }
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });
    }),
  );
}

function captureOptions(node: HTMLElement) {
  const width = Math.max(1, node.offsetWidth);
  const height = Math.max(1, node.offsetHeight);
  const pixelRatio = Math.min(4, Math.max(3, Math.ceil(1050 / width)));

  return {
    cacheBust: true,
    backgroundColor: "#0a0b0e",
    width,
    height,
    pixelRatio,
    style: {
      transform: "none",
      transformOrigin: "top left",
      margin: "0",
      boxSizing: "border-box",
    },
  };
}

async function renderKtaPng(node: HTMLElement): Promise<string> {
  await waitForKtaImages(node);
  return toPng(node, captureOptions(node));
}

function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function dataUrlToPngFile(
  dataUrl: string,
  fileName: string,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: "image/png" });
}

function DownloadButton({
  member,
  format,
}: {
  member: Member;
  format: "png" | "pdf";
}) {
  const { pushToast } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<{
    url: string;
    fileName: string;
  } | null>(null);
  const isPng = format === "png";
  const safeName = sanitizeFileName(member.nama);
  const baseFileName = `KTA-${member.id}-${safeName}`;

  const handleDownload = async () => {
    const node = document.getElementById("kta-card-node");
    if (!node) return;
    setDownloading(true);
    try {
      if (isPng) {
        const dataUrl = await renderKtaPng(node);
        const fileName = `${baseFileName}.png`;

        if (isMobileBrowser()) {
          const file = await dataUrlToPngFile(dataUrl, fileName);
          let shared = false;

          try {
            if (
              typeof navigator.share === "function" &&
              typeof navigator.canShare === "function" &&
              navigator.canShare({ files: [file] })
            ) {
              await navigator.share({
                files: [file],
                title: "KTA PUSBAYA",
                text: `KTA Digital ${member.nama}`,
              });
              shared = true;
            }
          } catch (shareError) {
            if (
              shareError instanceof DOMException &&
              shareError.name === "AbortError"
            ) {
              return;
            }
            // Older mobile browsers can reject Web Share; fall back to the
            // long-press preview modal instead.
          }

          if (shared) {
            pushToast(
              "success",
              "KTA siap disimpan",
              "Pilih Simpan ke Galeri pada menu berbagi HP Anda.",
            );
            return;
          }

          setPreview({ url: dataUrl, fileName });
          pushToast(
            "info",
            "KTA siap disimpan",
            "Tekan dan tahan gambar untuk menyimpan ke Galeri HP.",
          );
          return;
        }

        downloadDataUrl(dataUrl, fileName);
        pushToast(
          "success",
          "KTA berhasil diunduh",
          `Kartu ${member.nama} tersimpan sebagai PNG.`,
        );
        return;
      }

      await waitForKtaImages(node);
      const dataUrl = await toJpeg(node, {
        ...captureOptions(node),
        quality: 0.95,
      });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const nodeWidth = node.offsetWidth;
      const nodeHeight = node.offsetHeight;
      const ratio = Math.min(
        (pageWidth - margin * 2) / nodeWidth,
        (pageHeight - margin * 2) / nodeHeight,
      );
      const width = nodeWidth * ratio;
      const height = nodeHeight * ratio;
      pdf.addImage(
        dataUrl,
        "JPEG",
        (pageWidth - width) / 2,
        (pageHeight - height) / 2,
        width,
        height,
      );
      pdf.save(`${baseFileName}.pdf`);

      pushToast(
        "success",
        "KTA berhasil diunduh",
        `Kartu ${member.nama} tersimpan sebagai PDF.`,
      );
    } catch (error) {
      pushToast(
        "error",
        `Gagal mengunduh KTA ${isPng ? "PNG" : "PDF"}`,
        error instanceof Error
          ? error.message
          : "Coba lagi atau gunakan browser lain.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={cn("btn py-2.5", isPng ? "btn-gold" : "btn-outline")}
      >
        <Download className={cn("h-4 w-4", downloading && "animate-pulse")} />
        {downloading
          ? `Menyiapkan ${isPng ? "PNG" : "PDF"}…`
          : isPng
            ? "Download KTA"
            : "Download PDF"}
      </button>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title="Simpan KTA ke Galeri HP"
        description="Gambar KTA sudah dirender dalam resolusi tinggi dan siap disimpan."
        size="lg"
        footer={
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setPreview(null)}
          >
            Tutup
          </button>
        }
      >
        {preview && (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
              <p className="text-[12px] font-semibold text-amber-200">
                Tekan dan tahan gambar untuk menyimpan ke Galeri HP
              </p>
              <p className="mt-1 text-[10.5px] text-slate-400">
                Jika long-press tidak tersedia, gunakan tombol unduh di bawah.
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.url}
              alt={`KTA ${member.nama}`}
              crossOrigin="anonymous"
              draggable={false}
              className="mx-auto w-full max-w-[560px] rounded-xl border border-white/10 shadow-2xl shadow-black/50"
            />
            <a
              href={preview.url}
              download={preview.fileName}
              className="btn btn-gold w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Unduh Gambar
            </a>
          </div>
        )}
      </Modal>
    </>
  );
}