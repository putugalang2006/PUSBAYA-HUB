"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { fileToAvatarDataUrl } from "@/lib/image";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";

export function ProfileEditModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { auth, updateProfile } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [photoName, setPhotoName] = useState("");
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Reset the form each time the dialog opens so it always reflects the
  // latest saved account state.
  useEffect(() => {
    if (!open) return;
    setUsername(auth?.username ?? "");
    setPhoto(undefined);
    setPhotoName("");
    setRemovePhoto(false);
    setPhotoBusy(false);
    setBusy(false);
    setError("");
  }, [open, auth?.username]);

  const currentPhoto = removePhoto ? undefined : photo ?? auth?.photo;

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setPhotoBusy(true);
    setError("");
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setPhoto(dataUrl);
      setPhotoName(file.name);
      setRemovePhoto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses foto.");
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(undefined);
    setPhotoName("");
    setRemovePhoto(true);
  };

  const handleSubmit = async () => {
    setBusy(true);
    setError("");
    const result = await updateProfile({
      username,
      photoDataUrl: photo,
      photoName,
      removePhoto,
    });
    setBusy(false);
    if (result.ok) {
      onClose();
    } else {
      setError(result.error ?? "Gagal memperbarui profil.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title="Edit Profil"
      description="Perbarui username dan foto profil akun Anda."
      size="md"
      footer={
        <>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={busy}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-gold"
            onClick={handleSubmit}
            disabled={busy || photoBusy}
          >
            {busy ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Menyimpan…
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <span className="label">Foto Profil</span>
          <div className="flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <UserAvatar
              name={username || auth?.name || "Pengguna"}
              photo={currentPhoto}
              size={64}
              className="text-base"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy || busy}
                  className="btn btn-outline btn-sm"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  {photoBusy
                    ? "Memproses…"
                    : currentPhoto
                      ? "Ganti Foto"
                      : "Pilih Foto"}
                </button>
                {currentPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={photoBusy || busy}
                    className="btn btn-ghost btn-sm text-red-400/80 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                    Hapus
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[9.5px] leading-relaxed text-slate-500">
                JPG/PNG/WEBP maksimal 8 MB. Foto otomatis dipotong persegi dan
                diunggah ke Supabase Storage.
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handlePhoto(event.target.files?.[0])}
          />
        </div>

        <div>
          <label className="label" htmlFor="profile-username">
            Username
          </label>
          <input
            id="profile-username"
            className="field"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            placeholder="username"
          />
          <p className="mt-1.5 text-[10px] text-slate-500">
            3–24 karakter, tanpa spasi. Username ini juga dipakai untuk login.
          </p>
        </div>

        {error && (
          <div
            className="animate-fade-in rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-[12px] font-medium text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
