import Link from "next/link";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { wajibAdmin } from "@/lib/auth";
import { FormDokumentasi } from "@/components/admin/form-dokumentasi";

export const metadata = { title: "Kegiatan Baru" };

export default async function KegiatanBaru() {
  await wajibAdmin();
  await connection();
  // Tanggal awal = hari ini menurut WIB
  const hariIni = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/dokumentasi"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua kegiatan
      </Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Kegiatan baru</h1>
      <FormDokumentasi tanggalAwal={hariIni} />
    </div>
  );
}