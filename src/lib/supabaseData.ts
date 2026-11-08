import {
  AGE_GROUP_LIST,
  MEMBER_STATUS_LIST,
  TEMPEKAN_LIST,
} from "@/lib/constants";
import type {
  AgeGroup,
  Member,
  MemberInput,
  MemberStatus,
  Role,
  Tempekan,
  UserAccount,
} from "@/lib/types";
import { assertSupabaseConfigured, supabase } from "@/lib/supabase";

type DbUserRow = {
  id: string;
  username: string;
  password: string;
  photo_url?: string | null;
  profile_picture?: string | null;
  role?: string | null;
  created_at?: string | null;
};

type DbMemberRow = {
  id: string;
  user_id?: string | null;
  username?: string | null;
  profile_picture?: string | null;
  nama: string;
  alamat: string;
  whatsapp: string;
  tempekan: string;
  status: string;
  usia: string;
  created_at?: string | null;
};

export type DbUser = {
  id: string;
  username: string;
  password: string;
  photo?: string;
  role: Role;
  createdAt: string;
};

function normalizeMemberRow(row: DbMemberRow): Member {
  const tempekan = TEMPEKAN_LIST.includes(row.tempekan as Tempekan)
    ? (row.tempekan as Tempekan)
    : TEMPEKAN_LIST[0];
  const status = MEMBER_STATUS_LIST.includes(row.status as MemberStatus)
    ? (row.status as MemberStatus)
    : "Anggota";
  const usia = AGE_GROUP_LIST.includes(row.usia as AgeGroup)
    ? (row.usia as AgeGroup)
    : "Dewasa";

  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    username: row.username ?? undefined,
    profilePicture: row.profile_picture ?? undefined,
    nama: row.nama,
    alamat: row.alamat,
    whatsapp: row.whatsapp,
    tempekan,
    status,
    usia,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function normalizeUserRow(row: DbUserRow): DbUser {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    // When the `profile_picture` column exists it is authoritative (even when
    // null, meaning the photo was removed). Otherwise fall back to `photo_url`.
    photo:
      row.profile_picture !== undefined
        ? row.profile_picture ?? undefined
        : row.photo_url ?? undefined,
    role: row.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "PENGGUNA",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchMembersFromDb(): Promise<Member[]> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as DbMemberRow[]).map(normalizeMemberRow);
}

export async function fetchUserByUsername(
  username: string,
): Promise<DbUser | null> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeUserRow(data as DbUserRow) : null;
}

export async function usernameExists(username: string): Promise<boolean> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

/** True when the username belongs to a different account than userId. */
export async function usernameTakenByOther(
  username: string,
  userId?: string,
): Promise<boolean> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return false;
  return data.id !== userId;
}

export async function uploadProfilePhoto(
  dataUrl: string,
  username: string,
  originalName?: string,
): Promise<string> {
  assertSupabaseConfigured();
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  if (!blob.size) throw new Error("File foto profil kosong.");

  const mimeExtension = blob.type.split("/")[1]?.toLowerCase();
  const extension =
    mimeExtension === "jpeg"
      ? "jpg"
      : mimeExtension && /^[a-z0-9]+$/.test(mimeExtension)
        ? mimeExtension
        : "jpg";
  // Unique, clean object key: no leading slash, spaces, quotes, hashes or
  // question marks that break Storage URLs. Keeps the original extension.
  const rawName = originalName || `${username || "profile"}.${extension}`;
  const safeName = rawName.replace(/[^a-zA-Z0-9.-]/g, "_") || `profile.${extension}`;
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(safeName);
  const fileName = `${Date.now()}_${hasExtension ? safeName : `${safeName}.${extension}`}`;
  const filePath = fileName.replace(/^\/+/, "");

  const { error } = await supabase.storage
    .from("profile-pictures")
    .upload(filePath, blob, {
      contentType: blob.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from("profile-pictures")
    .getPublicUrl(filePath);
  if (!data.publicUrl) {
    throw new Error("Public URL foto profil tidak tersedia.");
  }
  return data.publicUrl;
}

export async function insertUser(input: {
  username: string;
  password: string;
  photoUrl?: string;
}): Promise<UserAccount> {
  assertSupabaseConfigured();
  const base = {
    username: input.username.trim().toLowerCase(),
    password: input.password,
    role: "PENGGUNA",
  };
  const attempts: Array<Record<string, string | null>> = [
    { ...base, profile_picture: input.photoUrl ?? null },
    { ...base, photo_url: input.photoUrl ?? null },
  ];

  let lastError = "Gagal menyimpan akun ke Supabase.";
  for (const payload of attempts) {
    const { data, error } = await supabase
      .from("users")
      .insert(payload)
      .select("*")
      .single();

    if (!error) {
      const row = normalizeUserRow(data as DbUserRow);
      return {
        id: row.id,
        username: row.username,
        password: row.password,
        photo: row.photo,
        createdAt: row.createdAt,
      };
    }

    lastError = error.message;
    const missingProfileColumn =
      error.message.toLowerCase().includes("profile_picture") &&
      /column|schema cache|does not exist/i.test(error.message);
    if (!missingProfileColumn) break;
  }

  throw new Error(lastError);
}

/**
 * Updates the signed-in account row. Only the provided fields are changed.
 * Falls back to the legacy `photo_url` column when `profile_picture` is
 * not present in the database yet.
 */
export async function updateUserProfile(input: {
  userId: string;
  username?: string;
  photoUrl?: string | null;
}): Promise<DbUser> {
  assertSupabaseConfigured();

  const base: Record<string, string | null> = {};
  if (input.username !== undefined) {
    base.username = input.username.trim().toLowerCase();
  }

  const attempts: Array<Record<string, string | null>> = [];
  if (input.photoUrl !== undefined) {
    attempts.push({ ...base, profile_picture: input.photoUrl });
    attempts.push({ ...base, photo_url: input.photoUrl });
  } else {
    attempts.push(base);
  }

  let lastError = "Gagal memperbarui profil ke Supabase.";
  for (const payload of attempts) {
    if (Object.keys(payload).length === 0) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", input.userId)
        .single();
      if (error) {
        lastError = error.message;
        continue;
      }
      return normalizeUserRow(data as DbUserRow);
    }

    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", input.userId)
      .select("*")
      .single();

    if (!error) return normalizeUserRow(data as DbUserRow);

    lastError = error.message;
    const missingProfileColumn =
      /profile_picture/i.test(error.message) &&
      /column|schema cache|does not exist/i.test(error.message);
    if (!missingProfileColumn) break;
  }

  throw new Error(lastError);
}

/**
 * Updates the member row linked to the account. `profile_picture` is optional
 * so older databases without that column keep working.
 */
export async function updateMemberProfile(
  id: string,
  input: { username?: string; profilePicture?: string | null },
): Promise<Member> {
  assertSupabaseConfigured();

  const base: Record<string, string | null> = {};
  if (input.username !== undefined) base.username = input.username;

  if (input.profilePicture !== undefined) {
    const { data, error } = await supabase
      .from("members")
      .update({ ...base, profile_picture: input.profilePicture })
      .eq("id", id)
      .select("*")
      .single();
    if (!error) return normalizeMemberRow(data as DbMemberRow);

    const missingProfileColumn =
      /profile_picture/i.test(error.message) &&
      /column|schema cache|does not exist/i.test(error.message);
    if (!missingProfileColumn) throw new Error(error.message);
  }

  if (Object.keys(base).length === 0) {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return normalizeMemberRow(data as DbMemberRow);
  }

  const { data, error } = await supabase
    .from("members")
    .update(base)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return normalizeMemberRow(data as DbMemberRow);
}

export async function insertMember(input: {
  id: string;
  userId?: string;
  username?: string;
  data: MemberInput;
}): Promise<Member> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("members")
    .insert({
      id: input.id,
      user_id: input.userId ?? null,
      username: input.username ?? null,
      nama: input.data.nama,
      alamat: input.data.alamat,
      whatsapp: input.data.whatsapp,
      tempekan: input.data.tempekan,
      status: input.data.status,
      usia: input.data.usia,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeMemberRow(data as DbMemberRow);
}

export async function updateMemberRecord(
  id: string,
  input: MemberInput,
): Promise<Member> {
  assertSupabaseConfigured();
  const { data, error } = await supabase
    .from("members")
    .update({
      nama: input.nama,
      alamat: input.alamat,
      whatsapp: input.whatsapp,
      tempekan: input.tempekan,
      status: input.status,
      usia: input.usia,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return normalizeMemberRow(data as DbMemberRow);
}

export async function deleteMemberRecord(id: string): Promise<void> {
  assertSupabaseConfigured();
  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
