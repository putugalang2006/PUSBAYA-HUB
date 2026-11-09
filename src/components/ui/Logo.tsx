import { cn } from "@/lib/utils";
import { LOGO_STT_DATA_URL } from "@/lib/logoData";

/**
 * Official emblem of Sekaa Teruna Putra Settu Bhakti Jaya — Banjar Campuan.
 * The artwork is inlined as a base64 data URL so it renders everywhere,
 * including inside html-to-image exports on mobile Safari/Chrome.
 */
export function LogoMark({
  size = 40,
  className,
  glow = true,
}: {
  size?: number;
  className?: string;
  /**
   * Decorative drop-shadow glow. Disable it while exporting the KTA because
   * iOS Safari frequently fails to rasterise CSS filters in foreignObject and
   * drops the whole image.
   */
  glow?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_STT_DATA_URL}
        alt="Logo ST Putra Settu Bhakti Jaya"
        width={size}
        height={size}
        crossOrigin="anonymous"
        className={cn(
          "h-full w-full object-contain",
          glow && "drop-shadow-[0_4px_14px_rgba(234,179,8,0.22)]",
        )}
        draggable={false}
      />
    </span>
  );
}

export function LogoLockup({
  compact = false,
  size = 38,
}: {
  compact?: boolean;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <div className="min-w-0">
        <div
          className={cn(
            "gold-text font-extrabold uppercase leading-none tracking-[0.08em]",
            compact ? "text-base" : "text-lg",
          )}
        >
          Pusbaya Hub
        </div>
        {!compact && (
          <p className="mt-1 truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Sistem Pendataan Organisasi
          </p>
        )}
      </div>
    </div>
  );
}
