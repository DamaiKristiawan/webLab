import { wajibStaf } from "@/lib/auth";
import { FormPasswordSendiri } from "@/components/admin/form-staf";
import { labelRol } from "@/lib/konstanta";

export const metadata = { title: "Akun Saya" };

export default async function HalamanAkun() {
  const staff = await wajibStaf();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Akun Saya</h1>
        <p className="text-sm text-muted-foreground">
          {staff.nama} · @{staff.username} · {labelRol[staff.rol]}
        </p>
      </div>
      <FormPasswordSendiri />
    </div>
  );
}