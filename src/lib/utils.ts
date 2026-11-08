import { ORG_YEAR } from "./constants";
import type { AuthUser, Member } from "./types";

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Returns the member record linked to the signed-in user account, if any. */
export function findMemberForAuth(
  members: Member[],
  auth: AuthUser | null,
): Member | undefined {
  if (!auth || auth.role !== "PENGGUNA") return undefined;
  const username = auth.username.trim().toLowerCase();

  return members.find((member) => {
    // Primary relation: account id stored on the member record.
    if (member.userId && auth.userId) {
      return member.userId === auth.userId;
    }
    // Secondary relation: username captured at registration time.
    if (member.username) {
      return member.username.trim().toLowerCase() === username;
    }
    // Legacy fallback for members created before account linking existed.
    return member.nama.trim().toLowerCase() === username;
  });
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDateLong(isoDate: string): string {
  if (!isoDate) return "-";
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(isoDate: string): string {
  if (!isoDate) return "-";
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** YYYY-MM in local time */
export function monthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(
    message,
  )}`;
}

export function isValidWhatsApp(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function memberCode(sequence: number): string {
  return `PSB-${ORG_YEAR}-${String(sequence).padStart(3, "0")}`;
}

export function nextMemberSequence(ids: string[]): number {
  const max = ids.reduce((acc, id) => {
    const parsed = Number.parseInt(id.split("-").pop() ?? "0", 10);
    return Number.isFinite(parsed) ? Math.max(acc, parsed) : acc;
  }, 0);
  return max + 1;
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function truncate(text: string, length = 40): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}
