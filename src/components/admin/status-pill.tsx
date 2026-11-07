import type { StatusPengajuan } from "@prisma/client";
import { labelStatus } from "@/lib/konstanta";

const kelas: Record<StatusPengajuan, string> = {
  MENUNGGU: "pill pill-wait",
  DISETUJUI: "pill pill-ok",
  DITOLAK: "pill pill-no",
  SELESAI: "pill pill-done",
  DIBATALKAN: "pill pill-no",
};

export function StatusPill({ status }: { status: StatusPengajuan }) {
  return <span className={kelas[status]}>{labelStatus[status]}</span>;
}