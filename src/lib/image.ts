"use client";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 800;
const MAX_OUTPUT_BYTES = 200 * 1024;
const START_QUALITY = 0.8;
const MIN_QUALITY = 0.5;

export type CompressedPhoto = {
  /** Data URL of the optimized image, ready to preview and upload. */
  dataUrl: string;
  /** The optimized file (WebP, or JPEG as a fallback). */
  file: File;
  /** `true` when the Canvas pipeline actually re-encoded the photo. */
  compressed: boolean;
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca hasil kompresi."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Fetches any image URL and converts it into an inline Base64 data URL.
 *
 * Throws when the URL cannot be fetched so the caller can apply a fallback.
 */
export async function urlToBase64(
  url: string,
  options: { timeoutMs?: number } = {},
): Promise<string> {
  if (!url) throw new Error("URL gambar kosong.");
  if (url.startsWith("data:")) return url;

  const timeoutMs = options.timeoutMs ?? 15000;
  const controller = new AbortController();
  const timer =
    timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      cache: "force-cache",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Gagal memuat gambar (HTTP ${response.status}).`);
    }
    const blob = await response.blob();
    if (!blob.size) throw new Error("Berkas gambar kosong.");
    return await blobToDataUrl(blob);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Waktu memuat gambar habis.");
    }
    throw error instanceof Error ? error : new Error("Gagal memuat gambar.");
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("File gambar tidak dapat dibaca."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof canvas.toBlob !== "function") {
      resolve(null);
      return;
    }
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

/** Scales a size down so its longest side fits `max`, keeping the ratio. */
function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/**
 * Encodes the canvas with the given format, progressively lowering quality
 * until the blob fits under `maxBytes` (or the quality floor is reached).
 * Returns `null` when the browser silently ignores the requested format
 * (e.g. WebP unsupported), so the caller can fall back to JPEG.
 */
async function encodeUnderBudget(
  canvas: HTMLCanvasElement,
  type: string,
  startQuality: number,
  maxBytes: number,
): Promise<Blob | null> {
  let blob = await canvasToBlob(canvas, type, startQuality);
  if (!blob) return null;
  if (type === "image/webp" && blob.type !== "image/webp") return null;

  let quality = startQuality;
  while (blob && blob.size > maxBytes && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, Math.round((quality - 0.1) * 100) / 100);
    blob = await canvasToBlob(canvas, type, quality);
  }
  return blob;
}

function baseNameOf(file: File): string {
  const withoutExtension = file.name.replace(/\.[^.]+$/, "");
  const safe = withoutExtension.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 60);
  return safe || "foto-profil";
}

/**
 * Compresses a profile photo entirely on the client before it is uploaded to
 * Supabase Storage:
 *  - resizes so the longest side is at most 800px (aspect ratio preserved),
 *  - converts to WebP at ~0.8 quality (JPEG fallback when WebP is unavailable),
 *  - lowers the quality until the file is at most ~200 KB (ideally 80–200 KB).
 *
 * If the browser cannot process Canvas images, or anything fails, the original
 * file is returned untouched so registration / profile editing never blocks.
 */
export async function compressProfilePhoto(
  file: File,
  options: { maxDimension?: number; maxBytes?: number } = {},
): Promise<CompressedPhoto> {
  const maxDimension = options.maxDimension ?? MAX_DIMENSION;
  const maxBytes = options.maxBytes ?? MAX_OUTPUT_BYTES;

  if (!file.type.startsWith("image/")) {
    throw new Error("Foto profil harus berupa file gambar (JPG, PNG, WEBP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("Ukuran foto maksimal 8 MB.");
  }

  const fallback = async (): Promise<CompressedPhoto> => ({
    dataUrl: await readAsDataUrl(file),
    file,
    compressed: false,
  });

  try {
    const raw = await readAsDataUrl(file);
    const image = await loadImage(raw);

    const { width, height } = fitWithin(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      maxDimension,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return fallback();

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, 0, 0, width, height);

    let blob = await encodeUnderBudget(
      canvas,
      "image/webp",
      START_QUALITY,
      maxBytes,
    );
    let mime = "image/webp";

    if (!blob) {
      blob = await encodeUnderBudget(
        canvas,
        "image/jpeg",
        START_QUALITY,
        maxBytes,
      );
      mime = "image/jpeg";
    }

    if (!blob || !blob.size) return fallback();

    const extension = mime === "image/webp" ? "webp" : "jpg";
    const optimized = new File([blob], `${baseNameOf(file)}.${extension}`, {
      type: mime,
      lastModified: Date.now(),
    });

    return {
      dataUrl: await blobToDataUrl(blob),
      file: optimized,
      compressed: true,
    };
  } catch {
    // Any Canvas/encoding failure must not stop the user flow.
    return fallback();
  }
}
