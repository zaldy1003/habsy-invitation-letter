# Undangan Khataman Al-Qur’an — Muhammad Al-Habsy Mulfi

Implementasi React + Next.js App Router + TypeScript dari [frame Figma 168:284](https://www.figma.com/design/PkXP1ZtBxl60N5PC2BlTqy/Undangan-Digital---Fisik?node-id=168-284).

## Jalankan

Gunakan Node.js yang mendukung Next.js 16 (minimal 20.9; pengembangan ini diuji pada Node 26.7.0) dan npm.

```sh
npm ci
npm run dev
```

Buka **http://127.0.0.1:3000**. Server terikat ke loopback komputer ini.

Build produksi:

```sh
npm run typecheck
npm run build
npm run start
```

## Yang tersedia

- Cover terpisah dan enam sesi isi: salam/pembuka dan profil; waktu/tempat; countdown/lokasi; foto keluarga; doa/penutup; RSVP/buku tamu.
- Pemisahan bagian melalui ruang, komposisi, serta latar krem, hijau tua, dan hijau lembut, tanpa nomor atau label sesi. Salam dan pembuka tampil sebelum profil.
- Layout responsif sampai maksimum 480 px; warna, ornamen, foto, EB Garamond, Plus Jakarta Sans, dan FreeSerif mengikuti desain.
- Aset dan font disajikan lokal. Tidak bergantung pada URL aset Figma sementara atau Google Fonts saat runtime.
- Halaman `/` khusus cover; tombol Buka Undangan berpindah ke `/undangan`. Isi undangan tidak dirender di cover. Dukungan reduced motion tetap tersedia.
- Countdown ke Jumat, 9 Oktober 2026 pukul 19.00 WITA, berhenti di nol.
- Tautan lokasi Google Maps dari pemilik undangan. Tombol kalender dan ikonnya telah dihapus sesuai permintaan.
- Form RSVP terhubung ke Supabase melalui API Next.js: validasi, draf lokal, status kirim nyata, dan idempotensi untuk percobaan ulang. Nama/ucapan publik hanya tampil setelah izin tamu dan persetujuan keluarga.
- Penanganan foto gagal dimuat dengan tombol coba lagi.
- Musik Mawlaya dari folder Sound mulai setelah tombol Buka Undangan ditekan, berulang, dan dapat dijeda atau dilanjutkan.

## Mengubah konten

- `src/config/event.ts`: identitas, tanggal/jam, alamat, tautan Maps, dan audio.
- `src/app/page.tsx`: halaman cover.
- `src/app/undangan/page.tsx`: halaman isi undangan.
- `src/app/globals.css`: token warna, font, jarak, dan aturan responsif.
- `src/components/invitation-interactions.tsx`: countdown dan audio.
- `src/components/guestbook.tsx`: form RSVP dan daftar ucapan yang disetujui.
- `src/app/api/guestbook/route.ts`: API server untuk Supabase.
- `public/images/`: ornamen Figma dan foto baru `habsy-portrait.png` / `habsy-family.png`. Dua foto lama Figma tetap tersimpan sebagai referensi tetapi tidak digunakan halaman.
- `design-reference/assets.json`: inventaris aset Figma awal; perubahan foto dicatat di `design-reference/photo-sources.json`.
- `public/fonts/`: subset FreeSerif beserta sumber, lisensi, dan instruksi reproduksi.

Tanggal, hari, metadata, countdown, dan tahun footer diturunkan dari `event.startsAt` melalui `src/lib/event-format.ts`. Label waktu selesai tersimpan di konfigurasi acara.

## Batas sebelum undangan dipakai tamu

Tautan pribadi memakai token acak per penerima, nama resmi dan jatah hadir 1–20 orang. Pemegang tautan dapat mengisi/memperbarui satu RSVP untuk penerima tersebut. Halaman tanpa token tetap menyediakan form umum yang sudah ada; balasan umum dihitung per pengiriman dan tidak masuk rekap jumlah orang dari daftar tamu. Backend aktif pada Supabase; panel admin tersedia di `/admin`.

Nama dan orang tua telah diperbarui menjadi Muhammad Al-Habsy Mulfi, Bapak Mulfi Akil dan Ibu Isniani. Jadwal Jumat, 9 Oktober 2026 pukul 19.00 WITA sudah dikonfirmasi pengguna. Lokasi: Hotel Grand Puri Perintis; alamat mengikuti teks yang diberikan pengguna. Kedua foto berasal dari folder `Asset gambar/`, disalin tanpa modifikasi dan ditampilkan dengan rasio potret asli. Maps menggunakan tautan lokasi yang diberikan pemilik: https://maps.app.goo.gl/CvDZMgdMPjiECkdp7. Audio dari folder `Sound/` tersedia di `public/audio/mawlaya.mp3` dan terhubung melalui `event.musicUrl`. File musik terbaru menggunakan URL berversi untuk menghindari cache lama dan volume pemutar 100% (volume perangkat tetap berlaku). Audio dimulai melalui gesture tombol Buka Undangan; kegagalan audio tidak menghalangi konten.

Frontend belum dipublikasikan; database Supabase sudah aktif dan teruji dari server lokal. Halaman tetap `noindex`. Sebelum deployment, isi `APP_ORIGIN` dengan origin publik tepat dan atur proxy tepercaya untuk header alamat pengunjung. Login dan panel admin tersedia di `/admin`.

## Pengujian

```sh
npx playwright install chromium webkit
npm run test:e2e
```

Untuk menguji build produksi, hentikan server development terlebih dahulu:

```sh
npm run build
E2E_PRODUCTION=1 npm run test:e2e
```

Suite memeriksa lima ukuran viewport (320, 390, 430, 768, 1440), aset dan geometri SVG, pembukaan undangan tanpa ikon, pembagian enam sesi, salam, tidak adanya tombol kalender, tidak adanya bagian rekening, tautan Maps, pemutaran/jeda/lanjut audio dan jeda saat kembali ke cover, validasi/draf form, escaping ucapan, countdown sebelum/sesudah acara, reduced motion, penyimpanan browser yang ditolak, dan retry foto. Screenshot hasil tersimpan di `test-results/` (diabaikan Git). WebKit adalah emulasi browser, bukan pengujian pada iPhone fisik.

`node scripts/visual-audit.mjs` mengambil screenshot bagian-bagian halaman dari server localhost untuk dibandingkan dengan `design-reference/figma-168-284.png`. Screenshot referensi tidak digunakan sebagai UI aplikasi.

## Database dan pengelolaan balasan

Konfigurasi server berada di `.env.local` (diabaikan Git, izin file 600). Gunakan `.env.example` untuk instalasi baru; jangan menaruh secret pada variabel `NEXT_PUBLIC_*`. Koneksi server menggunakan Data API Supabase dengan header `apikey`, tanpa mengirim key ke browser. Referensi: [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

Skema pada `supabase/migrations/202610040001_guestbook.sql` sudah diterapkan ke proyek pemilik menggunakan `supabase db query --linked --project-ref ... --file ...`. Penerapan ini langsung melalui SQL, belum dicatat dalam ledger CLI migration; jangan menjalankan ulang file create-table pada proyek yang sama. Untuk database baru, jalankan file tersebut sekali. RLS aktif; anon/authenticated tidak mendapat akses tabel maupun fungsi submit. RPC server menangani idempotensi dan batas atomik 5 pengiriman per bucket alamat / 10 menit serta 100 global / 10 menit. Alamat hanya disimpan sebagai HMAC dalam bucket, bukan IP mentah; bucket kedaluwarsa dibersihkan saat ada pengiriman berikutnya. Batas ini adalah proteksi dasar, bukan pengganti perlindungan bot di gateway hosting.

Di **Supabase → Table Editor → invitation_responses**:

1. Lihat `name`, `attendance` (`hadir` / `berhalangan`), `message`, dan `created_at` untuk semua balasan.
2. Ucapan awalnya `moderation_status = pending`. Jika `publish_consent = true` dan ucapan tidak kosong, ubah menjadi `approved` untuk menampilkannya.
3. Ubah menjadi `hidden` untuk menyembunyikan kembali. Kehadiran dan request ID tidak pernah dikirim dalam feed publik.

`GET /api/guestbook` mengembalikan maksimal 50 ucapan terbaru yang disetujui. `POST /api/guestbook` menerima JSON `requestId` (UUID v4), `name` (1–160), `attendance`, `message` (maksimum 1.000), `publishConsent` (boolean), dan `website` (honeypot, harus kosong). Payload dibatasi 8 KiB, origin diperiksa, dan error database tidak ditampilkan ke tamu. Secret yang pernah dibagikan di percakapan sebaiknya diganti melalui dashboard sebelum publikasi, lalu diperbarui hanya pada environment server.

Uji integrasi cloud opsional (server localhost harus berjalan dan `.env.local` terisi):

```sh
node --env-file=.env.local scripts/check-database.mjs
```

Script tersebut membuat data uji dengan ID acak, menguji simpan/idempotensi/moderasi/rate limit/akses anonim, lalu menghapus hanya balasan uji dalam blok `finally`. Bucket rate-limit uji kedaluwarsa dalam 10 menit. Tes browser form memakai respons simulasi; uji script ini memverifikasi koneksi database nyata secara terpisah.

## Panel admin dan animasi

Buka `/admin`. Panel memakai warna krem/hijau undangan, responsif untuk desktop dan ponsel. Fitur: ringkasan RSVP, pencarian nama, filter hadir/berhalangan/status ucapan, pagination 25 balasan, tampilkan/sembunyikan/tinjau ulang ucapan, serta logout. Moderasi memeriksa izin publikasi tamu dan dicatat atomik di `invitation_moderation_log`.

Login memakai email/kata sandi Supabase Auth. Hanya `app_metadata.invitation_role = admin` yang boleh mengakses API pengelola. Metadata ini hanya bisa ditetapkan oleh server/pemilik, bukan data profil yang bisa diubah pengguna. Setiap API memverifikasi akun melalui Auth sebelum membaca atau menulis data. Cookie HttpOnly/SameSite Strict berlaku maksimum satu jam; HTTPS mengaktifkan Secure. Tidak menyimpan token di localStorage. Sesi kedaluwarsa meminta login ulang; tidak ada refresh token otomatis.

Akun pemilik yang sudah terkonfirmasi di Supabase telah diberi hak admin pada 5 Oktober 2026. Gunakan email dan kata sandi akun tersebut. Untuk akun baru tambahan yang disetujui pemilik:

```sh
ADMIN_EMAIL='alamat-pengelola@example.com' node --env-file=.env.local scripts/create-admin.mjs
```

Kredensial acak disimpan pada `admin-access.local.txt` berizin 600 dan diabaikan Git. Script menolak akun yang sudah ada; tidak mengambil alih atau mengubah akun lama. Jangan membagikan file tersebut kepada tamu. Untuk akun yang sudah ada, pemilik dapat mengatur metadata melalui sarana admin Supabase. Pemulihan kata sandi masih dikelola pemilik melalui Supabase, belum ada alur reset di panel.

Migration `202610040002_admin.sql` sudah diterapkan langsung melalui SQL seperti migration pertama. Uji integrasi `node --env-file=.env.local scripts/check-admin.mjs` membuat dua akun sementara (admin dan non-admin), menguji akses/login/moderasi/audit/logout, lalu menghapus akun dan balasan uji. Tidak mengirim email.

Animasi menggunakan Web Animations API saat cover/bagian isi memasuki viewport, satu kali per bagian, 2.000 ms dengan gerakan 18 px dan fade. Tidak mengubah geometri layout; konten tetap terlihat jika JavaScript gagal atau dimatikan. Preferensi reduced motion menonaktifkan animasi; perubahan preferensi saat halaman terbuka juga menghentikannya.

## Tambah tamu dan tautan pribadi

1. Masuk ke `/admin`, pilih **Daftar tamu**.
2. Isi **Nama penerima** dan **Jatah orang** (1–20, termasuk penerima utama), lalu **Tambah tamu**.
3. Pada daftar penerima, pilih **Lihat / salin link**, lalu **Salin link**. Link yang sama dapat dibuka kembali tanpa mengganti akses tamu.
4. Tamu membuka cover dengan nama penerima; Buka Undangan mempertahankan token. Form memakai nama resmi dan memeriksa jumlah hadir sesuai jatah. Berhalangan menyimpan 0 orang.
5. RSVP dapat diubah lewat **Ubah konfirmasi saya**; satu tamu tetap satu baris. Perubahan mengembalikan ucapan ke pending untuk ditinjau kembali pada tab **Ucapan & doa**.
6. **Cabut akses** menonaktifkan token setelah konfirmasi, tanpa menghapus balasan. Rekap tamu aktif/belum menjawab/orang hadir mengecualikan akses yang dicabut; ringkasan balasan umum tetap menghitung semua balasan tersimpan.

Migration `202610050001_guests.sql` sudah diterapkan langsung melalui SQL pada proyek pemilik (bukan lewat ledger CLI). Tabel `invitation_guests` terlindungi RLS dan revoke anon/authenticated. Token acak 32 byte disimpan sebagai hash SHA-256 dan ciphertext AES-256-GCM dengan AAD guest ID/version. `GUEST_TOKEN_KEY` sudah dibuat di `.env.local`; simpan kunci yang sama pada secret environment hosting dan cadangkan secara privat agar tautan yang tersimpan bisa disalin ulang. Jangan mengganti key tanpa migrasi enkripsi. Secret dan material token tidak dikirim dalam API daftar tamu. Resolve/submit memakai POST dan respons no-store; halaman memakai no-referrer.

API `/api/admin/guests` membutuhkan akun berperan admin: GET pencarian/pagination (25), POST create/link/revoke. Create memakai UUID permintaan agar retry yang sama tidak menggandakan tamu. `/api/invitation` menerima token untuk resolve/submit; server mengunci identitas sesuai token dan RPC memeriksa status aktif/jatah dengan row lock. Submit upsert per guest dan dibatasi 10 perubahan per token per 10 menit. Tidak ada pengiriman email/WhatsApp otomatis. Edit identitas/jatah, rotasi link dan ekspor CSV belum termasuk fitur ini.

Tautan memakai `APP_ORIGIN`. Saat ini origin localhost hanya bisa dibuka di komputer pengembang. Sebelum membagikan ke tamu, deploy frontend beserta environment server dan ubah origin ke alamat HTTPS publik; gunakan tombol salin setelah konfigurasi tersebut diperbarui.

Pemeriksaan integrasi:

```sh
node --env-file=.env.local scripts/check-guests.mjs
```

Script memakai akun dan tamu uji sementara, membuktikan alur UI create → cover → RSVP → perubahan → pencabutan serta pembatasan akses/jatah/idempotensi. Setelah selesai, hanya akun/tamu/balasan uji yang dibersihkan.
