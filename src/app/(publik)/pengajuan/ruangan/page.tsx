import { HalamanPengajuan } from "@/components/publik/halaman-pengajuan";

export const metadata = { title: "Peminjaman Ruangan" };

export default function Page() {
  return <HalamanPengajuan jenis="RUANGAN" />;
}