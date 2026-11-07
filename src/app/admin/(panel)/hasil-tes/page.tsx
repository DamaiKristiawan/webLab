import { wajibStaf } from "@/lib/auth";
import { SegeraHadir } from "@/components/admin/segera-hadir";

export const metadata = { title: "Hasil Tes" };

export default async function AdminHasilTes() {
  await wajibStaf(); // admin dan asisten
  return (
    <SegeraHadir
      judul="Hasil Tes"
      deskripsi="Rekap nilai pretest dan postest peserta. Dikerjakan di tahap 6."
    />
  );
}