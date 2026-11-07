export type Role = "PENGGUNA" | "ADMIN";

export type Tempekan =
  | "Tempek Kauh Kelod"
  | "Tempek Kauh Kaja"
  | "Tempek Dangin Daja"
  | "Tempek Dangin Kelod";

export type MemberStatus = "Ketua" | "Pengurus" | "Anggota";
export type AgeGroup = "Pelajar" | "Remaja" | "Dewasa";
export type AttendanceStatus = "HADIR" | "IZIN" | "ALPHA";

export type PageKey =
  | "dashboard"
  | "members"
  | "attendance"
  | "blast"
  | "kta";

export interface AuthUser {
  userId?: string;
  username: string;
  name: string;
  role: Role;
  photo?: string;
  loginAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  photo?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  userId?: string;
  username?: string;
  nama: string;
  alamat: string;
  whatsapp: string;
  tempekan: Tempekan;
  status: MemberStatus;
  usia: AgeGroup;
  createdAt: string;
}

export interface MemberInput {
  nama: string;
  alamat: string;
  whatsapp: string;
  tempekan: Tempekan;
  status: MemberStatus;
  usia: AgeGroup;
}

export interface AttendanceSession {
  id: string;
  nama: string;
  tanggal: string;
  denda: number;
  createdAt: string;
  records: Record<string, AttendanceStatus>;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}
