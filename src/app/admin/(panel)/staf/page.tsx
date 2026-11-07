import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { alihkanAktif, alihkanRol } from "@/actions/staf";
import { FormResetPassword, FormTambahStaf } from "@/components/admin/form-staf";
import { labelRol } from "@/lib/konstanta";
import { cn, inisial } from "@/lib/utils";

export const metadata = { title: "Akun Staf" };

export default async function HalamanStaf() {
  const saya = await wajibAdmin();

  const daftar = await prisma.staff.findMany({
    orderBy: [{ rol: "asc" }, { nama: "asc" }],
    select: { id: true, nama: true, username: true, rol: true, aktif: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Akun Staf</h1>
        <p className="text-sm text-muted-foreground">
          Setiap asisten memiliki akun sendiri. Asisten hanya dapat mengelola praktikum; admin memiliki
          akses penuh.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
        <div>
          <h2 className="mb-3 font-semibold">Akun baru</h2>
          <FormTambahStaf />
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Daftar akun ({daftar.length})</h2>
          <ul className="space-y-3">
            {daftar.map((s) => {
              const dirisendiri = s.id === saya.id;
              return (
                <li key={s.id} className={cn("card p-4", !s.aktif && "opacity-70")}>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-sm font-extrabold">
                      {inisial(s.nama)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {s.nama}
                        {dirisendiri && <span className="ml-2 text-xs font-normal text-muted-foreground">(Anda)</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">@{s.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={cn("pill", s.rol === "ADMIN" && "pill-ok")}>{labelRol[s.rol]}</span>
                      <span className={cn("pill", s.aktif ? "pill-done" : "pill-no")}>
                        {s.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <form action={alihkanAktif}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" disabled={dirisendiri} className="btn btn-outline h-8 px-3">
                        {s.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                    <form action={alihkanRol}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" disabled={dirisendiri} className="btn btn-outline h-8 px-3">
                        {s.rol === "ADMIN" ? "Jadikan Asisten" : "Jadikan Admin"}
                      </button>
                    </form>
                    <FormResetPassword id={s.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}