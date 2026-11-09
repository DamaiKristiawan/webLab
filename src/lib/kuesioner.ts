// Kuesioner kepuasan layanan laboratorium (model SERVQUAL): lima dimensi, semua berskala 1-5.
// Empat kuesioner memakai butir yang sama; yang berbeda hanya jumlah butir pada dimensi Asuransi.

export const LABEL_SKALA = ["Sangat tidak puas", "Tidak puas", "Cukup puas", "Puas", "Sangat puas"] as const;

export const DAFTAR_KUESIONER = [
  { kode: "kepuasan-pengguna", judul: "Kuesioner Kepuasan Pengguna", asuransi: 3 },
  { kode: "pengguna", judul: "Kuesioner Pengguna", asuransi: 2 },
  { kode: "praktikum", judul: "Kuesioner Praktikum", asuransi: 2 },
  { kode: "penelitian", judul: "Kuesioner Penelitian", asuransi: 3 },
] as const;

const DIMENSI_AWAL: { nama: string; butir: string[] }[] = [
  {
    nama: "Tangible atau Nyata",
    butir: [
      "Ruangan laboratorium terlihat bersih dan rapi",
      "Ruangan laboratorium cukup luas dan nyaman untuk melaksanakan kegiatan terkait",
      "Laboratorium mempunyai peralatan yang lengkap",
    ],
  },
  {
    nama: "Empati",
    butir: [
      "PLP/Laboran memberikan waktu pelayanan yang cukup dan mudah ditemui",
      "Kepala Laboratorium dan PLP/Laboran memperhatikan dengan sungguh-sungguh kebutuhan pengguna",
      "PLP/Laboran bersikap sopan dan ramah",
    ],
  },
  {
    nama: "Reliability atau Keandalan",
    butir: [
      "PLP/Laboran memberikan pelayanan dengan teliti dan tepat waktu",
      "PLP/Laboran dan Kepala Laboratorium membantu pengguna saat menghadapi kendala selama melakukan kegiatan di laboratorium",
      "PLP/Laboran memberikan informasi yang cukup terkait tata tertib bekerja di laboratorium",
      "PLP/Laboran dan Kepala Laboratorium bersedia menanggapi keluhan pengguna",
      "Alat ukur akurat",
    ],
  },
  {
    nama: "Responsive atau Tanggap",
    butir: [
      "PLP/Laboran dan Kepala Laboratorium tanggap dalam melayani pengguna",
      "PLP/Laboran menerima dan melayani pengguna dengan baik",
      "PLP/Laboran dan Kepala Laboratorium melayani pengguna sesuai dengan POS AP yang telah ditetapkan",
    ],
  },
];

const ASURANSI_2 = [
  "Kepala laboratorium mempunyai kemampuan dan pengetahuan tentang kegiatan dan operasional peralatan yang ada di laboratorium",
  "Alat yang tersedia siap digunakan",
];

const ASURANSI_3 = [
  "Kepala laboratorium mempunyai kemampuan dan pengetahuan tentang kegiatan dan operasional peralatan yang ada di laboratorium",
  "PLP/Laboran mampu mendampingi pengguna saat bekerja di laboratorium",
  "Alat yang tersedia siap digunakan",
];

/** Daftar butir lengkap (dengan nama dimensinya) untuk satu kuesioner. */
export function butirKuesioner(asuransi: 2 | 3) {
  const daftar: { kelompok: string; teks: string }[] = [];
  for (const d of DIMENSI_AWAL) for (const teks of d.butir) daftar.push({ kelompok: d.nama, teks });
  for (const teks of asuransi === 3 ? ASURANSI_3 : ASURANSI_2) {
    daftar.push({ kelompok: "Asuransi atau Kepastian", teks });
  }
  return daftar;
}

export function deskripsiKuesioner() {
  return "Pendapat Anda membantu kami meningkatkan layanan laboratorium. Nilai setiap pernyataan dengan bintang: 1 sangat tidak puas sampai 5 sangat puas.";
}