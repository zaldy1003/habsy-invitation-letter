# Rencana implementasi undangan

## Scope dan keputusan — 4 Oktober 2026
- [x] Audit folder: hanya panduan, belum ada aplikasi, dependency, atau repository Git.
- [x] Baca panduan proyek dan skill Figma design-to-code.
- [x] Ambil konteks lengkap frame Figma `168:284`, file `PkXP1ZtBxl60N5PC2BlTqy`.
- [x] Bangun Next.js App Router, React, TypeScript, CSS dengan token asli desain.
- [x] Unduh semua 21 aset asli; gunakan font lokal dan layout responsif maksimal 480 px.
- [x] Implementasi buka undangan, countdown Asia/Makassar, unduh kalender, Maps, form interaktif dalam mode pratinjau.
- [x] Jalankan typecheck, production build, dan pemeriksaan browser pada 320/390/430/768/1440 px.
- [x] Catat hasil, keterbatasan, dan cara menjalankan di README.md.

## Batas tahap ini
Permintaan saat ini adalah implementasi desain ke React/Next.js. RSVP/database menunggu pilihan pengguna. Jangan menyatakan balasan terkirim jika belum ada backend. Nama, tanggal, alamat, dan foto mengikuti Figma; koordinat Maps dan audio asli belum diberikan. Tidak ada deployment, database, admin, atau pengiriman undangan pada tahap ini.

## 2026-10-04 — Implementasi dan verifikasi lokal selesai
- Implementasi: `src/app/`, `src/components/`, `src/config/event.ts`, `src/lib/calendar.ts`, konfigurasi Next.js/TypeScript, package.json/package-lock.json, 21 aset, font, README, dan suite Playwright.
- Dependency terkunci: Next.js 16.3.8, React 19.3.0. Build diuji dengan Node 26.7.0 dan npm 11.19.0.
- Font: EB Garamond dan Plus Jakarta Sans dari paket Fontsource; FreeSerif asli dari GNU, subset WOFF2 50.312 byte. Lisensi dan sumber disertakan.
- Verifikasi: `npm run typecheck` lulus; `npm run build` lulus; `E2E_PRODUCTION=1 npm run test:e2e` **12/12 lulus** pada build produksi, Chromium dan WebKit.
- Browser: tidak ada horizontal overflow pada 320, 390, 430, 768, 1440 px. Semua gambar termuat dan SVG mempertahankan dimensi intrinsik. Semua 21 file aset telah diperiksa tidak kosong.
- Alur: tombol buka/fokus, kalender dengan waktu UTC setara 09.00 WITA dan folding UTF-8, Maps, status audio, input wajib, radio, pratinjau lokal, restore/hapus draf, escaping HTML, waktu lewat acara, reduced motion, storage ditolak, dan retry gambar lulus.
- Perbaikan hasil uji: WebKit menyimpan kegagalan gambar pada cache; retry memakai URL lokal baru dan sumber asli. Tinggi bingkai tetap stabil.
- Perbandingan Figma pada lebar 390 px: awal bagian RSVP di implementasi y≈3958 px, referensi y≈3955 px. Perbedaan bagian bawah disengaja untuk penanda mode pratinjau, contoh ucapan, dan ukuran target sentuh. Tidak mengklaim pixel-perfect.
- Screenshot: `design-reference/figma-168-284.png`; hasil browser di `test-results/chromium-390.png`, `test-results/chromium-1440.png`, serta padanannya untuk WebKit. Screenshot referensi tidak dirender sebagai halaman.
- Database/migration: tidak ada. Data form hanya draf perangkat; contoh ucapan bukan data tamu nyata.
- Layanan nyata/deployment: belum dilakukan. Server produksi lokal aktif pada http://127.0.0.1:3000 saat serah terima. Tidak ada binding ke LAN.
- Batas pengujian: belum perangkat iPhone/Android fisik, uji koneksi lambat terukur, integrasi cloud, atau validasi alamat/pin Maps asli. Audio aktual belum tersedia untuk diuji.
- Berikutnya bila dibutuhkan: konfirmasi konten final, pin lokasi, file audio berizin, kemudian pilih backend RSVP dan target hosting.

## Sumber
- Figma: https://www.figma.com/design/PkXP1ZtBxl60N5PC2BlTqy/Undangan-Digital---Fisik?node-id=168-284
- Next.js: https://nextjs.org/docs/app/getting-started/installation

## 2026-10-04 — Revisi cover, identitas, jadwal, dan foto
- [x] Pisahkan `/` sebagai cover dan `/undangan` sebagai isi; tombol Buka Undangan memakai navigasi Next.js.
- [x] Nama Muhammad Al-Habsy Mulfi; orang tua Bapak Mulfi Akil dan Ibu Isniani. Hapus klaim hafalan dan keterangan pembacaan Juz 'Amma.
- [x] Konfirmasi konflik tanggal: pengguna memilih **Jumat, 9 Oktober 2026 pukul 19.00 WITA**, menggantikan permintaan awal 10 Oktober (Sabtu).
- [x] Sinkronkan hari/tanggal, countdown, metadata, dan kalender dari konfigurasi jadwal yang sama.
- [x] Ubah tempat/alamat dan pencarian Maps ke Hotel Grand Puri Perintis. Hapus patokan masjid lama.
- [x] Gunakan kedua foto dari `Asset gambar/`; pertahankan file asli dan proporsi potret. Pemetaan ada di `design-reference/photo-sources.json`.
- [x] Verifikasi build dan browser setelah revisi, termasuk navigasi/refresh/back, kedua foto, kalender, dan layout responsif.
- Hasil: typecheck dan production build lulus; **16/16 tes Playwright lulus** di Chromium dan WebKit pada build produksi. Kedua halaman diuji pada lebar 320/390/430/768/1440 px.
- Kalender diverifikasi menggunakan `DTSTART:20261009T110000Z` (19.00 WITA); nama, venue, dan waktu di file kalender sesuai undangan.
- Kedua foto di `public/images/` identik dengan file yang diberikan pengguna (SHA-256 dibandingkan); rasio foto keluarga dipertahankan supaya semua wajah terlihat. Screenshot profil dan keluarga sudah ditinjau.
- Saat pengujian multi-viewport ada satu permintaan optimasi foto 640 px tersangkut pada server lokal. Server dihidupkan ulang dan tes mengakhiri dokumen lama sebelum resize; seluruh pengujian ulang lulus. Tidak mengubah aset untuk menghindari pengujian.
- Pratinjau terbaru aktif pada http://127.0.0.1:3000 (cover), isi pada `/undangan`. Dokumentasi README dan script visual-audit sudah mengikuti rute baru.
- Batas scope: RSVP tetap pratinjau lokal, audio belum diberikan, dan tidak ada deployment.

## 2026-10-04 — Desain ulang menjadi tujuh sesi
- [x] Hilangkan ikon pada Buka Undangan; pertahankan cover sebagai halaman tersendiri.
- [x] Awali isi dengan bismillah, Assalamu’alaikum Warahmatullahi Wabarakatuh, dan paragraf undangan sebelum profil.
- [x] Tujuh section semantik: 01 salam/pembuka + profil; 02 waktu/tempat; 03 countdown/lokasi; 04 foto keluarga; 05 tanda kasih/rekening; 06 doa/penutup; 07 RSVP/buku tamu.
- [x] Desain editorial dengan penanda nomor, garis tipis, ruang antarbagian, warna latar berbeda; sesi waktu berwarna hijau tua, keluarga krem hangat, rekening hijau lembut. Pertahankan ornamen, font, foto, dan nuansa awal.
- [x] Hapus UI dan implementasi kalender; pisahkan logika countdown ke `src/lib/countdown.ts`.
- [x] Tambahkan `BankDetails` dan konfigurasi `bankAccounts`; tanpa data rekening, tampilkan informasi belum tersedia, tanpa nomor/tombol palsu. Nama bank, nomor, dan nama pemilik telah ditanyakan dan belum diterima.
- [x] Typecheck, build produksi, serta **18/18 pengujian Chromium dan WebKit lulus**, mencakup tujuh sesi, kedua rute, isi, responsivitas 320/390/430/768/1440, countdown, form, dan foto.
- [x] Screenshot tujuh sesi di `test-results/visual/` ditinjau. Tidak ada horizontal overflow; teks salam dan keterangan orang tua terbaca, proporsi foto tetap terjaga.
- File utama: `src/app/undangan/page.tsx`, `globals.css`, `session-heading.tsx`, `bank-details.tsx`, `invitation-interactions.tsx`, `src/config/event.ts`, pengujian, script visual, dan README.
- Masih diperlukan: detail rekening dari pemilik. Backend RSVP, audio, deployment, dan uji perangkat fisik berada di luar revisi ini.

## 2026-10-04 — Hilangkan label sesi
- Hapus nomor 01–07, garis judul, dan label sesi dari semua bagian beserta komponen/CSS yang tidak terpakai.
- Pertahankan pengelompokan semantik; perjelas bagian hanya melalui warna, komposisi, dan jarak 48 px. Pembuka memakai jarak atas 40 px.
- Typecheck dan build produksi lulus; pemeriksaan bagian tanpa label lulus di Chromium dan WebKit (2 tes terarah).
- Pratinjau lokal disegarkan; tidak ada perubahan data acara atau deployment.

## 2026-10-04 — Tautan lokasi Maps dari pemilik
- Ganti URL pencarian dengan `https://maps.app.goo.gl/CvDZMgdMPjiECkdp7` pada konfigurasi bersama untuk penanda lokasi dan tombol Maps.
- Sesuaikan label aksesibel, dokumentasi, dan ekspektasi tes URL. Typecheck dan build produksi lulus; pratinjau lokal disegarkan.

## 2026-10-04 — Kartu rekening contoh
- Kartu rekening krem dengan radius 12 px, border emas tipis, ornamen geometris samar, dan tipografi hijau sesuai undangan.
- Placeholder atas permintaan: BANK XXX, xxxxxxxxxxxx, atas nama xxxxxxxxx. Ditandai contoh; salin nonaktif hingga data asli diisi.
- Typecheck dan build produksi lulus; screenshot bagian rekening ditinjau pada lebar 390 px. Pratinjau lokal disegarkan.

## 2026-10-04 — Musik dari folder Sound
- Salin MP3 Mawlaya — Maher Zain dari folder Sound tanpa modifikasi ke public/audio/mawlaya.mp3 (2.485.584 byte); hash identik.
- Hubungkan ke event.musicUrl. Musik mulai melalui klik Buka Undangan, volume awal 35%, berulang, dapat dijeda/dilanjutkan, dan dijeda ketika kembali ke cover. Tautan langsung ke isi undangan menyediakan tombol putar manual.
- Label kontrol menjadi Putar/Jeda musik; kegagalan pemuatan dapat dicoba ulang.
- Typecheck dan build produksi lulus. Dua tes pemutaran aktual di Chromium/WebKit lulus: waktu audio bergerak, jeda/lanjut, atribut loop, serta jeda saat kembali ke cover.
- Pratinjau lokal disegarkan. Tidak ada deployment atau pengujian perangkat fisik.

## 2026-10-04 — Pembaruan musik dan database Supabase
- [x] Musik baru 2.430.433 byte disalin identik dari Sound. Hash sumber berubah; URL audio diberi versi hash, volume dinaikkan dari 35% ke 100%.
- [x] Koneksi dan akses CLI ke proyek habsy-invitation-letter diverifikasi. Secret hanya di environment server .env.local (600), tidak ada di bundle browser.
- [x] Migration 202610040001_guestbook.sql diterapkan melalui SQL langsung: invitation_responses, RLS/revoke anon/authenticated, RPC khusus server, bucket rate-limit HMAC, idempotensi UUID. Ledger CLI migration belum direkam; file tidak boleh diterapkan ulang pada database yang sama.
- [x] API GET/POST /api/guestbook dan UI RSVP nyata menggantikan pratinjau. Draf opsional, pending/sukses/error/retry, honeypot, ukuran payload, origin dan validasi server. Data hanya diklaim tersimpan setelah RPC sukses.
- [x] Persetujuan publik opsional; ucapan baru pending, hanya approved tampil. RSVP pribadi tidak masuk feed. Contoh ucapan tidak lagi ditampilkan.
- [x] Typecheck dan build produksi lulus. 14 tes tampilan/audio lulus; 6 tes RSVP/API lulus setelah memperbaiki APP_ORIGIN localhost dan selector tes status yang sebelumnya memilih status kartu bank.
- [x] Integrasi cloud nyata lulus: insert/read, replay satu baris, konflik, pending tersembunyi, approved terlihat tanpa attendance/request ID, rate limit, larangan anonymous select/insert/RPC. Baris uji dibersihkan; bucket uji kedaluwarsa 10 menit.
- [x] README berisi cara mengelola balasan dan moderasi dari Table Editor; sumber API resmi Supabase diperiksa.
- Batas: form publik dengan nama self-report, bukan identitas terverifikasi atau undangan bertoken; belum ada admin/login, frontend deployment, maupun pengujian perangkat fisik. Hosting nantinya memerlukan APP_ORIGIN dan konfigurasi trusted proxy. Tidak ada pesan yang dikirim ke tamu.

## 2026-10-04 — Animasi undangan dan panel admin
- [x] Ubah teks profil menjadi “Putra ke-dua dari Bapak Mulfi Akil & Ibu Isniani”.
- [x] Tambahkan fade/translate 750 ms saat cover/bagian undangan masuk viewport, sekali per bagian. Reduced motion menonaktifkan/membatalkan animasi; konten tidak disembunyikan permanen. Audio dijeda saat meninggalkan halaman isi, termasuk admin.
- [x] Panel /admin responsif: login Supabase Auth, ringkasan RSVP, cari nama, filter, pagination, moderasi tampil/sembunyi/tinjau ulang, logout. Tidak ada penghapusan balasan lewat UI.
- [x] API admin memverifikasi Auth dan app_metadata role di setiap permintaan; cookie HttpOnly/SameSite Strict maksimal 1 jam, Secure untuk HTTPS, origin pada mutasi, no-store, ukuran body terbatas. Token tidak disimpan pada localStorage; tidak ada secret pada bundle browser.
- [x] Migration 202610040002_admin.sql diterapkan via SQL langsung: RPC moderasi memeriksa role di auth.users, izin tamu, audit atomik. Tetap tanpa akses tabel/RPC untuk anon/authenticated.
- [x] Typecheck dan build final berhasil. Regresi awal 19/20 lulus; satu assert WebKit berbeda 0,00003 px akibat animasi, diperbaiki memakai toleransi 0,01 px. Empat tes terarah foto/animasi kemudian lulus pada Chromium dan WebKit; termasuk reduced motion.
- [x] Integrasi admin cloud nyata lulus: akun admin/biasa sementara, login UI, GET/PATCH ditolak untuk non-admin yang sudah login, pencarian, publish/hide, pembatasan consent, origin, audit, HttpOnly, logout. Akun/baris uji dibersihkan. Screenshot desktop/390px ditinjau; tombol Keluar diperbaiki agar tidak terbelah baris.
- [x] Script create-admin dan dokumentasi disiapkan; kredensial hanya ke file lokal berizin 600 dan diabaikan Git. Tidak ada email dikirim.
- [ ] Akun pengelola sebenarnya menunggu alamat email pemilik (pertanyaan sudah dikirim). Panel sudah siap, belum ada kredensial akun permanen.
- Batas: belum deployment frontend, reset password UI, refresh session otomatis, atau pengujian perangkat fisik. Moderasi diterapkan ke cloud; pratinjau terbaru berjalan lokal. Ledger CLI migration tetap belum dicatat karena migration diterapkan via SQL langsung.

## 2026-10-05 — Desain admin mengikuti referensi pemilik
- Header identitas di kiri dan akses akun di kanan; login memakai kartu tengah. Dashboard memakai kartu statistik terpisah, panel balasan berbingkai, label pencarian terlihat, dan tombol outline.
- Palet krem/hijau undangan dipertahankan. Empat statistik memakai data yang tersedia; perubahan hanya presentasi, tanpa menambah fitur/database atau data contoh permanen.
- Typecheck dan build produksi lulus. Screenshot login/dashboard lebar 390 dan 1440 px ditinjau memakai mock lokal; tidak ada overflow horizontal. Backend dan autentikasi tidak berubah.
- Selector judul pada script pemeriksaan admin disesuaikan. Pratinjau lokal disegarkan. Akun permanen tetap menunggu email pemilik; tidak ada deployment.

## 2026-10-05 — Perbaikan akses login pemilik
- Environment server lengkap dan koneksi Auth HTTP 200. Akun pemilik sudah terkonfirmasi tetapi belum memiliki app_metadata.invitation_role.
- Berikan invitation_role=admin ke akun pemilik yang sudah ada; metadata lainnya dipertahankan. Verifikasi ulang API memastikan role admin aktif. Password tidak diubah; tidak mengirim email.
- Tidak ada perubahan kode aplikasi atau build yang diperlukan. Login dengan password pemilik belum diuji karena password tidak dimiliki agen; gunakan password akun yang sudah dibuat pada /admin melalui origin 127.0.0.1:3000.

## 2026-10-05 — Animasi lebih lambat dan hapus rekening
- Durasi animasi masuk diubah dari 750 menjadi 1.500 ms dengan easing lebih bertahap; reduced motion tetap didukung.
- Hapus bagian Tanda kasih/rekening dari halaman undangan, sehingga tersisa enam bagian. Sesuaikan tes, dokumentasi, dan script screenshot.
- Typecheck dan build produksi berhasil; empat tes terarah di Chromium/WebKit lulus. Pratinjau lokal diperbarui.

## 2026-10-05 — Durasi animasi 2 detik
- Sesuai permintaan, ubah durasi dari 1.500 ke 2.000 ms; easing tetap sama.
- Build produksi berhasil dan pratinjau lokal diperbarui.

## 2026-10-05 — Tambah tamu, jatah dan tautan undangan pribadi
- [x] Tab Daftar tamu / Ucapan & doa; form tambah nama/jatah 1–20, pencarian/pagination 25 penerima, lihat/salin tautan, cabut akses dengan konfirmasi, rekap aktif/belum menjawab/jumlah orang.
- [x] Migration 202610050001_guests.sql diterapkan langsung melalui SQL: invitation_guests terlindungi RLS, FK/unique guest_id pada responses, party_size, RPC upsert dengan row lock/quota/revocation/rate limit serta statistik tamu aktif. Balasan lama dipertahankan.
- [x] Token acak 32 byte, SHA-256 lookup, AES-256-GCM ciphertext dan AAD ID/version. GUEST_TOKEN_KEY dibuat hanya di env server. Secret dan key tidak ditemukan di bundle browser.
- [x] Nama penerima tampil pada cover, token dipertahankan saat buka undangan. Form pribadi mengunci nama, menghitung jumlah hadir, menampilkan balasan tersimpan dan bisa diperbarui. Ucapan berubah kembali pending. Halaman umum tetap berjalan tanpa token; token tidak valid/dicabut tidak jatuh ke form umum.
- [x] Typecheck/build produksi berhasil. Semua 22 tes Chromium/WebKit lulus untuk regresi undangan/form/audio/animasi.
- [x] Integrasi Supabase nyata via scripts/check-guests.mjs lulus: admin-only create/list, penolakan akun biasa, create replay, pencarian, link stabil, daftar tanpa token, personalisasi cover, navigasi, submit nyata, quota enforcement, upsert satu baris, moderation reset, revocation resolve/submit, anon ditolak. Data/akun uji dibersihkan.
- [x] Tampilan desktop/390px ditinjau dan tidak overflow. Script pemeriksaan admin disesuaikan untuk tab Ucapan & doa. Dokumentasi penggunaan dan konfigurasi deployment ditambahkan.
- Batas: tautan masih localhost karena frontend belum dipublikasikan. Tidak mengirim undangan ke siapa pun. Edit identitas/jatah, rotasi token, ekspor CSV belum dibuat; scope ini fokus tambah tamu/link/RSVP. Ledger migration tetap belum direkam karena penerapan langsung SQL.


## 2026-10-05 — Konfigurasi OpenNext dan GitHub Actions
- [x] OpenNext Cloudflare 1.20.8 dan Wrangler 4.147.0 dikunci di package/lockfile; konfigurasi Worker zaldy1003ii, assets, images dan self-reference tersedia.
- [x] Workflow main/manual: validasi secrets/variables, npm ci, build OpenNext, typecheck, deploy dan sinkronisasi binding runtime. Secret tidak diberikan pada langkah build.
- [x] Wrapper build melindungi env lokal dari embedding artifact; scan nilai secret Supabase dan guest key pada output build tidak menemukan kecocokan. Env lokal dipulihkan.
- [x] Typecheck, build OpenNext, dan wrangler deploy --dry-run lulus; bundle gzip sekitar 1 MB. Tidak melakukan deployment publik.
- [x] Runtime workerd lokal: halaman cover/undangan/admin HTTP 200, API admin tanpa sesi 401, baca ucapan Supabase 200, foto dan optimasi gambar 200. Audio merespons 200; pemeriksaan browser playback tambahan belum selesai karena alat approval terkena batas penggunaan.
- [x] Dokumentasi repository secrets/variables dan pemicu Actions ditambahkan.
- [ ] Pemilik mengisi konfigurasi GitHub dan push main, kemudian memeriksa workflow/deployment publik. Login dan RSVP produksi perlu diperiksa setelah hosting aktif.
