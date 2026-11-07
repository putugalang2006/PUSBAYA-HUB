# PUSBAYA HUB

Sistem Pendataan Organisasi ST PUSBAYA — Banjar Campuan, Desa Adat Kerobokan.
Dashboard manajemen organisasi berbasis **Next.js 16 (App Router)**, **React 19**,
**TypeScript**, **Tailwind CSS v4**, dan **Lucide Icons**.

## Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

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
| **ADMIN** | Username `adminpusbaya` + password `pusbaya1974` | Akses penuh: tambah/edit/hapus anggota, export CSV, kelola sesi absensi & denda, WA blast, pilih semua KTA |

> Aplikasi dimulai tanpa data tiruan. Semua KPI, grafik distribusi, dan
> rekap dihitung dari data yang didaftarkan melalui formulir. Akun pengguna
> disimpan lokal di browser (demo), foto profil otomatis dikompres ke 256×256.

## Modul

1. **Dashboard** — banner, registrasi anggota (sekali per akun pengguna), status
   keanggotaan terverifikasi, KPI, distribusi per tempekan.
2. **Daftar Pengguna** — pencarian, filter tempekan/status/usia, tabel anggota,
   modal edit, hapus, export CSV.
3. **Absensi Digital** — sesi sangkep, status HADIR/IZIN/ALPHA, simulator scan
   QR KTA, rekap persentase & total denda.
4. **WA Blast** — target per tempekan/pengurus, variabel `{nama_anggota}` dan
   `{tanggal}`, pratinjau chat, antrian pengiriman `wa.me`.
5. **KTA Digital** — kartu hitam-emas dengan QR unik. Pengguna melihat KTA
   miliknya secara otomatis dari data registrasi; admin dapat memilih seluruh
   anggota, lalu mengunduh PNG atau PDF.

## Penyimpanan data

Seluruh data disimpan di `localStorage` browser dengan prefix `pusbaya_hub_v1`
(`_auth`, `_accounts`, `_members`, `_sessions`) melalui Context API.
Data antar-tab disinkronkan lewat event `storage` dan tombol **Refresh Data**.

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
  context/             AppContext (auth + seluruh state persisten)
  hooks/               useLocalStorageState
  lib/                 tipe, konstanta, util (CSV, WA, format, QR)
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
