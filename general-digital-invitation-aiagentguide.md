# Build Guide AI Agent — General Digital Invitation

Versi: 1.0 · 4 Oktober 2026 · Bahasa: Indonesia

Dokumen mandiri untuk undangan ulang tahun, seminar, gathering, reuni, peluncuran produk, syukuran, wisuda, acara komunitas dan acara lain. Menggunakan pola teknis yang telah dibangun pada proyek undangan wedding sebagai referensi, tetapi model konten harus digeneralisasi. Tidak memerlukan dokumen wedding untuk digunakan.

## 1. Cara memulai sesi baru

Berikan instruksi berikut kepada AI agent:

> Baca general-digital-invitation-aiagentguide.md dan aturan repository. Identifikasi jenis acara, audiens, cara akses dan fitur yang diperlukan. Audit proyek sebelum mengubahnya. Buat PLAN_PRODUCTION.md dengan checklist, keputusan dan log setiap tahap. Bangun frontend, backend dan admin sesuai scope, uji akses serta alur nyata, lalu siapkan hosting. Jangan membawa konten wedding, data klien atau secret dari proyek referensi. Bedakan fitur yang diimplementasikan dari rencana.

Urutan fase: brief dan scope → model konten → UI → media/performa → database/API → admin → pengujian → deployment → operasional. Gunakan static-only bila tidak perlu menyimpan balasan; jangan membuat database/admin tanpa kebutuhan. Jika memakai RSVP pribadi, ikuti desain token dan backend dalam panduan ini.

## 2. Brief acara umum dan keputusan produk

| Pertanyaan | Dampak teknis |
|---|---|
| Acara apa dan untuk siapa? | Tone, susunan konten, tema dan kebutuhan aksesibilitas |
| Publik atau penerima tertentu? | Landing page umum vs token undangan pribadi |
| RSVP atau registrasi terbuka? | Daftar tamu terdaftar vs pendaftaran identitas baru |
| Ada kapasitas total/sesi? | Transaksi reservasi kursi dan batas per sesi |
| Online, offline atau hybrid? | Maps, join URL, zona waktu dan perlindungan link meeting |
| Ada beberapa hari/sesi? | Relasi event_sessions, bukan satu timestamp saja |
| Perlu pembayaran/check-in? | Scope integrasi baru, bukan fitur template bawaan |
| Pengelola satu atau tim? | Role/membership acara dan audit perubahan |
| Ada anak atau data sensitif? | Minimalkan data, batas akses, persetujuan dan retensi |
| Siapa memperbarui konten? | Konfigurasi statis vs CMS dengan draft/preview/publish |

Pilih mode dengan sengaja:

- **Informasi saja:** halaman statis dan kontak; tanpa pengiriman data palsu.
- **Undangan pribadi + RSVP:** token per penerima; cocok dengan baseline panduan.
- **Registrasi publik:** peserta membuat pendaftaran baru; memerlukan anti-spam, deduplikasi, kebijakan identitas dan verifikasi bila dibutuhkan. Jangan membuka tabel guests untuk anonymous insert.
- **Tiket/check-in:** token RSVP bukan otomatis tiket sekali pakai. Perlu record ticket, scan atomik, pencegahan replay dan role petugas.
- **Berbayar:** perlu payment provider, webhook terverifikasi, idempotensi dan rekonsiliasi. Jangan menganggap bukti unggah gambar sebagai pembayaran terkonfirmasi.

Contoh model konten generik:

```ts
type EventContent = {
  slug: string;
  title: string;
  hostName: string;
  description: string;
  timezone: string;
  mode: 'offline' | 'online' | 'hybrid';
  sessions: Array<{
    id: string; title: string; startsAt: string; endsAt?: string;
    venue?: string; address?: string; mapsUrl?: string;
  }>;
  sections: Array<{ type: string; enabled: boolean }>;
  musicUrl?: string;
};
```

Join URL privat jangan dimasukkan ke konfigurasi publik jika hanya boleh dibaca peserta tertentu. Ambil dari endpoint yang memverifikasi akses. Untuk multi-sesi, buat tabel/constraint relasional; jangan menjejalkan seluruh logika kapasitas ke JSON frontend.

Susunan default: cover/hero → tujuan acara → host/pembicara bila ada → agenda → waktu/lokasi/join → informasi peserta → RSVP/registrasi → FAQ/kontak → penutup. Musik dan dekorasi romantis bukan default seminar; pilih sesuai konteks. Hindari mewariskan ayat, rekening, istilah mempelai atau ikon hati dari template wedding.

Checklist konten:

- [ ] Judul/host/tanggal/timezone konsisten di semua halaman dan pesan.
- [ ] Lokasi/join URL benar dan sesuai kebijakan akses.
- [ ] Sesi, kapasitas dan batas pendaftaran jelas.
- [ ] Field form hanya meminta informasi yang diperlukan.
- [ ] Admin mengetahui apakah perubahan konten live langsung atau perlu publish.
- [ ] Pesan berhasil menjelaskan status nyata: terdaftar, menunggu, atau dikonfirmasi.
- [ ] Scope pembayaran/check-in/registrasi terbuka ditandai terpisah jika belum dibangun.

Untuk registrasi berkapasitas global, pengecekan “kursi tersisa” dan insert harus atomik di database. Limit per tamu dari baseline tidak cukup mencegah total peserta melebihi kapasitas. Untuk tim pengelola, gunakan membership/roles dan uji izin per aksi, bukan menghapus filter owner secara umum.

## 3. Aturan kerja AI agent dan kesinambungan sesi

1. Baca AGENTS.md, package.json, konfigurasi build, migration dan log terbaru sebelum mengubah proyek. Jangan berasumsi semua script dalam panduan ini sudah ada pada proyek baru.
2. Jalankan `git status --short`. Pertahankan perubahan pengguna; jangan reset, overwrite, atau memasukkan perubahan yang tidak terkait ke commit.
3. Buat `PLAN_PRODUCTION.md` sejak awal. Setiap tahap memiliki checkbox, hasil yang diharapkan, bukti verifikasi dan pekerjaan tersisa.
4. Baca kode ketika dokumentasi bertentangan. Dokumen proyek referensi memiliki bagian status historis; status “belum ada cloud” pada dokumen lama tidak membatalkan log deployment yang lebih baru.
5. Gunakan placeholder pada dokumentasi. Jangan menyalin email/password pengelola, secret server, token tamu nyata, rekening klien lama, atau URL project klien lama ke template baru.
6. Jangan menyatakan selesai berdasarkan keberadaan kode saja. Bedakan: selesai lokal, lulus integrasi cloud development, deployed, dan lulus pemeriksaan production.
7. Selesaikan perubahan beserta verifikasi yang relevan. Beri tahu pengguna bila akses akun atau tindakan dashboard masih diperlukan; jangan mengklaim telah melakukannya.
8. Pembelian domain, pengiriman undangan, penghapusan data, pergantian key, dan pemindahan kepemilikan memerlukan otorisasi sesuai konteks. Jangan mengirim pesan ke tamu hanya karena fitur berbagi tersedia.
9. Akhiri sesi dengan log: file berubah, migration baru, target deployment, tes beserta keterbatasan, langkah berikutnya, dan pertanyaan terbuka. Jangan menulis nilai rahasia dalam log.

Template log:

```markdown
### YYYY-MM-DD — Judul tahap
- Tujuan:
- Implementasi/file:
- Database/migration:
- Verifikasi lokal:
- Verifikasi layanan nyata:
- Deployment frontend/backend:
- Keterbatasan atau blocker:
- Langkah berikutnya:
```

## 4. Arsitektur dan batas produk

```text
Tamu → frontend React/Vite di Cloudflare Workers Static Assets
     → Supabase Edge Function invitation-api
     → RPC sempit → PostgreSQL

Pengelola → halaman ?admin → Supabase Auth
          → SDK + RLS/RPC pengelola
          → Edge Function khusus pembuatan/rotasi link

GitHub main → GitHub Actions → build dist → Cloudflare
Migration + secret + Edge Function → deployment Supabase terpisah
```

Frontend statis tidak menyimpan database. Cloudflare menyajikan HTML, CSS, JavaScript, gambar dan musik. Supabase menyimpan acara, penerima, balasan dan autentikasi. Mengunggah ZIP atau push frontend tidak otomatis menerapkan SQL maupun memperbarui Edge Function.

Mulai dari satu acara/satu pemilik bila itu kebutuhan sebenarnya. RLS tetap membatasi owner sebagai fondasi isolasi. Multi-tenant SaaS, pembayaran, kuota per klien, operator lintas acara, CMS visual, ticketing, check-in dan pengiriman massal adalah scope tambahan, bukan fitur yang sudah otomatis tersedia.

Untuk sekitar 1.000 undangan, jumlah baris relatif kecil; kapasitas tetap ditentukan pola request, concurrency, ukuran media dan batas paket layanan. Jangan menyamakan 1.000 penerima dengan 1.000 pengguna serentak atau mengklaim kapasitas tanpa uji beban.

## 5. Bootstrap proyek dan inventaris file

Baseline referensi: React 19, Vite 8, TypeScript, Tailwind CSS 4, Node 22 dan pnpm 10.34.3. Ini versi proyek referensi, bukan instruksi untuk selalu memakai versi tersebut selamanya. Saat memulai proyek baru, pilih versi yang kompatibel, periksa dukungan runtime, kemudian kunci dependency dengan lockfile. CI dan lokal harus menggunakan toolchain yang sama.

Jika menggunakan ulang repository, hapus identitas/data acara lama secara terarah, ganti remote ke repository baru, gunakan Worker dan Supabase milik target baru, lalu tinjau migration dan secret. Jangan menghubungkan template ke database pelanggan sebelumnya untuk mencoba fitur.

Peta referensi:

| Lokasi | Tanggung jawab |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entry, pemilihan admin/undangan, komposisi section |
| `src/index.css`, `src/cover.css` | Token visual, tipografi, layout, animasi |
| `src/InvitationCover.tsx` | Cover dan transisi pembukaan |
| `src/assets.ts` | Manifest aset dan kandidat responsive |
| `src/PhotoReveal.tsx` | Decode, viewport, reveal, fallback foto |
| `src/useInvitationWarmup.ts` | Persiapan aset selama cover |
| `src/useGoldGlow.ts`, `src/useSectionMotion.ts` | Glow dan pengendalian animasi section |
| `src/WeddingMusic.tsx` | Musik dan kontrol; boleh digeneralisasi namanya |
| `src/invitationApi.ts`, `src/useInvitationGuest.ts` | Parsing link, API, identitas tamu |
| `src/InvitationResponses.tsx` | RSVP dan ucapan |
| `src/admin/` | Login, daftar tamu, ringkasan, moderasi, ekspor |
| `public/optimized/`, `public/audio/` | Aset runtime yang memang boleh publik |
| `supabase/migrations/` | Schema dan aturan akses berversi |
| `supabase/functions/invitation-api/` | Handler HTTP, gateway, crypto |
| `scripts/` | Build packaging, optimasi, pengujian dan setup |
| `.github/workflows/`, `wrangler.jsonc` | CI dan deployment frontend |

Pada proyek baru, pisahkan konten ke modul bertipe, misalnya `src/config/event.ts`. Validasi nama, zona waktu, jadwal, lokasi, link Maps, tema dan rekening di satu tempat. Implementasi referensi masih mempunyai konten hardcoded; membuat CMS membutuhkan pekerjaan tambahan. Jangan menganggap update baris events akan mengubah semua teks desain.

Tailwind v4 memakai `@tailwindcss/vite` dan `@import 'tailwindcss';` pada entry CSS. Tidak perlu menambahkan konfigurasi Tailwind/PostCSS versi lama tanpa alasan. Pertahankan alias bundler dan TypeScript secara konsisten; `paths` dapat memakai `./src/*` tanpa `baseUrl` bila konfigurasi mendukung. Jangan sekadar membungkam deprecation TypeScript tanpa menilai migrasinya.

## 6. Sistem desain dan konfigurasi tampilan

### 6.1 Dari referensi ke implementasi

- Inventaris setiap section, ukuran frame, jarak, susunan teks, ornamen, warna dan jenis font sebelum coding.
- Bandingkan screenshot pada viewport dan skala yang sama. Bedakan salah crop, salah proporsi section dan salah posisi konten.
- Buat token CSS untuk background, permukaan, warna teks, accent, border, shadow, radius, container dan spacing.
- Gunakan skala jarak yang konsisten, misalnya 8/12/16/24/32/48/64 px, dengan `clamp()` bila perlu. Nilai akhir mengikuti desain; jangan menerapkan margin berbeda-beda tanpa pola.
- Pisahkan padding section, gap antar elemen, dan ruang dekorasi. Hindari `min-height: 100vh` pada setiap section jika menyebabkan ruang kosong jauh lebih tinggi dari referensi.
- Uji 320, 390, 430, 768 dan 1440 px. Periksa teks panjang, zoom, landscape dan perangkat dengan safe area.

### 6.2 Teks, kontras dan clipping

Gunakan serif dekoratif untuk judul, sans-serif terbaca untuk isi, dan font Arab yang mendukung tanda baca bila dibutuhkan. Simpan font dengan lisensi yang sesuai; gunakan WOFF2, fallback dan `font-display` yang disengaja.

Emas di atas krem/putih harus lebih gelap daripada emas pada marun. Jangan memakai titik gradient hampir putih pada teks kecil. Targetkan kontras teks normal 4,5:1 dan teks besar 3:1, lalu cek hasil render sebenarnya. Uji fase paling terang animasi, bukan hanya warna statis.

Huruf `g`, `y`, `p`, `j` terpotong biasanya terkait tinggi baris, height tetap atau ancestor `overflow:hidden`. Perbaiki `line-height`, beri ruang descender, lepaskan fixed height, dan batasi clipping hanya pada layer gambar. Pada teks gradient dengan `background-clip:text`, sediakan padding vertikal seperlunya dan uji font asli setelah load. Jangan mengatasi clipping hanya dengan mengecilkan font.

### 6.3 Foto, ornamen dan motion

- Frame memiliki rasio stabil sebelum gambar datang; foto memakai `object-fit:cover` dan `object-position` per foto.
- Tentukan focal point untuk subjek. Posisi 50% tidak selalu membuat pasangan tampak di tengah; crop contoh lama 44% tidak boleh disalin sebagai aturan semua foto.
- Border gradient dibuat di wrapper/pseudo-element, gambar di inner mask. Dekorasi yang keluar frame berada pada wrapper yang tidak terpotong.
- Pisahkan layer transform reveal, floating dan crop agar satu animasi tidak menimpa transform lainnya.
- Reveal foto menunggu dua syarat: gambar siap/decode dan frame masuk viewport. Jangan membuat foto visible sejak mount lalu mengandalkan efek yang terlambat.
- Reveal sekali; scrolling keluar layar tidak perlu menghilangkan konten lagi.
- Glow emas memakai perubahan opacity/brightness ringan dengan durasi, delay dan titik terang bervariasi. Hindari sweep seragam kiri-ke-kanan untuk semua elemen. Variasi dipilih sekali per elemen, bukan random setiap render.
- Floating lembut dapat mulai dari translasi beberapa piksel dan rotasi kecil berdurasi beberapa detik; sesuaikan skala visual. Jangan menggerakkan teks/form sehingga sulit dibaca atau diklik.
- Jeda loop ketika section jauh di luar viewport. Hormati `prefers-reduced-motion`; seluruh konten tetap terbaca tanpa animasi.
- Dekorasi noninteraktif memakai `pointer-events:none` dan alt kosong/aria-hidden sesuai jenisnya.
- Ikon kalender menggunakan SVG proporsional, posisi relatif pada sel tanggal, angka tepat di tengah dan kontras cukup. Jangan menyesuaikan posisi dengan spasi teks.

## 7. Loading, performa dan musik

### 7.1 Aset dan pembukaan

1. Simpan sumber asli terpisah; optimasi foto ke WebP/AVIF bila sesuai dengan fallback yang teruji. Pertahankan alpha dekorasi.
2. Buat kandidat responsive, contoh lebar 640/960/asli. `sizes` harus menggambarkan ukuran render termasuk crop, bukan asal memilih kandidat terkecil.
3. Prioritaskan cover. Setelah resource penting cover selesai, lakukan warmup isi saat idle dengan concurrency terbatas, misalnya dua gambar.
4. Dahulukan foto/ornamen section pertama, baru foto lain dan font tambahan. Jangan mengunduh semua media sekaligus sebagai syarat membuka undangan.
5. Warmup mempunyai timeout dan tidak mengunci tombol Buka. Browser bisa membuang decoded image; cek `decode()` pada elemen nyata juga.
6. Render ukuran frame tetap saat loading. Tangani fallback sumber, timeout, pesan gagal dan tombol retry.
7. Pisahkan chunk admin agar tamu tidak mengunduh SDK/dashboard di awal.
8. Ukur cold cache, jaringan lambat dan klik Buka sangat cepat. Catat ukuran transfer, error, layout shift dan waktu tampil; bukan hanya ukuran ZIP.

Pada salinan referensi, `python3 scripts/optimize_assets.py` membutuhkan dependency di `scripts/requirements-assets.txt`. Build biasa memakai aset hasil optimasi yang sudah tersedia, tidak memerlukan proses Python. Jika mengganti file sumber, perbarui manifest dan audit dimensi/crop.

### 7.2 Musik on/off

- Gunakan media yang diizinkan untuk digunakan dan dibagikan pada website.
- Simpan runtime audio di `public/audio/`; jangan mengandalkan jalur file dari laptop.
- Panggil `audio.play()` langsung dari gesture tombol Buka. Pemanggilan setelah timeout animasi bisa kehilangan izin autoplay.
- Gunakan `preload='none'` bila audio tidak diperlukan sebelum interaksi, loop bila sesuai, dan volume awal moderat.
- Tangani Promise play yang ditolak, file gagal dan retry; musik gagal tidak boleh menghalangi isi.
- Toggle pause/resume mempertahankan `currentTime`; label aksesibel berubah mengikuti status.
- Tombol terlihat di mobile, tidak menutup form/tombol lain, dan tidak ikut clip frame.
- Jangan memutar musik di admin. Uji Safari iPhone dan Android fisik; dukungan volume programatis berbeda antar browser.

## 8. Model data, akses dan integritas

| Entitas referensi | Isi utama | Aturan |
|---|---|---|
| `events` | owner_id, slug, nama, starts_at, timezone, venue, status | draft/published/archived; slug unik |
| `guests` | event_id, display_name, max_party_size, revoked_at | Nama boleh sama; identitas memakai ID |
| `rsvps` | guest_id, attendance, party_size | Satu baris per tamu; upsert |
| `wishes` | guest_id, snapshot nama, pesan, status | Pending/approved/rejected; edit kembali pending |
| `private.guest_tokens` | hash, ciphertext, key_version | Tidak diekspos ke browser/tabel publik |
| `private.guest_link_aliases` | alias_hash, guest_id, token_hash | Alias pendek terikat token aktif |
| `private.api_rate_limits` | bucket HMAC dan window counter | Tidak menyimpan token/IP mentah |

Skema referensi menggunakan nama kolom wedding. Untuk undangan umum, ganti menjadi model event generik melalui migration dan perubahan kontrak yang konsisten; jangan hanya mengganti label UI.

Validasi schema: nama maksimum 160 karakter, ucapan 1.000 karakter, jatah referensi 1–20, RSVP hadir antara 1 dan jatah, berhalangan tepat 0. Ini keputusan produk yang dapat disesuaikan. Jangan menerima nama/guest_id dari tamu sebagai sumber otoritas; token menentukan identitas.

Waktu disimpan sebagai `timestamptz`; zona tampilan memakai identifier IANA, misalnya `Asia/Makassar`. Jangan mengandalkan zona laptop untuk countdown atau jam acara. Jumlah RSVP “undangan hadir” berbeda dari jumlah “orang hadir”.

Matriks akses wajib:

| Pelaku | Izin |
|---|---|
| Anon langsung ke tabel | Tidak membaca daftar tamu, RSVP, material token |
| Tamu melalui API | Hanya data terbatas dan balasan milik token valid |
| Pengelola login | Hanya acara miliknya melalui RLS dan grant terbatas |
| Server privileged | RPC sempit setelah Auth/token tervalidasi |

Aktifkan RLS dan uji dengan dua akun nyata. Server service role melewati RLS sehingga handler wajib memverifikasi ownership sendiri. Untuk SECURITY DEFINER, gunakan search_path aman dan schema eksplisit; cabut execute PUBLIC/anon/authenticated pada RPC server-only. Jangan expose schema private di Data API.

Cegah pemindahan owner/event/guest secara tidak sengaja, enforce FK, constraint, indeks dan uniqueness. Gunakan transaksi/locking untuk validasi jatah dan status acara. Moderasi/edit admin sebaiknya memakai optimistic concurrency dengan updated_at agar data baru tidak tertimpa.

Migration yang telah diterapkan tidak diedit untuk mengubah production: buat migration berikutnya. Uji dari database kosong dan upgrade schema existing. Jangan menjalankan bootstrap Auth fiktif, fixtures, atau `db reset --linked` pada cloud berisi data.

## 9. Link pribadi bernama dan keamanan token

Format yang dipilih referensi:

```text
https://undangan.example/u/nama-tamu/<kode-22-karakter>
```

Nama membuat alamat terbaca; kode memberikan akses. Nama bukan autentikasi. Jangan memakai `/u/hafiz` saja untuk fitur yang memungkinkan menulis RSVP atas nama Hafiz. Kode 4–6 karakter juga bukan pengganti token bearer kuat.

Implementasi referensi:

1. Buat token dasar dengan 32 byte random kriptografis, base64url 43 karakter.
2. Simpan SHA-256 untuk lookup dan AES-256-GCM ciphertext untuk fitur salin ulang. Gunakan nonce unik acak, AAD yang mengikat guest/version, dan key server berversi.
3. Alias URL lebih pendek diturunkan dari hash dengan domain separator dari token dasar, diambil 16 byte, base64url 22 karakter. Material dasarnya tetap acak; jangan menurunkan dari nama atau ID berurutan.
4. Simpan hash alias yang terikat hash token aktif. Collision harus ditolak/dikelola, tidak boleh menimpa alias milik tamu lain.
5. Slug nama: normalisasi aksen, lowercase, karakter non-alfanumerik menjadi dash, trim, batas panjang dan fallback `tamu`.
6. Ubah nama tidak merotasi akses. Slug lama boleh tetap bekerja karena identitas resmi datang dari token/database.
7. Buat/lihat link menggunakan token yang sama. Link baru merotasi token dan membatalkan alias lama. Cabut menonaktifkan akses tanpa menghapus riwayat.
8. Jika migrasi dari sistem lama, dukung `?guest=<token>` dan `/u/<token>` secara eksplisit. Tolak campuran query/path token yang ambigu dan base64url noncanonical.
9. SPA fallback wajib agar membuka/refresh `/u/...` langsung tetap memuat aplikasi.

Token adalah bearer credential: siapa pun yang memegang link dapat bertindak sebagai penerima. Jangan mencatat URL bertoken di analytics/log, CSV atau error. Pakai no-referrer, jangan index undangan, dan tampilkan hanya data minimum. Ini tidak memberi jaminan bahwa pemegang link adalah orang yang namanya tercantum.

## 10. Kontrak API dan state frontend

Referensi memakai satu Edge Function `invitation-api`, endpoint POST JSON:

| Endpoint | Tujuan |
|---|---|
| `/resolve` | Token → nama resmi, jatah, acara, balasan sendiri |
| `/rsvp` | Simpan/update attendance dan partySize |
| `/wish` | Simpan/update ucapan, status pending |
| `/wishes` | Daftar approved untuk acara published, cursor pagination |
| `/admin-link` | get/rotate/revoke, guestId, opsional compact:true, Bearer admin |

Periksa `supabase/API.md` dan handler untuk body tepat sebelum memanggilnya. Jangan mengarang endpoint REST dari nama tabel. Pada proyek baru, tulis kontrak request/response, field allowed, batas payload dan kode error terlebih dahulu.

Referensi membatasi JSON 4.096 byte, menolak field tambahan, memakai no-store dan request ID. Status penting: 400 input, 401 sesi, 403 origin, 404 akses/link tidak tersedia, 409 konflik, 429 rate limit, 503 konfigurasi/upstream. Jangan mengirim detail SQL, stack secret atau credential ke klien.

CORS harus membolehkan origin tepat, metode/header yang dipakai, dan OPTIONS preflight. Origin tidak mengandung path atau trailing slash; public URL dapat memiliki slash akhir. CORS bukan autentikasi. Tamu tetap harus melalui token dan admin tetap melalui verifikasi Auth.

Rate limit referensi: window satu menit, global 6.000, resolve 60/token, RSVP/ucapan masing-masing 10/token, admin 30/akun. Nilai ini bukan jaminan kapasitas. Identitas bucket memakai HMAC; perlu pengujian dan proteksi gateway untuk flood sebelum mencapai database.

State UI harus eksplisit: belum dikonfigurasi, loading, valid, invalid/revoked, pending submit, sukses, gagal dan retry. Form tanpa backend tidak boleh menampilkan sukses palsu. Jangan otomatis mengulang mutasi setelah koneksi gagal; respons bisa hilang sesudah data tersimpan. Muat ulang state atau gunakan idempotensi yang dirancang.

Render nama/ucapan sebagai teks, bukan HTML bebas. List approved tidak boleh bocor pending. Tanggal/slug dari link harus cocok dengan acara yang sedang ditampilkan.

## 11. Setup Supabase dari nol

1. Buat akun Supabase, organization dan project untuk target acara. Catat project ref dan URL publik. Simpan password database di pengelola password.
2. Tentukan development dan production. Lebih aman memakai project terpisah; jika sumber daya terbatas, dokumentasikan batas dan jangan menjalankan tes destruktif pada acara nyata.
3. Pasang CLI sesuai dokumentasi resmi dan periksa `supabase --version`.
4. Pada salinan referensi, jalankan setup berikut setelah mengganti placeholder. Pada proyek baru tanpa script, implementasikan setup setara terlebih dahulu.

```sh
pnpm install --frozen-lockfile
pnpm setup:development --project-url https://YOUR_PROJECT_REF.supabase.co --website-url http://localhost:8443/ --event-slug acara-baru
```

`YOUR_PROJECT_REF` harus diganti ref nyata. Placeholder literal akan ditolak. Script referensi membuat tiga file ignored tanpa menimpa file existing:

| File | Isi |
|---|---|
| `.env.local` | Konfigurasi publik Vite |
| `supabase/.env.development` | URL/CORS, key enkripsi dan rate-limit server |
| `.env.c4.local` | Dua akun uji dan target integrasi development |

Konfigurasi frontend:

```dotenv
VITE_INVITATION_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1/invitation-api
VITE_INVITATION_EVENT_SLUG=acara-baru
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```

Semua `VITE_*` akan terlihat di browser. Publishable key memang publik; secret/service-role, password dan AES key tidak boleh berada di sana. Jangan menyalin nilai contoh sebagai credential nyata.

Server memerlukan INVITATION_PUBLIC_URL, INVITATION_ALLOWED_ORIGINS, INVITATION_TOKEN_KEYS (JSON versi→key 32-byte base64url), INVITATION_ACTIVE_KEY_VERSION dan INVITATION_RATE_LIMIT_KEY (random berbeda). Runtime menyediakan SUPABASE_URL dan service role legacy; adapter referensi menerima INVITATION_SERVICE_KEY bila memakai modern secret. Periksa implementasi target sebelum mengubahnya.

Jangan regenerate key hanya untuk memperbarui URL. Kehilangan key lama membuat ciphertext tidak dapat dibuka untuk salin link. Simpan backup key aman dan pertahankan versi yang masih digunakan.

Deploy berurutan:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push --linked --dry-run
# Tinjau migration dan target sebelum perintah berikut.
supabase db push --linked
supabase secrets set --project-ref YOUR_PROJECT_REF --env-file supabase/.env.development
supabase functions deploy invitation-api --project-ref YOUR_PROJECT_REF --use-api
```

`--use-api` pada referensi memungkinkan deploy function tanpa Docker lokal. Jangan mengirim file env development ke production tanpa memeriksa seluruh nilainya. Saat hanya mengganti origin/public URL, gunakan file sementara berisi dua nilai tersebut agar tidak menimpa key lain.

Gateway JWT function referensi dinonaktifkan untuk endpoint tamu melalui config.toml; handler admin harus tetap memverifikasi token ke Auth. Jangan menerapkan verify_jwt=false ke function lain tanpa analisis autentikasi.

Buat akun pengelola melalui **Authentication → Users** pada dashboard Supabase. Email adalah identitas akun aplikasi; password ditetapkan saat membuat akun tersebut, bukan password Gmail. Dua akun uji berbeda diperlukan untuk membuktikan isolasi owner, bukan berarti setiap klien wajib punya dua akun admin.

Isi credential uji hanya di `.env.c4.local`; jalankan `pnpm check:development`, lalu `pnpm verify:development` pada target development. Runner membuat fixture terisolasi dan harus membersihkannya; periksa laporan cleanup. Tes simulasi tidak menggantikan tes Auth/PostgREST/Edge nyata.

## 12. Dashboard pengelola

Fitur minimum:

- Login/logout, sesi kedaluwarsa, pesan konfigurasi belum lengkap.
- Membuat draft acara, meninjau dan mengaktifkan acara.
- Tambah/edit nama tamu dan jatah, cari, pagination stabil.
- Buat/lihat link, salin link dan template pesan; fallback salin manual.
- Rotasi/cabut dengan penjelasan dampak dan konfirmasi.
- Ringkasan aktif/hadir/berhalangan/belum jawab/jumlah orang/ucapan pending.
- Moderasi pending/approved/rejected dengan perlindungan konflik edit.
- Ekspor CSV yang menetralkan formula spreadsheet dan tidak menyertakan token.
- Loading/error/empty state yang terlihat; cegah klik ganda selama mutasi.

Referensi memakai `/?admin` untuk memilih UI admin. Query tersebut bukan perlindungan keamanan; Auth dan RLS melindungi data. SDK/dashboard dimuat dinamis. Sesi referensi hanya dalam memori sehingga reload meminta login lagi; jika mengubah persistensi, desain dan uji keamanan sesi baru secara sadar.

Jika slug sudah ada pada owner berbeda, jangan terus menampilkan tombol buat draft. Tampilkan penjelasan konflik dan arahkan login akun pemilik. Jangan memindahkan ownership otomatis berdasarkan slug.

Aktivasi acara memengaruhi akses balasan, bukan deployment frontend. Pengelola harus mengetahui batas CMS: pengaturan rekening, konten dan tema belum tentu editable dari admin. Bedakan fitur yang benar-benar tersedia dari roadmap.

## 13. Pengujian dan kriteria lulus

Pada salinan referensi, perintah yang tersedia:

```sh
pnpm test:db
pnpm test:api
pnpm test:client
pnpm test:admin
pnpm test:development
pnpm exec tsc --noEmit
pnpm check:api
pnpm test:forms
pnpm test:admin:browser
pnpm build:hosting
pnpm test:hosting
```

Jalankan browser suite berurutan bila berbagi port fixture. Chromium dan environment test mungkin perlu disiapkan; baca script/documentation. `test:development` menguji alat secara lokal, sedangkan `verify:development` menghubungi layanan development nyata. Jangan menganggap nama script sebagai bukti coverage.

Checklist wajib:

- [ ] Migration fresh database dan upgrade existing berhasil.
- [ ] Anon tidak dapat membaca tabel pribadi; owner A tidak dapat membaca/mengubah B.
- [ ] RPC server-only ditolak untuk anon dan authenticated.
- [ ] Token invalid, revokasi, rotasi, alias lama dan acara draft/arsip ditangani.
- [ ] Dua tamu bernama sama mendapat kode berbeda; perubahan slug tidak mengubah identitas.
- [ ] Double submit/retry tidak membuat RSVP/ucapan duplikat.
- [ ] Jatah enforced di server/database; berhalangan menghasilkan nol.
- [ ] Ucapan baru pending; approved saja yang tampil publik; edit kembali pending.
- [ ] Konflik admin tidak menimpa update terbaru.
- [ ] Nama/pesan berisi HTML dan formula CSV tidak dieksekusi.
- [ ] Cover, reveal, glow, musik, Maps, bank copy dan countdown diuji.
- [ ] Mobile dan desktop tidak overflow; descender teks tidak terpotong.
- [ ] Cold cache, slow network, asset gagal, API timeout dan reduced motion diuji.
- [ ] URL /u/... bekerja pada direct navigation dan refresh hosting.
- [ ] Safari/iPhone dan Android nyata diuji, bukan hanya emulasi Chromium.
- [ ] Integrasi hosted diuji dengan fixture yang terisolasi dan cleanup tercatat.

Uji beban dilakukan pada environment yang diizinkan: modelkan request resolve, list wishes dan submit dengan ramp-up realistis. Ukur error, latency p95, rate-limit, koneksi database dan kuota. Pisahkan 1.000 record dari 1.000 concurrent user. Jangan membanjiri production untuk “menguji” kapasitas.

## 14. Build artefak dan persiapan repository

Untuk proyek referensi, `pnpm build:hosting` memvalidasi env publik, build Vite dan membuat ZIP siap upload. Untuk proyek baru tanpa script tersebut, implementasikan pemeriksaan sepadan atau gunakan build standar dan tinjau dist secara eksplisit.

Artefak hosting hanya berisi output static build, bukan seluruh folder proyek. ZIP harus berisi index.html pada root beserta assets dan media. Jangan memasukkan src, node_modules, .env, SQL, fixture, log credential atau .git. Source map publik hanya bila memang disengaja dan ditinjau.

`.gitignore` minimal: node_modules, dist, file .env lokal, secret server, .dev.vars, .wrangler, artefak test/ZIP dan metadata sistem. Simpan template `.env.example` tanpa nilai rahasia. Lockfile dan migration justru ikut commit.

Sebelum push:

```sh
git status --short
# Pilih file yang benar-benar terkait; jangan git add semua tanpa tinjauan.
git diff
git diff --cached --stat
```

Jika output Git masuk pager, tekan `q` untuk kembali ke terminal. Jangan mengira pager sebagai proses build yang macet. Pastikan tidak ada credential yang ikut stage. Secret yang pernah bocor harus dirotasi; menghapus baris dari commit terbaru saja tidak membatalkan key atau menghapus riwayat.

## 15. Hosting Cloudflare dan GitHub Actions

### 15.1 Target Workers Static Assets

Gunakan satu Worker untuk target acara. Nama Worker adalah target deployment, tidak harus sama dengan nama repository. Untuk acara baru pilih nama baru; jangan tanpa sengaja deploy template ke Worker klien lama.

Contoh konfigurasi **template** `wrangler.jsonc`:

```jsonc
{
  "name": "ganti-dengan-worker-target",
  "compatibility_date": "2026-10-04",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "observability": { "enabled": false }
}
```

Tanggal contoh bukan kewajiban proyek masa depan; pilih tanggal yang diuji. Observability false adalah setting referensi, bukan larangan monitoring. Jika mengaktifkan logs, lakukan redaksi token dan data pribadi. Dashboard dan file Wrangler harus konsisten agar deploy tidak mengembalikan konfigurasi lama.

Direct upload hanya cocok untuk artefak yang telah dibangun dan antarmuka layanan yang mendukungnya. Pesan “TypeScript files were found” menandakan sumber atau jalur upload/build yang tidak sesuai. Gunakan dist dan jalur Workers/Wrangler yang benar; jangan mengganti ekstensi .ts menjadi .js secara manual.

### 15.2 CI otomatis

Alur yang berhasil pada referensi adalah GitHub Actions → Wrangler deploy. Workers Builds sebelumnya timeout saat Initializing, sebelum clone; mengganti TypeScript tidak akan memperbaiki tahap yang belum membaca kode.

Siapkan repository GitHub dan file `.github/workflows/deploy-cloudflare.yml`. File harus sudah di-commit pada branch main agar workflow muncul. Pada repository **Settings → Secrets and variables → Actions**, buat satu entri per nama:

| Jenis | Nama | Nilai |
|---|---|---|
| Secret | CLOUDFLARE_API_TOKEN | Token deploy dengan hak minimum untuk target |
| Secret | CLOUDFLARE_ACCOUNT_ID | Account ID pemilik Worker |
| Variable | VITE_INVITATION_API_URL | URL function target |
| Variable | VITE_INVITATION_EVENT_SLUG | Slug acara target |
| Variable | VITE_SUPABASE_PUBLISHABLE_KEY | Public key target |

Variabel Cloudflare Builds tidak otomatis tersedia pada GitHub Actions. Jangan menaruh Supabase service key di workflow frontend. Jangan menggabungkan semua variabel menjadi satu string.

Buat token Cloudflare dengan izin yang sesuai API/deployment. Untuk Worker existing, antarmuka referensi mendukung Individual Workers → target → Editor. Jangan memilih seluruh akses akun untuk menghindari error tanpa memahami scope. Pembuatan Worker baru atau perubahan domain/routes dapat memerlukan izin tambahan yang terpisah. Nama pilihan UI/dukungan token berubah; periksa dokumentasi resmi saat setup.

Urutan job wajib:

1. Checkout repository dengan permission contents:read.
2. Siapkan pnpm dan Node versi konsisten dengan lockfile.
3. `pnpm install --frozen-lockfile`.
4. Type check; jalankan tes relevan sebagai gate CI sesuai runtime yang tersedia.
5. Build dengan tiga VITE variables di environment **langkah build**.
6. Jalankan Wrangler deploy dengan Cloudflare API token dan Account ID.
7. Verifikasi versi aktif/URL dan smoke test.

Gunakan trigger push main dan workflow_dispatch; batasi deploy production ke main; antrekan concurrency deployment agar versi lama tidak menimpa versi baru. Versi actions harus diperiksa dan dipin ke versi/commit yang ditinjau. Workflow referensi memakai checkout@v4, setup-node@v4, pnpm/action-setup@v4 dan wrangler-action@v3; itu snapshot historis, bukan rekomendasi versi terbaru. Warning runtime action Node berbeda dari Node yang dipakai build aplikasi.

Jika memilih GitHub Actions, matikan pemicu automatic Workers Builds lama agar tidak ada dua pipeline yang menimpa Worker. Jangan menghapus Worker untuk mematikan build.

Push perubahan → buka Actions → workflow → job/log → pastikan deploy berhasil → cek website. Status workflow hijau perlu dikonfirmasi targetnya benar. Jika website sama, bandingkan commit SHA, versi deployment, Worker name, dan output build sebelum menyalahkan cache. Uji incognito/hard refresh setelah target benar.

### 15.3 Alternatif Vercel

Untuk proyek baru yang memilih Vercel, import repository, pilih framework Vite, root proyek benar, build command sesuai script dan output dist. Pasang VITE variables pada environment production/preview yang sesuai. Pastikan SPA rewrite untuk /u/... tidak merusak aset. Gunakan panduan resmi terbaru sebelum menulis konfigurasi.

Perubahan provider frontend tidak memindahkan database. Update public URL/CORS backend untuk hostname baru, deploy/rebuild frontend bila build env berubah, lalu uji admin dan link tamu. Jangan bermigrasi provider hanya berdasarkan satu error tanpa diagnosis tahapnya.

## 16. Domain, origin dan deployment terpisah

Domain pribadi opsional. Subdomain workers.dev cukup untuk akses lintas perangkat. Domain eksternal dapat dibeli di registrar lain; untuk Custom Domain Worker dengan setup biasa, tambahkan zone ke Cloudflare, arahkan nameserver dari registrar ke Cloudflare, tunggu aktif lalu tambahkan Custom Domain pada Worker. Pembelian domain tidak harus ditransfer ke Cloudflare.

Beli domain saja jika hosting sudah tersedia. .com umumnya didaftarkan tahunan; dipakai dua bulan tetap membayar periode registrasi dan dapat menonaktifkan auto-renew. Jangan menjanjikan harga, availability atau promo sebelum memeriksa checkout penyedia.

Sesudah domain aktif:

- Perbarui INVITATION_PUBLIC_URL menjadi alamat HTTPS utama.
- Tambahkan origin baru pada INVITATION_ALLOWED_ORIGINS, tanpa path/slash akhir.
- Pertahankan origin lama bila link lama masih perlu didukung; rencanakan redirect tanpa membuang path/kode.
- Bila memakai flow Auth redirect/reset, periksa Site URL dan redirect allowlist Supabase juga; ini terpisah dari CORS function.
- Uji SSL, root, /?admin, /u/..., refresh, create guest, RSVP, ucapan dan salin link baru.

| Perubahan | Tindakan |
|---|---|
| Teks, CSS, gambar, musik, routing UI | Build/deploy frontend |
| VITE variable | Build/deploy frontend ulang; nilai tertanam saat build |
| CORS/public URL server | Update secret/config backend dan verifikasi layanan |
| Handler Edge | Deploy function |
| Schema/RLS/RPC | Migration database; deploy API/UI bila kontrak berubah |
| Data tamu/RSVP/moderasi | Mutasi database melalui admin; tidak perlu rebuild |

Karena itu perbaikan CORS dapat memulihkan frontend existing tanpa ZIP baru. Browser masih menjalankan bundle yang sama, tetapi backend kini menerima origin yang benar.

## 17. Troubleshooting yang pernah terjadi

| Gejala | Pemeriksaan dan solusi |
|---|---|
| localhost connection refused | Pastikan server hidup dan port benar. Localhost milik perangkat itu sendiri; ponsel tidak mengakses server laptop melalui localhost. |
| Buat draft → data sudah ada → berulang | Periksa slug unik dan owner akun yang login. Bedakan tidak ada acara dari acara tidak dapat diakses. Jangan overwrite owner. |
| Tombol link disabled | Periksa status published, loading/request pending, konfigurasi public URL/key dan syarat UI pada kode. |
| Admin Load failed setelah hosting | Periksa Network OPTIONS/POST, origin persis, URL API, secret function dan error upstream. Jangan langsung menghapus database. |
| Link root jalan, /u/... 404 | Periksa SPA fallback dan parsing path. |
| Form sukses tapi hilang setelah refresh | Pastikan memakai API nyata, bukan state demo; baca ulang dari database dengan token yang sama. |
| Foto langsung muncul sebelum animasi | Gate viewport+decode sebelum reveal; cek state awal CSS dan reduced-motion. |
| Descender g terpotong | Line-height, fixed height, overflow ancestor dan font metrics. |
| Musik tidak autoplay | play harus mengikuti gesture; tangani penolakan dan uji Safari. |
| GitHub Actions tidak ada | Workflow belum di-push ke .github/workflows pada branch yang tepat atau Actions belum diizinkan. |
| Cloudflare initializing timeout sebelum clone | Masalah provisioning build; periksa status/log, retry terbatas, gunakan CI alternatif bila berulang. |
| Unsupported token resource type | Permission group dan resource scope tidak cocok. Gunakan scope/role yang didukung; jangan beri semua akses akun secara sembarang. |
| Deploy hijau tetapi tampilan lama | Target Worker, commit, env build, dist yang diunggah, lalu cache. |
| Salin link gagal setelah key diganti | Pulihkan key versi lama atau lakukan rotasi link yang disengaja; jangan mengarang token. |

## 18. Operasi, rollback dan serah terima

Sebelum dibagikan, pastikan pemilik akun layanan, repository, billing, backup secret dan jadwal kedaluwarsa token deploy terdokumentasi di tempat aman. API token deploy kedaluwarsa dapat menghentikan deploy berikutnya, walau website yang sudah aktif masih berjalan.

Simpan backup database sesuai paket/kebijakan dan uji pemulihan pada lingkungan terpisah. CSV tamu bukan backup penuh: tidak mencakup seluruh schema, Auth, key dan ciphertext. Tetapkan retensi nama/RSVP/ucapan setelah acara dan akses pengelola terhadap ekspor.

Rollback frontend memakai deployment/commit yang diketahui baik. Rollback database tidak boleh asal membatalkan migration yang sudah berisi data; utamakan perbaikan migration baru atau rencana restore yang diuji. Rilis perubahan backend secara kompatibel terlebih dahulu, lalu frontend, baru hapus dukungan lama setelah aman.

Checklist selesai:

- [ ] Konten dan aset disetujui pemilik acara.
- [ ] Build dan tes relevan lulus; hasil dan batas tes dicatat.
- [ ] RLS/ownership dibuktikan dengan dua akun pada layanan nyata.
- [ ] Secret tidak berada di source, bundle, artefak atau chat.
- [ ] Backend target benar, migration dan function cocok dengan frontend.
- [ ] GitHub deploy berhasil dan Worker target terverifikasi.
- [ ] Smoke test production pada tamu uji dan perangkat nyata selesai.
- [ ] Backup, recovery, monitoring dan retensi ditentukan; pekerjaan yang belum dilakukan ditandai.
- [ ] Akun pengelola dan panduan operasi diserahkan.
- [ ] PLAN_PRODUCTION.md memuat log terakhir dan langkah lanjutan.

## 19. Sumber resmi untuk verifikasi saat membangun ulang

Panduan ini mendokumentasikan pola proyek pada 4 Oktober 2026. Harga, dashboard, izin token, runtime dan versi dependency harus diperiksa ulang ketika memulai proyek berikutnya.

- Vite: https://vite.dev/guide/ dan https://vite.dev/guide/env-and-mode
- Tailwind: https://tailwindcss.com/docs/installation/using-vite
- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Function secrets: https://supabase.com/docs/guides/functions/secrets
- Function deploy: https://supabase.com/docs/guides/functions/deploy
- API keys: https://supabase.com/docs/guides/api/api-keys
- Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- GitHub deploy: https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- Workers authorization: https://developers.cloudflare.com/workers/authorization/workers/
- Custom domains: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- GitHub Actions: https://docs.github.com/en/actions
- Vercel Vite: https://vercel.com/docs/frameworks/frontend/vite
