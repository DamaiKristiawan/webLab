import { Hammer } from "lucide-react";

export function SegeraHadir({ judul, deskripsi }: { judul: string; deskripsi: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">{judul}</h1>
      <div className="card flex flex-col items-center gap-3 p-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted">
          <Hammer className="h-5 w-5" />
        </span>
        <p className="font-semibold">Segera hadir</p>
        <p className="max-w-md text-sm text-muted-foreground">{deskripsi}</p>
      </div>
    </div>
  );
}