import { Hammer } from "lucide-react";

export function HalamanSegera({ judul, deskripsi }: { judul: string; deskripsi: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 sm:pt-16">
      <p className="label-mono">Segera hadir</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tighter sm:text-5xl">{judul}</h1>
      <div className="card mt-8 flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
          <Hammer className="h-5 w-5" />
        </span>
        <p className="font-semibold">Halaman ini sedang disiapkan</p>
        <p className="max-w-md text-sm text-muted-foreground">{deskripsi}</p>
      </div>
    </div>
  );
}