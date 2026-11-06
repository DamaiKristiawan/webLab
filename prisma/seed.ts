import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Isi ADMIN_EMAIL dan ADMIN_PASSWORD di .env sebelum menjalankan seed.");
  }

  // Akun admin (menjalankan seed lagi akan mereset password ke nilai di .env)
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.staff.upsert({
    where: { email },
    update: { passwordHash, aktif: true },
    create: { nama: "Administrator", email, passwordHash },
  });

  // Contoh ruangan (hanya jika tabel masih kosong)
  if ((await prisma.ruangan.count()) === 0) {
    await prisma.ruangan.createMany({
      data: [
        { nama: "Ruang Praktikum 1", kapasitas: 30, deskripsi: "Contoh data, ubah lewat panel admin." },
        { nama: "Ruang Praktikum 2", kapasitas: 30 },
        { nama: "Ruang Seminar", kapasitas: 50 },
      ],
    });
  }

  // Contoh alat (hanya jika tabel masih kosong)
  if ((await prisma.alat.count()) === 0) {
    await prisma.alat.createMany({
      data: [
        { nama: "Trainer Digital", kategori: "Praktikum", stokTotal: 10 },
        { nama: "Osiloskop", kategori: "Pengukuran", stokTotal: 5 },
        { nama: "Multimeter Digital", kategori: "Pengukuran", stokTotal: 10 },
        { nama: "Power Supply DC", kategori: "Catu Daya", stokTotal: 5 },
        { nama: "Function Generator", kategori: "Pengukuran", stokTotal: 3 },
      ],
    });
  }

  // Pengaturan awal (tidak menimpa yang sudah diubah)
  const pengaturan: [string, string][] = [
    ["nama_lab", "Laboratorium Teknik Digital"],
    ["nama_instansi", "Universitas Lampung"],
    ["visi", "Belum diisi."],
    ["misi", "Belum diisi."],
    ["sejarah", "Belum diisi."],
    ["alamat", "Fakultas Teknik, Universitas Lampung, Bandar Lampung"],
    ["email", "Belum diisi."],
    ["telepon", "Belum diisi."],
    ["jam_layanan", "Belum diisi."],
  ];
  for (const [kunci, nilai] of pengaturan) {
    await prisma.pengaturan.upsert({
      where: { kunci },
      update: {},
      create: { kunci, nilai },
    });
  }

  console.log("Seed selesai. Login admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());