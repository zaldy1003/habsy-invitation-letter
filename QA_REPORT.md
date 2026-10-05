# QA — 5 Oktober 2026

## Perubahan

- Hapus kedua teks izin dan checkbox dari form umum maupun undangan pribadi.
- Ucapan dari pengiriman baru melalui UI masuk moderasi keluarga; data historis tidak diubah secara massal.
- Jumlah hadir berupa dropdown 1 sampai jatah penerima; pilihan berhalangan mengirim nol. Validasi jatah server tetap berlaku.
- Tambahkan unit test, regresi dropdown/undangan dicabut, script pengukuran performa, dan langkah unit test sebelum deployment GitHub Actions.

## Verifikasi

- 9 unit test lulus: keunikan/enkripsi/token tampering, kunci hilang/salah, countdown, format WITA, validasi origin, batas body/JSON, penolakan input API, dan kegagalan konfigurasi feed.
- 26 E2E lulus pada build final: Chromium desktop dan WebKit iPhone. Meliputi viewport 320–1440 px, navigasi cover, konten, foto/retry, audio nyata, animasi/reduced motion, form/retry/idempotensi, dropdown sesuai jatah, berhalangan nol dan pencabutan akses.
- Build Next/OpenNext dan TypeScript lulus.
- Pemeriksaan visual screenshot form pribadi 390 px: dropdown terbaca, label terlihat, tombol tidak terpotong.
- Integrasi database dan admin nyata lulus; akun/baris sementara dibersihkan. Termasuk penolakan akses anonim/non-admin, login/logout/cookie, moderasi, audit, rate limit dan idempotensi.

- Integrasi tamu pada build final lulus: tambah/cari tamu, tautan stabil, RSVP ulang/idempotensi, batas jatah, reset moderasi, cabut akses, dan layout mobile. Data uji dibersihkan.
- Performa lokal build final: LCP cover 0,49 s, undangan 0,54 s, admin 1,61 s; hasil localhost bukan latensi produksi.

## Performa Cloudflare saat ini (sebelum push perubahan ini)

| Halaman | LCP | TTFB | CLS | Transfer awal |
| --- | ---: | ---: | ---: | ---: |
| Cover | 1,69 s | 798 ms | 0,0012 | 305 KB |
| Undangan | 2,28 s | 574 ms | 0,0195 | 369 KB |
| Login admin | 2,23 s | 247 ms | 0,0004 | 259 KB |

Satu pengukuran lab Chromium, viewport 390×844, CPU slowdown 4x, cache browser kosong, pembatasan jaringan CDP diminta 1,6 Mbps dan 150 ms. Server/cache CDN dapat sudah hangat. Transfer adalah viewport awal, tidak termasuk seluruh foto lazy-loaded atau audio setelah interaksi. Tidak ada bottleneck berat pada sampel ini yang mengharuskan perubahan aset/desain; musik sudah preload none dan foto memakai optimasi gambar. Angka bukan jaminan pengalaman semua perangkat. Tidak mengukur traffic serentak, INP lapangan, atau seluruh cabang kode; tidak mengklaim coverage 100%.

Belum melakukan push/deployment perubahan ini. Periksa hasil Actions dan lakukan smoke test URL publik setelah push.
