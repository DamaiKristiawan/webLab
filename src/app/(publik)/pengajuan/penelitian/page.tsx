import { HalamanPengajuan } from "@/components/publik/halaman-pengajuan";

export const metadata = { title: "Pengajuan Penelitian" };

export default function Page() {
  return <HalamanPengajuan jenis="PENELITIAN" />;
}