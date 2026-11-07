import { wajibStaf } from "@/lib/auth";
import { SegeraHadir } from "@/components/admin/segera-hadir";

export const metadata = { title: "Praktikum" };

export default async function AdminPraktikum() {
  await wajibStaf(); // admin dan asisten
  return (
    <SegeraHadir
      judul="Praktikum"
      deskripsi="Kelola praktikum, modul, serta soal pretest dan postest. Dikerjakan di tahap 6."
    />
  );
}