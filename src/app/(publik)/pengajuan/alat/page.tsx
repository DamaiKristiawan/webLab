import { HalamanPengajuan } from "@/components/publik/halaman-pengajuan";

export const metadata = { title: "Peminjaman Alat" };

export default function Page() {
  return <HalamanPengajuan jenis="ALAT" />;
}