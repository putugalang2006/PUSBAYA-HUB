import { cn } from "@/lib/utils";

/**
 * Official emblem of Sekaa Teruna Putra Settu Bhakti Jaya — Banjar Campuan.
 * The PNG is transparent, so it sits cleanly on the dark premium surface.
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-stt.png"
        alt="Logo ST Putra Settu Bhakti Jaya"
        width={size}
        height={size}
        className="h-full w-full object-contain drop-shadow-[0_4px_14px_rgba(234,179,8,0.22)]"
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
