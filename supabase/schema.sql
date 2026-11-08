-- PUSBAYA HUB - Supabase schema
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor.
-- Aplikasi memakai anon public key dari browser, sehingga policy di bawah
-- membuat operasi baca/tulis terbuka untuk kebutuhan demo organisasi.
-- Untuk produksi jangka panjang, migrasikan autentikasi ke Supabase Auth
-- dan ganti policy terbuka dengan policy berbasis auth.uid().

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  photo_url text,
  profile_picture text,
  role text not null default 'PENGGUNA',
  created_at timestamptz not null default now()
);

-- Pastikan kolom baru tetap ada jika tabel sudah dibuat sebelumnya.
alter table public.users add column if not exists photo_url text;
alter table public.users add column if not exists profile_picture text;
alter table public.users add column if not exists role text not null default 'PENGGUNA';
alter table public.users add column if not exists created_at timestamptz not null default now();

create unique index if not exists users_username_lower_idx
  on public.users (lower(username));

create table if not exists public.members (
  id text primary key,
  user_id uuid references public.users(id) on delete set null,
  username text,
  profile_picture text,
  nama text not null,
  alamat text not null,
  whatsapp text not null,
  tempekan text not null,
  status text not null default 'Anggota',
  usia text not null default 'Dewasa',
  created_at timestamptz not null default now()
);

alter table public.members add column if not exists user_id uuid;
alter table public.members add column if not exists username text;
alter table public.members add column if not exists profile_picture text;
alter table public.members add column if not exists nama text;
alter table public.members add column if not exists alamat text;
alter table public.members add column if not exists whatsapp text;
alter table public.members add column if not exists tempekan text;
alter table public.members add column if not exists status text not null default 'Anggota';
alter table public.members add column if not exists usia text not null default 'Dewasa';
alter table public.members add column if not exists created_at timestamptz not null default now();

create index if not exists members_user_id_idx on public.members (user_id);
create index if not exists members_username_idx on public.members (username);
create index if not exists members_tempekan_idx on public.members (tempekan);

-- Seed akun admin resmi. Ganti password setelah login pertama.
insert into public.users (username, password, role)
values ('adminpusbaya', 'pusbaya1974', 'ADMIN')
on conflict (username) do update set role = 'ADMIN';

-- RLS: aplikasi memakai custom login (bukan Supabase Auth), jadi anon key
-- perlu akses baca/tulis ke tabel users dan members.
alter table public.users enable row level security;
alter table public.members enable row level security;

drop policy if exists "pusbaya_users_select" on public.users;
create policy "pusbaya_users_select" on public.users
  for select using (true);

drop policy if exists "pusbaya_users_insert" on public.users;
create policy "pusbaya_users_insert" on public.users
  for insert with check (true);

drop policy if exists "pusbaya_users_update" on public.users;
create policy "pusbaya_users_update" on public.users
  for update using (true) with check (true);

drop policy if exists "pusbaya_users_delete" on public.users;
create policy "pusbaya_users_delete" on public.users
  for delete using (true);

drop policy if exists "pusbaya_members_select" on public.members;
create policy "pusbaya_members_select" on public.members
  for select using (true);

drop policy if exists "pusbaya_members_insert" on public.members;
create policy "pusbaya_members_insert" on public.members
  for insert with check (true);

drop policy if exists "pusbaya_members_update" on public.members;
create policy "pusbaya_members_update" on public.members
  for update using (true) with check (true);

drop policy if exists "pusbaya_members_delete" on public.members;
create policy "pusbaya_members_delete" on public.members
  for delete using (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to anon, authenticated;
grant select, insert, update, delete on public.members to anon, authenticated;

-- Bucket foto profil.
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do update set public = true;

drop policy if exists "pusbaya_profile_pictures_read" on storage.objects;
create policy "pusbaya_profile_pictures_read" on storage.objects
  for select using (bucket_id = 'profile-pictures');

drop policy if exists "pusbaya_profile_pictures_insert" on storage.objects;
create policy "pusbaya_profile_pictures_insert" on storage.objects
  for insert with check (bucket_id = 'profile-pictures');

drop policy if exists "pusbaya_profile_pictures_update" on storage.objects;
create policy "pusbaya_profile_pictures_update" on storage.objects
  for update using (bucket_id = 'profile-pictures')
  with check (bucket_id = 'profile-pictures');

drop policy if exists "pusbaya_profile_pictures_delete" on storage.objects;
create policy "pusbaya_profile_pictures_delete" on storage.objects
  for delete using (bucket_id = 'profile-pictures');
