import { wajibAdmin } from "@/lib/auth";
import { SegeraHadir } from "@/components/admin/segera-hadir";

export const metadata = { title: "Survei" };

export default async function AdminSurvei() {
  await wajibAdmin();
  return (
    <SegeraHadir
      judul="Survei"
      deskripsi="Kelola pertanyaan dan lihat rekap survei kepuasan. Dikerjakan di tahap 7."
    />
  );
}