import { wajibAdmin } from "@/lib/auth";
import { SegeraHadir } from "@/components/admin/segera-hadir";

export const metadata = { title: "Dokumentasi" };

export default async function AdminDokumentasi() {
  await wajibAdmin();
  return (
    <SegeraHadir
      judul="Dokumentasi"
      deskripsi="Unggah foto dan tulis artikel kegiatan lab. Dikerjakan di tahap 7."
    />
  );
}