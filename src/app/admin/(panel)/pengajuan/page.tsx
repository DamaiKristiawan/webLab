import { wajibAdmin } from "@/lib/auth";
import { SegeraHadir } from "@/components/admin/segera-hadir";

export const metadata = { title: "Pengajuan" };

export default async function AdminPengajuan() {
  await wajibAdmin();
  return (
    <SegeraHadir
      judul="Pengajuan"
      deskripsi="Tinjau, setujui, atau tolak pengajuan alat, ruangan, dan penelitian. Dikerjakan di tahap 5."
    />
  );
}