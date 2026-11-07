import type { AgeGroup, MemberStatus, Tempekan } from "./types";

export const APP_NAME = "PUSBAYA HUB";
export const APP_SUBTITLE =
  "SISTEM PENDATAAN ORGANISASI - Banjar Campuan • Putra Settu Bhakti Jaya";
export const ST_NAME =
  "Sekaa Teruna Putra Settu Bhakti Jaya, Banjar Campuan, Desa Adat Kerobokan";
export const ADMIN_USERNAME = "adminpusbaya";
export const ADMIN_PASSWORD = "pusbaya1974";

export const TEMPEKAN_LIST: Tempekan[] = [
  "Tempek Kauh Kelod",
  "Tempek Kauh Kaja",
  "Tempek Dangin Daja",
  "Tempek Dangin Kelod",
];

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
  accounts: `${STORAGE_PREFIX}_accounts`,
  members: `${STORAGE_PREFIX}_members`,
  sessions: `${STORAGE_PREFIX}_sessions`,
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
