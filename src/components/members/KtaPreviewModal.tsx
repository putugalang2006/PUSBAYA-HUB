"use client";

import { DownloadButton, KtaCard } from "@/components/views/KtaView";
import { Modal } from "@/components/ui/Modal";
import type { Member } from "@/lib/types";

const ADMIN_KTA_NODE_ID = "admin-kta-preview-node";

export function KtaPreviewModal({
  member,
  open,
  onClose,
}: {
  member: Member | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open && Boolean(member)}
      onClose={onClose}
      title="Preview KTA Digital"
      description={
        member ? `${member.nama} · ${member.id}` : undefined
      }
      size="lg"
      footer={
        member ? (
          <>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Tutup
            </button>
            <DownloadButton
              member={member}
              format="png"
              nodeId={ADMIN_KTA_NODE_ID}
            />
          </>
        ) : null
      }
    >
      {member && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <KtaCard
              key={member.id}
              member={member}
              photo={member.profilePicture}
              nodeId={ADMIN_KTA_NODE_ID}
            />
          </div>
          <p className="text-center text-[10.5px] leading-relaxed text-slate-500">
            {member.profilePicture
              ? "Foto profil anggota ini akan tercetak pada KTA. Gunakan tombol Download KTA untuk menyimpan dalam resolusi tinggi."
              : "Anggota ini belum mengunggah foto profil. KTA sementara memakai avatar inisial nama."}
          </p>
        </div>
      )}
    </Modal>
  );
}
