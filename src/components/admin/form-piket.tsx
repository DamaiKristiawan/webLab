"use client";

import { useActionState } from "react";
import { simpanPiket } from "@/actions/piket";
import type { FormState } from "@/lib/form";
import { HARI_PIKET } from "@/lib/piket";

export function FormPiket({ awal }: { awal: Record<number, string[]> }) {
  const [state, action, pending] = useActionState(simpanPiket, {} as FormState);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HARI_PIKET.map((h) => (
          <div key={h.no} className="card p-4">
            <label htmlFor={`hari${h.no}`} className="font-semibold">{h.nama}</label>
            <textarea
              id={`hari${h.no}`}
              name={`hari${h.no}`}
              rows={14}
              defaultValue={state.values?.[`hari${h.no}`] ?? awal[h.no].join("\n")}
              spellCheck={false}
              className="input mt-2 font-mono text-[13px] leading-relaxed"
            />
          </div>
        ))}
      </div>

      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.sukses && <p role="status" className="text-sm font-medium">{state.sukses}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary btn-lg">
        {pending ? "Menyimpan..." : "Simpan Jadwal Piket"}
      </button>
    </form>
  );
}