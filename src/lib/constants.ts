import type {
  AgeGroup,
  MemberStatus,
  Tempekan,
  TempekanPenggerak,
} from "./types";

export const APP_NAME = "PUSBAYA HUB";
export const APP_SUBTITLE =
  "SISTEM PENDATAAN ORGANISASI - Banjar Campuan • Putra Settu Bhakti Jaya";
export const ST_NAME =
  "Sekaa Teruna Putra Settu Bhakti Jaya, Banjar Campuan, Desa Adat Kerobokan";
export const ADMIN_USERNAME = "adminpusbaya";

export const TEMPEKAN_LIST: Tempekan[] = [
  "Tempek Kauh Kelod",
  "Tempek Kauh Kaja",
  "Tempek Kangin Kaja",
  "Tempek Kangin Kelod",
];

/**
 * Legacy tempekan names kept for backwards compatibility. Databases created
 * before the "Kangin" rename still store "Dangin" values, so they are mapped
 * onto the current names; no member row is ever lost or mis-grouped.
 */
export const TEMPEKAN_ALIASES: Record<string, Tempekan> = {
  "Tempek Dangin Daja": "Tempek Kangin Kaja",
  "Tempek Dangin Kelod": "Tempek Kangin Kelod",
};

/** Default person in charge shown beneath each tempekan (editable by admin). */
export const TEMPEKAN_PENGGERAK_DEFAULTS: TempekanPenggerak = {
  "Tempek Kauh Kelod": "Pakde Yadnya",
  "Tempek Kauh Kaja": "Pakde Bawa",
  "Tempek Kangin Kaja": "Pak Man Alit",
  "Tempek Kangin Kelod": "Pakde Gatot",
};

/** Resolves any stored value (current or legacy) to a valid Tempekan. */
export function normalizeTempekan(value: string): Tempekan {
  if (TEMPEKAN_LIST.includes(value as Tempekan)) return value as Tempekan;
  return TEMPEKAN_ALIASES[value] ?? TEMPEKAN_LIST[0];
}

/**
 * Makes sure a stored penggerak map always contains every tempekan key,
 * filling the gaps from the defaults. An explicitly cleared value ("") is
 * preserved so the admin can leave a tempekan without a person in charge.
 */
export function normalizePenggerak(
  value: Partial<Record<string, string>> | null | undefined,
): TempekanPenggerak {
  const result = { ...TEMPEKAN_PENGGERAK_DEFAULTS };
  if (value) {
    for (const tempekan of TEMPEKAN_LIST) {
      if (
        Object.prototype.hasOwnProperty.call(value, tempekan) &&
        typeof value[tempekan] === "string"
      ) {
        result[tempekan] = (value[tempekan] as string).trim();
      }
    }
  }
  return result;
}

export const MEMBER_STATUS_LIST: MemberStatus[] = [
  "Ketua",
  "Pengurus",
  "Anggota",
];

export const AGE_GROUP_LIST: AgeGroup[] = ["Pelajar", "Remaja", "Dewasa"];

export const DEFAULT_DENDA = 20_000;
export const ORG_YEAR = 2026;

export const WA_BLAST_TARGETS = [
  "Semua Anggota",
  ...TEMPEKAN_LIST,
  "Pengurus",
] as const;

export const STORAGE_PREFIX = "pusbaya_hub_v1";
export const STORAGE_KEYS = {
  auth: `${STORAGE_PREFIX}_auth`,
  sessions: `${STORAGE_PREFIX}_sessions`,
  tempekanPenggerak: `${STORAGE_PREFIX}_tempekan_penggerak`,
} as const;

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "members", label: "Daftar Pengguna" },
  { key: "attendance", label: "Absensi Digital" },
  { key: "blast", label: "WA Blast" },
  { key: "kta", label: "KTA Digital" },
] as const;

export const PAGE_META: Record<
  string,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Ringkasan data dan registrasi anggota baru",
  },
  members: {
    title: "Daftar Pengguna",
    subtitle: "Kelola data anggota dan demografi organisasi",
  },
  attendance: {
    title: "Absensi Digital",
    subtitle: "Sangkep, presensi kegiatan, dan rekap denda",
  },
  blast: {
    title: "WA Blast",
    subtitle: "Kirim pengumuman massal langsung via WhatsApp",
  },
  kta: {
    title: "KTA Digital",
    subtitle: "Kartu tanda anggota virtual PUSBAYA HUB",
  },
};
