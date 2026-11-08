# PUSBAYA HUB

Sistem Pendataan Organisasi ST PUSBAYA — Banjar Campuan, Desa Adat Kerobokan.
Dashboard manajemen organisasi berbasis **Next.js 16 (App Router)**, **React 19**,
**TypeScript**, **Tailwind CSS v4**, dan **Lucide Icons**.

## Menjalankan aplikasi

1. Buat project Supabase, lalu jalankan seluruh isi `supabase/schema.sql` di
   **Supabase Dashboard → SQL Editor**. File ini membuat tabel `users`,
   `members`, bucket `profile-pictures`, policy, dan akun admin awal.
2. Salin `.env.example` menjadi `.env.local`, lalu isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

3. Jalankan aplikasi:

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

> Di Vercel, tambahkan dua environment variable yang sama pada
> **Project Settings → Environment Variables**, lalu redeploy.

Preview khusus tampilan mobile (bingkai ponsel 390×844):

```text
http://localhost:3000/mobile-preview.html
```

Build produksi:

```bash
npm run build
npm start
```

## Alur halaman

1. **Landing Page** — satu layar penuh tanpa scroll, dengan latar logo ST
   PUSBAYA yang diburamkan, headline, ringkasan organisasi, CTA masuk, dan
   footer minimalis.
2. **Auth Page** — login/registrasi pengguna dan admin, dengan tombol kembali ke
   beranda.
3. **Login Success** — layar transisi dengan animasi checkmark emas, greeting
   personal, badge role, progress bar 0–100%, auto-redirect ±2,7 detik, dan
   tombol langsung ke dashboard.
4. **Dashboard** — ringkasan KPI, distribusi tempekan, registrasi anggota, dan
   status KTA. Sesi login yang tersimpan langsung membuka dashboard tanpa
   melewati landing/success saat halaman dimuat ulang.

## Akses demo

| Role | Cara masuk | Hak akses |
| --- | --- | --- |
| **PENGGUNA** | Buat akun lewat tab **Daftar Akun Baru** (username + password min. 6 karakter + foto profil opsional), lalu login | Baca data anggota, registrasi anggota, lihat absensi, lihat/unduh KTA sendiri |
| **ADMIN** | Username `adminpusbaya` + password `pusbaya1974` | Akses penuh: tambah/edit/hapus anggota, unduh direktori PDF, kelola sesi absensi & denda, WA blast, pilih semua KTA |

> Aplikasi tidak memakai data tiruan. Semua KPI, grafik distribusi, dan rekap
> dihitung dari data anggota di Supabase. Akun, sesi login, dan data anggota
> diverifikasi/diambil langsung dari database; foto profil diunggah ke bucket
> `profile-pictures` dan dikompres ke 256×256 sebelum dikirim.

## Modul

1. **Dashboard** — pengguna baru langsung diarahkan untuk mengisi formulir
   registrasi anggota sebelum dashboard lengkap tampil; setelah terdaftar,
   dashboard menampilkan KPI, status keanggotaan, dan distribusi per tempekan.
2. **Daftar Pengguna** — pencarian, filter tempekan/status/usia, tabel anggota,
   modal edit, hapus, serta unduh direktori PDF mewah berisi seluruh data
   anggota dan logo resmi STT.
3. **Absensi Digital** — sesi sangkep, status HADIR/IZIN/ALPHA, simulator scan
   QR KTA, rekap persentase & total denda.
4. **WA Blast** — target per tempekan/pengurus, variabel `{nama_anggota}` dan
   `{tanggal}`, pratinjau chat, antrian pengiriman `wa.me`.
5. **KTA Digital** — kartu hitam-emas dengan QR unik. Pengguna melihat KTA
   miliknya secara otomatis dari data registrasi; admin dapat memilih seluruh
   anggota, lalu mengunduh PNG atau PDF.

## Penyimpanan data

Data utama tersimpan di **Supabase**:

- `users` — akun pengguna/admin, password, role, dan URL foto profil.
- `members` — seluruh data anggota, terhubung ke akun lewat `user_id`/`username`.
- Storage bucket `profile-pictures` — file foto profil publik.

Login dan registrasi langsung memverifikasi/menulis ke Supabase. Daftar anggota
di Dashboard, tabel Daftar Pengguna, absensi, dan KTA selalu dimuat ulang dari
tabel `members`. Hanya sesi login dan sesi absensi lokal yang memakai
`localStorage` dengan prefix `pusbaya_hub_v1`; data akun/anggota tidak lagi
disimpan di sana. Tombol **Refresh Data** memuat ulang data anggota dari
Supabase.

## Struktur

```
src/
  app/                 layout, halaman, global styles
  components/
    auth/              login/registrasi dual-role + layar Login Success
    landing/           landing page pengenalan
    layout/            sidebar, header, app shell
    members/           form anggota reusable
    ui/                modal, empty state, toast, logo, konfirmasi
    views/             dashboard, anggota, absensi, blast, KTA
  context/             AppContext (auth Supabase + sesi absensi lokal)
  hooks/               useLocalStorageState
  lib/                 tipe, konstanta, util, Supabase client & repository, ekspor PDF
supabase/
  schema.sql           tabel users/members, RLS policy, bucket foto, seed admin
public/
  logo-stt.png         emblem resmi ST PUSBAYA
  landing-bg.jpg       foto latar landing page
```

## Catatan

- Waktu header menggunakan zona `Asia/Makassar` (WITA) dan diperbarui tiap detik.
- Status koneksi mengikuti event online/offline browser.
- KTA pengguna dimuat otomatis dari data anggota yang terhubung dengan akun
  (`userId`/`username`). Satu akun pengguna hanya dapat mendaftarkan satu data
  anggota; form registrasi otomatis diganti kartu status terverifikasi setelah
  pendaftaran berhasil.
