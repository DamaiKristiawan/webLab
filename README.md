# Web Laboratorium Teknik Digital — Universitas Lampung

Situs informasi dan layanan Laboratorium Teknik Digital, Fakultas Teknik, Universitas Lampung.
Pengunjung bisa melihat jadwal, mengajukan peminjaman alat/ruangan/penelitian **tanpa login**, mengerjakan
pretest dan postest praktikum, mengisi survei, dan melihat dokumentasi kegiatan. Staf (admin dan asisten)
mengelola semuanya lewat panel admin.

## Fitur

**Publik (tanpa login)**
- Beranda: hero, statistik lab, akses cepat, pengumuman, tentang lab, agenda mendatang, kegiatan terbaru, piket hari ini
- Jadwal kegiatan (praktikum dan seminar) dan jadwal piket (Senin sampai Jumat)
- Profil lab dan struktur organisasi (kepala lab, dosen, PLP, asisten)
- Pengajuan peminjaman alat, ruangan, dan penelitian, dengan kode pelacakan, unggah bukti atau tautan Drive, dan cek status
- Praktikum: modul, pretest, dan postest per judul
- Survei kepuasan anonim
- Dokumentasi kegiatan (galeri foto)
- Pencarian halaman, mode terang dan gelap

**Panel admin** (`/admin`)
- Dashboard, jadwal, pengumuman, inventaris (alat dan ruangan), anggota lab, jadwal piket, pengaturan profil lab
- Pengajuan: setujui, tolak, selesaikan, batalkan, dengan pemeriksaan bentrok jadwal dan stok alat
- Praktikum, soal, kode akses tes, hasil tes, ekspor CSV
- Survei dan dokumentasi, manajemen akun staf

## Peran

| Peran | Hak akses |
|---|---|
| **Pengguna** | Publik, tanpa akun |
| **Asisten** | Login dengan akun sendiri. Hanya bagian praktikum: judul, pretest, postest, soal, kode akses, hasil tes |
| **Admin** | Kuasa penuh atas semua menu |

Login memakai **username dan password** (bukan email).

## Teknologi

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 · PostgreSQL ·
Zod · jose dan bcryptjs (sesi cookie JWT) · lucide-react

## Prasyarat

- Node.js 20.9 atau lebih baru (disarankan versi LTS terbaru)
- PostgreSQL 14 atau lebih baru
- Git

## Memasang di komputer sendiri

> Jalankan semua perintah di folder yang berisi `package.json`. Kalau proyek ada di dalam folder
> bertingkat (mis. `lab-td/lab-td`), masuk ke folder yang **dalam**.

```bash
# 1. Ambil kode dan pasang dependensi
git clone https://github.com/DamaiKristiawan/webLab.git
cd webLab
npm install

# 2. Salin berkas lingkungan, lalu isi nilainya (lihat tabel di bawah)
cp .env.example .env          # Windows (cmd): copy .env.example .env

# 3. Buat database kosong di PostgreSQL, mis. bernama lab_td
#    (lewat pgAdmin, DBeaver, atau: createdb lab_td)

# 4. Terapkan skema database dan buat Prisma Client
npx prisma migrate deploy
npx prisma generate

# 5. Isi data awal (akun admin, praktikum, contoh ruangan dan alat, pengaturan)
npx tsx prisma/seed.ts

# 6. Jalankan
npm run dev
```

Buka <http://localhost:3000>. Panel admin: <http://localhost:3000/admin/login>.

Saat mengembangkan dan mengubah `prisma/schema.prisma`, pakai `npx prisma migrate dev --name nama-perubahan`
sebagai ganti `migrate deploy`.

### Variabel lingkungan (`.env`)

| Variabel | Wajib | Keterangan |
|---|---|---|
| `DATABASE_URL` | ya | Alamat PostgreSQL, mis. `postgresql://user:password@localhost:5432/lab_td` |
| `AUTH_SECRET` | ya | Kunci rahasia sesi login, minimal 32 karakter acak. Buat dengan `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_USERNAME` | ya | Username admin pertama yang dibuat seed |
| `ADMIN_PASSWORD` | ya | Password admin pertama. **Ganti di server produksi** |
| `UPLOAD_DIR` | tidak | Folder penyimpanan berkas unggahan. Bawaan: `uploads/` di folder proyek |

`.env` **tidak boleh** di-commit ke Git (sudah ada di `.gitignore`). Jangan menaruh password asli di `.env.example`.

### Data awal dari seed

Menjalankan `npx tsx prisma/seed.ts` membuat:
- Akun admin dari `ADMIN_USERNAME` dan `ADMIN_PASSWORD`
- Praktikum **Teknik Digital** dan **Sistem Operasi**, masing-masing dengan 6 judul
- Contoh ruangan, alat, dan teks pengaturan lab

Menjalankan seed lagi **mengembalikan password admin** ke nilai di `.env`. Itu cara termudah kalau lupa password admin.

## Setelah pertama kali login

1. **Pengaturan**: isi visi, misi, sejarah, alamat, email, telepon, jam layanan, dan tautan template surat.
2. **Inventaris**: ganti contoh alat dan ruangan dengan data lab yang sebenarnya.
3. **Anggota Lab**: isi kepala lab, dosen, PLP, dan asisten untuk halaman Struktur.
4. **Staf**: buat akun untuk tiap asisten (peran Asisten).
5. **Jadwal Piket**: isi nama yang piket per hari.
6. **Gambar** (taruh di folder `public/`):
   - `logo-ltd.png`: logo lab
   - `hero-lab.jpg`: foto latar beranda (landscape, sekitar 1920 px lebar, usahakan di bawah 500 KB)
   - `gedung-lab.jpg`: foto gedung untuk kartu "Tentang Laboratorium" (opsional)

## Praktikum dan tes

**Struktur.** Satu praktikum punya **satu modul** (satu tautan, berisi semua judul) dan **enam judul**.
Tiap judul punya satu pretest dan satu postest. Keenam judul dibuat otomatis, admin hanya mengganti namanya.

**Alur admin atau asisten:** buka Praktikum, isi tautan modul, ganti nama judul, lalu buat pretest dan postest
tiap judul dan isi soalnya (pilihan ganda, 2 sampai 5 opsi). Atur durasi di pengaturan tes. Durasi hanya bisa diatur
admin dan asisten.

**Aturan tes untuk praktikan:**
- Satu NPM hanya bisa mengerjakan tiap tes **sekali**. Aturan dijaga di database, jadi muat ulang halaman,
  ganti browser, atau memanggil endpoint langsung tidak bisa melewatinya.
- Untuk memulai, praktikan mengisi nama, NPM, dan **kode akses** dari asisten. Kode dibuat di halaman tes
  (*Buat kode*, *Buat kode baru*, *Tutup akses*).
- Soal dan kunci jawaban tidak dikirim ke browser sebelum praktikan menekan Mulai.
- Waktu dihitung server sejak Mulai. Jawaban terkirim otomatis saat waktu habis. Memuat ulang halaman tidak
  mengulang waktu, dan jawaban yang sudah dipilih dipulihkan.
- Nilai **tidak** ditampilkan ke praktikan. Setelah kirim, mereka hanya melihat "Jawaban terkirim".

**Hasil Tes** (admin dan asisten): daftar hasil dengan kolom judul dan tanda "Lewat waktu", filter, dan ekspor CSV.
Bagian **Belum mengumpulkan** berisi peserta yang sudah mulai tapi belum mengirim, dengan tombol reset.
Menghapus sebuah hasil juga membuat peserta itu bisa mengerjakan lagi.

## Berkas unggahan

Berkas disimpan di `uploads/` (atau `UPLOAD_DIR`), di luar `public/`:
- `uploads/media/...`: foto dokumentasi, disajikan publik lewat `/media/...`
- Bukti pengajuan: hanya bisa dibuka admin lewat `/admin/bukti/[id]`

Folder ini **tidak ikut Git** dan **harus dicadangkan** bersama database. Foto dikecilkan otomatis di browser
sebelum diunggah (maksimal sisi terpanjang 1800 px).

## Perintah yang sering dipakai

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi (jalankan sebelum deploy untuk memeriksa galat) |
| `npm start` | Menjalankan hasil build |
| `npx prisma studio` | Melihat dan mengubah isi database lewat browser |
| `npx prisma migrate dev --name x` | Membuat dan menerapkan migrasi baru (pengembangan) |
| `npx prisma migrate deploy` | Menerapkan migrasi yang sudah ada (server) |
| `npx prisma generate` | Membuat ulang Prisma Client |
| `npx tsx prisma/seed.ts` | Mengisi data awal |

## Struktur folder

```
prisma/            skema, migrasi, seed
public/            logo dan gambar statis
uploads/           berkas unggahan (tidak di Git)
src/
  app/             halaman: (publik) dan admin, plus route handler /media dan /admin/bukti
  actions/         Server Actions (login, pengajuan, praktikum, tes, dst.)
  components/      komponen publik dan admin
  lib/             helper: auth, waktu (WIB), penyimpanan berkas, pembatas laju, dll.
```

Waktu disimpan di database dalam UTC dan ditampilkan dalam WIB.

## Deploy ke server Linux (ringkas)

1. Pasang Node.js, PostgreSQL, Nginx, dan PM2. Buat database dan pengguna PostgreSQL khusus.
2. Ambil kode, lalu buat `.env` produksi: `DATABASE_URL`, `AUTH_SECRET` baru (acak, jangan sama dengan lokal),
   `ADMIN_PASSWORD` yang kuat, dan `UPLOAD_DIR` ke folder tetap di luar folder aplikasi (mis. `/var/lab-td/uploads`).
3. Jalankan:
   ```bash
   npm ci
   npx prisma migrate deploy
   npx tsx prisma/seed.ts
   npm run build
   pm2 start npm --name lab-td -- start
   pm2 save
   ```
4. Nginx sebagai reverse proxy ke `localhost:3000`. Teruskan alamat IP asli (aplikasi memakainya untuk
   membatasi percobaan berulang) dan naikkan batas unggahan:
   ```nginx
   client_max_body_size 25m;
   location / {
     proxy_pass http://127.0.0.1:3000;
     proxy_set_header Host $host;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```
5. Aktifkan HTTPS (mis. Certbot), karena sesi login memakai cookie.
6. **Cadangkan rutin** database (`pg_dump`) dan folder `UPLOAD_DIR`.

Setiap pembaruan: `git pull`, `npm ci`, `npx prisma migrate deploy`, `npm run build`, `pm2 restart lab-td`.

## Masalah yang sering muncul

| Gejala | Penyebab dan solusi |
|---|---|
| `npx prisma ...` gagal atau mengunduh paket aneh | Perintah dijalankan di folder yang salah. Masuk ke folder yang berisi `package.json` |
| Login selalu "Username atau password salah" | Seed belum dijalankan setelah migrasi. Jalankan `npx tsx prisma/seed.ts` |
| VS Code menampilkan banyak galat tipe (mis. `username`, `rol` tidak dikenal) | Prisma Client belum dibuat ulang. Hentikan `npm run dev`, jalankan `npx prisma generate`, lalu pilih *TypeScript: Restart TS Server* |
| Galat aneh setelah memindah atau mengubah banyak file | Hapus folder `.next`, lalu jalankan `npm run dev` lagi |
| Unggah foto dokumentasi gagal atau terpotong | Setelah mengubah `next.config.ts`, hentikan dan jalankan ulang `npm run dev` |
| Foto hero atau gambar tidak muncul | Berkas belum ada di `public/` atau namanya salah. Cek `http://localhost:3000/nama-berkas.jpg` langsung |
| Peringatan CSS `@theme` atau `@apply` di VS Code | Aman diabaikan. Pasang ekstensi Tailwind CSS IntelliSense |

## Keamanan

- Jangan commit `.env` atau folder `uploads/`.
- Ganti `ADMIN_PASSWORD` dan `AUTH_SECRET` di server produksi.
- Sesi login bersifat stateless: mengganti password tidak otomatis mengeluarkan sesi yang sedang aktif
  (menonaktifkan akun staf berlaku).
- Pembatas laju disimpan di memori proses dan kembali kosong saat aplikasi di-restart.