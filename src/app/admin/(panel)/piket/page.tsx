import { wajibAdmin } from "@/lib/auth";
import { ambilPiket } from "@/lib/piket";
import { FormPiket } from "@/components/admin/form-piket";

export const metadata = { title: "Jadwal Piket" };

export default async function HalamanPiket() {
  await wajibAdmin();
  const piket = await ambilPiket();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Jadwal Piket</h1>
        <p className="text-sm text-muted-foreground">
          Satu nama per baris untuk tiap hari, sesuai papan piket. Tampil di halaman Jadwal Piket dan di beranda
          (siapa yang bertugas hari ini). Baris kosong dan nama ganda otomatis dibuang.
        </p>
      </div>
      <FormPiket awal={piket} />
    </div>
  );
}