/** Konten acara diperbarui sesuai arahan pemilik undangan. */
export const event = {
  title: "Khataman Al-Qur’an",
  slug: "khataman-al-habsy-mulfi",
  name: "Muhammad Al-Habsy Mulfi",
  firstLine: "Muhammad",
  lastLine: "Al-Habsy Mulfi",
  father: "Mulfi Akil",
  mother: "Isniani",
  startsAt: "2026-10-09T19:00:00+08:00",
  timezone: "Asia/Makassar",
  time: "19:00 WITA – SELESAI",
  venue: "Hotel Grand Puri Perintis",
  street: "Jl. Perintis Kemerdakaan Km.11 No.77b",
  address: "Tamalanrea, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan, 90245.",
  // Tautan lokasi yang diberikan pemilik undangan.
  mapsUrl: "https://maps.app.goo.gl/CvDZMgdMPjiECkdp7",
  // Audio yang diberikan pemilik melalui folder Sound.
  musicUrl: "/audio/mawlaya.mp3?v=20f5de2d6f4a",
} as const;

export type BankAccount = { bank: string; number: string; holder: string; placeholder?: boolean };
/** Contoh sementara sesuai permintaan; ganti dengan rekening pemilik sebelum publikasi. */
export const bankAccounts: BankAccount[] = [
  { bank: "BANK XXX", number: "xxxxxxxxxxxx", holder: "xxxxxxxxx", placeholder: true },
];

/** Kutipan contoh dari desain, bukan balasan tamu yang telah diterima. */
export const exampleWishes = [
  {
    name: "Ust. H. Ridwan Mansyur",
    message: "Maa syaa Allah tabaarakallah. Selamat ananda Al-Habsy, semoga istiqomah membaca dan mengamalkan Al-Qur’an serta menjadi qurrata a’yun bagi kedua orang tua.",
  },
  {
    name: "Keluarga Besar Hamzah",
    message: "Alhamdulillah, bangga sekali melihat pencapaian ananda Al-Habsy. Semoga Allah senantiasa meridhoi setiap langkahnya.",
  },
];
