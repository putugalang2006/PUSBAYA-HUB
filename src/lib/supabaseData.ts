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
  role?: string | null;
  created_at?: string | null;
};

type DbMemberRow = {
  id: string;
  user_id?: string | null;
  username?: string | null;
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
    photo: row.photo_url ?? undefined,
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

export async function uploadProfilePhoto(
  dataUrl: string,
  username: string,
): Promise<string> {
  assertSupabaseConfigured();
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  if (!blob.size) throw new Error("File foto profil kosong.");

  const extension =
    blob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const filePath = `${username
    .trim()
    .toLowerCase()}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
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
  const { data, error } = await supabase
    .from("users")
    .insert({
      username: input.username.trim().toLowerCase(),
      password: input.password,
      photo_url: input.photoUrl ?? null,
      role: "PENGGUNA",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const row = normalizeUserRow(data as DbUserRow);
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    photo: row.photo,
    createdAt: row.createdAt,
  };
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
