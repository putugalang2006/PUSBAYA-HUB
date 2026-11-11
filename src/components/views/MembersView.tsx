"use client";

import { useMemo, useState } from "react";
import {
  Download,
  FilterX,
  IdCard,
  Lock,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  AGE_GROUP_LIST,
  MEMBER_STATUS_LIST,
  TEMPEKAN_LIST,
} from "@/lib/constants";
import type { Member, PageKey } from "@/lib/types";
import { downloadMembersPdf } from "@/lib/memberPdf";
import { cn, formatNumber, initials } from "@/lib/utils";
import { MemberForm } from "@/components/members/MemberForm";
import { KtaPreviewModal } from "@/components/members/KtaPreviewModal";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";

export function MembersView({
  onNavigate,
}: {
  onNavigate: (page: PageKey) => void;
}) {
  const {
    auth,
    members,
    addMember,
    updateMember,
    deleteMember,
    pushToast,
    tempekanPenggerak,
  } = useApp();
  const isAdmin = auth?.role === "ADMIN";

  const [search, setSearch] = useState("");
  const [tempekanFilter, setTempekanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [usiaFilter, setUsiaFilter] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [previewing, setPreviewing] = useState<Member | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchQuery =
        !query ||
        member.nama.toLowerCase().includes(query) ||
        member.whatsapp.toLowerCase().includes(query) ||
        member.alamat.toLowerCase().includes(query) ||
        member.tempekan.toLowerCase().includes(query) ||
        member.id.toLowerCase().includes(query);
      const matchTempekan =
        tempekanFilter === "ALL" || member.tempekan === tempekanFilter;
      const matchStatus =
        statusFilter === "ALL" || member.status === statusFilter;
      const matchUsia = usiaFilter === "ALL" || member.usia === usiaFilter;
      return matchQuery && matchTempekan && matchStatus && matchUsia;
    });
  }, [members, search, tempekanFilter, statusFilter, usiaFilter]);

  const hasFilter =
    search.trim() !== "" ||
    tempekanFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    usiaFilter !== "ALL";

  const resetFilters = () => {
    setSearch("");
    setTempekanFilter("ALL");
    setStatusFilter("ALL");
    setUsiaFilter("ALL");
  };

  const exportPdf = async () => {
    if (members.length === 0) {
      pushToast(
        "info",
        "Tidak ada data",
        "Belum ada data anggota yang dapat diunduh.",
      );
      return;
    }
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      await downloadMembersPdf(members);
      pushToast(
        "success",
        "PDF berhasil diunduh",
        `${members.length} data anggota tersimpan dalam satu PDF.`,
      );
    } catch {
      pushToast(
        "error",
        "Gagal membuat PDF",
        "Coba lagi atau gunakan browser lain.",
      );
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <section className="panel animate-fade-up p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-xl md:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, WhatsApp, alamat, tempekan…"
                className="field pl-10"
                aria-label="Cari anggota"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 md:ml-auto">
                <button
                  type="button"
                  onClick={exportPdf}
                  disabled={exportingPdf}
                  aria-busy={exportingPdf}
                  title="Unduh seluruh data anggota sebagai PDF"
                  className={cn(
                    "btn btn-outline btn-sm sm:px-3.5 sm:py-2.5",
                    exportingPdf && "cursor-wait opacity-70",
                  )}
                >
                  <Download
                    className={cn(
                      "h-3.5 w-3.5",
                      exportingPdf && "animate-pulse",
                    )}
                  />
                  {exportingPdf ? "Menyiapkan PDF…" : "Unduh PDF"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="btn btn-gold btn-sm sm:px-3.5 sm:py-2.5"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Anggota
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.05] pt-3">
            <span className="mr-1 hidden items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600 sm:flex">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              Filter
            </span>
            <select
              value={tempekanFilter}
              onChange={(event) => setTempekanFilter(event.target.value)}
              className="field w-auto min-w-[150px] flex-1 py-2.5 text-xs sm:flex-none"
              aria-label="Filter tempekan"
            >
              <option value="ALL">Semua Tempekan</option>
              {TEMPEKAN_LIST.map((item) => (
                <option key={item} value={item}>
                  {tempekanPenggerak[item]
                    ? `${item} · ${tempekanPenggerak[item]}`
                    : item}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="field w-auto min-w-[125px] flex-1 py-2.5 text-xs sm:flex-none"
              aria-label="Filter status kepengurusan"
            >
              <option value="ALL">Semua Status</option>
              {MEMBER_STATUS_LIST.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={usiaFilter}
              onChange={(event) => setUsiaFilter(event.target.value)}
              className="field w-auto min-w-[125px] flex-1 py-2.5 text-xs sm:flex-none"
              aria-label="Filter kategori usia"
            >
              <option value="ALL">Semua Usia</option>
              {AGE_GROUP_LIST.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-ghost btn-sm"
                title="Reset filter"
              >
                <FilterX className="h-3.5 w-3.5" />
                Reset
              </button>
            )}

            <p className="ml-auto hidden text-[10px] text-slate-500 lg:block">
              <span className="font-semibold text-slate-300">{filtered.length}</span>{" "}
              dari {members.length} anggota
            </p>
          </div>
        </div>
      </section>

      {/* Table */}
      <section
        className="panel animate-fade-up overflow-hidden"
        style={{ animationDelay: "80ms" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-400/15 bg-amber-400/[0.07] text-amber-400">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-[13px] font-bold text-white">
                Data Anggota Terdaftar
              </h3>
              <p className="text-[10px] text-slate-500">
                {formatNumber(members.length)} total ·{" "}
                {formatNumber(filtered.length)} ditampilkan
              </p>
            </div>
          </div>
          {isAdmin && (
            <span className="badge badge-slate">Akses penuh</span>
          )}
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada anggota terdaftar"
            description="Data anggota masih kosong. Daftarkan anggota pertama melalui formulir registrasi untuk mengisi tabel, KPI, dan seluruh modul lainnya."
            action={
              <button
                type="button"
                onClick={() =>
                  isAdmin ? setAddOpen(true) : onNavigate("dashboard")
                }
                className="btn btn-gold"
              >
                <Plus className="h-4 w-4" />
                {isAdmin ? "Tambah Anggota Pertama" : "Ke Form Registrasi"}
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Pencarian tidak menemukan hasil"
            description="Tidak ada anggota yang cocok dengan kata kunci dan filter yang dipilih. Coba ubah atau reset filter."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="btn btn-outline"
              >
                <FilterX className="h-4 w-4" />
                Reset Semua Filter
              </button>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[1000px]">
                <thead>
                  <tr>
                    <th className="w-[56px] text-center">No</th>
                    <th>Nama Lengkap</th>
                    <th>Nomor WhatsApp</th>
                    <th>Alamat Lengkap</th>
                    <th>Tempekan</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, index) => (
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
                            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
                              {member.id} · {member.usia}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/${member.whatsapp.replace(/\D/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-300 transition hover:text-emerald-400"
                        >
                          <MessageCircle className="h-3.5 w-3.5 text-slate-500 transition group-hover:text-emerald-400" />
                          {member.whatsapp}
                        </a>
                      </td>
                      <td>
                        <p
                          className="max-w-[230px] truncate text-[12px] text-slate-400"
                          title={member.alamat}
                        >
                          {member.alamat}
                        </p>
                      </td>
                      <td>
                        <span className="badge badge-gold">
                          <MapPin className="h-2.5 w-2.5" />
                          {member.tempekan.replace("Tempek ", "")}
                        </span>
                      </td>
                      <td>
                        <span
                          className={cn(
                            "badge",
                            member.status === "Ketua"
                              ? "badge-gold"
                              : member.status === "Pengurus"
                                ? "badge-amber"
                                : "badge-slate",
                          )}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td>
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewing(member)}
                              className="btn btn-outline btn-sm"
                              title={`Lihat KTA ${member.nama}`}
                            >
                              <IdCard className="h-3 w-3" />
                              KTA
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(member)}
                              className="btn btn-outline btn-sm"
                              title={`Edit ${member.nama}`}
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(member)}
                              className="btn btn-danger btn-sm"
                              title={`Hapus ${member.nama}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              <Lock className="h-2.5 w-2.5" />
                              View Only
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-black/20 px-5 py-3">
              <p className="text-[10.5px] text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-slate-300">
                  {filtered.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-300">
                  {members.length}
                </span>{" "}
                anggota
              </p>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                Data lokal · PUSBAYA HUB
              </p>
            </div>
          </>
        )}
      </section>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Tambah Anggota Baru"
        description="Data akan langsung tersinkron ke dashboard, absensi, dan KTA."
      >
        <MemberForm
          submitLabel="Simpan Anggota"
          onCancel={() => setAddOpen(false)}
          onSubmit={async (input) => {
            const created = await addMember(input);
            if (!created) return false;
            setAddOpen(false);
            pushToast(
              "success",
              "Anggota ditambahkan",
              `${created.nama} · ${created.id}`,
            );
            return true;
          }}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Data Anggota"
        description={editing ? `${editing.nama} · ${editing.id}` : undefined}
      >
        {editing && (
          <MemberForm
            key={editing.id}
            initial={editing}
            submitLabel="Simpan Perubahan"
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              const updated = await updateMember(editing.id, input);
              if (!updated) return false;
              setEditing(null);
              pushToast("success", "Data anggota diperbarui", input.nama);
              return true;
            }}
          />
        )}
      </Modal>

      <KtaPreviewModal
        member={previewing}
        open={Boolean(previewing)}
        onClose={() => setPreviewing(null)}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Hapus data anggota?"
        description={
          deleting
            ? `${deleting.nama} (${deleting.id}) akan dihapus permanen beserta catatan presensinya. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmLabel="Ya, Hapus"
        onConfirm={async () => {
          if (!deleting) return false;
          const removed = await deleteMember(deleting.id);
          if (!removed) return false;
          pushToast("info", "Anggota dihapus", deleting.nama);
          setDeleting(null);
          return true;
        }}
      />
    </div>
  );
}
