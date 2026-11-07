import { wajibAdmin } from "@/lib/auth";
import { ambilPengaturan } from "@/lib/pengaturan";
import { FormPengaturan } from "@/components/admin/form-pengaturan";

export const metadata = { title: "Pengaturan" };

export default async function HalamanPengaturan() {
  await wajibAdmin();
  const nilai = await ambilPengaturan();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Teks yang tampil di halaman Profil Lab. Perubahan langsung berlaku di situs publik.
        </p>
      </div>
      <FormPengaturan nilai={nilai} />
    </div>
  );
}