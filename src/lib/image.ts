"use client";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const AVATAR_SIZE = 256;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("File gambar tidak dapat dibaca."));
    image.src = src;
  });
}

/**
 * Reads an uploaded profile photo, crops it to a centered square and
 * compresses it to a small JPEG data URL before it is uploaded to Supabase
 * Storage and its public URL is saved on the user row.
 */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Foto profil harus berupa file gambar (JPG, PNG, WEBP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Ukuran foto maksimal 8 MB.");
  }

  const raw = await readAsDataUrl(file);
  const image = await loadImage(raw);
  const side = Math.min(image.width, image.height);
  const sx = (image.width - side) / 2;
  const sy = (image.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak mendukung pemrosesan gambar.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

  return canvas.toDataURL("image/jpeg", 0.86);
}
