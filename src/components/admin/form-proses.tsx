"use client";

import { useActionState } from "react";
import { prosesPengajuan } from "@/actions/pengajuan-admin";
import type { FormState } from "@/lib/form";
import { cn } from "@/lib/utils";

type Status = "MENUNGGU" | "DISETUJUI" | "DITOLAK" | "SELESAI" | "DIBATALKAN";

export function FormProses({
  id,
  status,
  catatanAwal,
}: {
  id: number;
  status: Status;
  catatanAwal: string | null;
}) {
  const [state, action, pending] = useActionState(prosesPengajuan, {} as FormState);
  const akhir = status === "DITOLAK" || status === "SELESAI" || status === "DIBATALKAN";

  const pesan = (
    <>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.sukses && <p role="status" className="text-sm font-medium">{state.sukses}</p>}
    </>
  );

  if (akhir) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Pengajuan sudah berstatus akhir dan tidak dapat diubah lagi.</p>
        {pesan}
      </div>
    );
  }

  const konfirmasi = (teks: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!window.confirm(teks)) e.preventDefault();
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <div>
        <label htmlFor="catatan" className="text-sm font-medium">Catatan untuk pemohon</label>
        <textarea
          id="catatan"
          name="catatan"
          rows={3}
          defaultValue={state.values?.catatan ?? catatanAwal ?? ""}
          className="input mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Wajib diisi bila menolak atau membatalkan. Pemohon membacanya di halaman Cek Status.
        </p>
      </div>

      {pesan}

      <div className="flex flex-wrap gap-2">
        {status === "MENUNGGU" && (
          <>
            <button type="submit" name="aksi" value="SETUJUI" disabled={pending} className="btn btn-primary">
              {pending ? "Memproses..." : "Setujui"}
            </button>
            <button
              type="submit"
              name="aksi"
              value="TOLAK"
              disabled={pending}
              onClick={konfirmasi("Tolak pengajuan ini?")}
              className={cn("btn btn-outline")}
            >
              Tolak
            </button>
          </>
        )}
        {status === "DISETUJUI" && (
          <button type="submit" name="aksi" value="SELESAI" disabled={pending} className="btn btn-primary">
            {pending ? "Memproses..." : "Tandai Selesai"}
          </button>
        )}
        <button
          type="submit"
          name="aksi"
          value="BATALKAN"
          disabled={pending}
          onClick={konfirmasi("Batalkan pengajuan ini? Jadwal otomatisnya (bila ada) ikut dihapus.")}
          className="btn btn-outline"
        >
          Batalkan
        </button>
      </div>
    </form>
  );
}