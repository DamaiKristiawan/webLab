"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";
import { JENIS_JADWAL } from "@/lib/konstanta";
import { dariInputWib, formatJam, formatTanggalPendek } from "@/lib/waktu";

export type JadwalState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  bentrok?: { id: number; judul: string; waktu: string }[];
  values?: Record<string, string>;
};

const KUNCI = [
  "id",
  "judul",
  "jenis",
  "mulai",
  "selesai",
  "ruanganId",
  "praktikumId",
  "kelas",
  "pengampu",
  "keterangan",
] as const;

const skema = z.object({
  id: z.string().optional(),
  judul: z
    .string()
    .trim()
    .min(3, "Judul minimal 3 karakter.")
    .max(150, "Judul maksimal 150 karakter."),
  jenis: z.enum(JENIS_JADWAL),
  mulai: z.string().min(1, "Waktu mulai wajib diisi."),
  selesai: z.string().min(1, "Waktu selesai wajib diisi."),
  ruanganId: z.string().optional(),
  praktikumId: z.string().optional(),
  kelas: z.string().trim().max(50, "Maksimal 50 karakter.").optional(),
  pengampu: z.string().trim().max(150, "Maksimal 150 karakter.").optional(),
  keterangan: z.string().trim().max(500, "Maksimal 500 karakter.").optional(),
});

const angka = (s?: string) => {
  if (!s) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : NaN;
};

const teksAtauNull = (s?: string) => (s && s.trim() ? s.trim() : null);

export async function simpanJadwal(
  _prev: JadwalState,
  formData: FormData,
): Promise<JadwalState> {
  await wajibLogin();

  const values: Record<string, string> = {};
  for (const k of KUNCI) values[k] = String(formData.get(k) ?? "");
  const paksa = formData.get("paksa") === "1";

  const hasil = skema.safeParse(values);
  if (!hasil.success) {
    const fieldErrors: Record<string, string> = {};
    for (const isu of hasil.error.issues) {
      const k = String(isu.path[0] ?? "");
      if (k && !fieldErrors[k]) fieldErrors[k] = isu.message;
    }
    return { error: "Periksa kembali isian formulir.", fieldErrors, values };
  }
  const d = hasil.data;

  const mulai = dariInputWib(d.mulai);
  const selesai = dariInputWib(d.selesai);
  if (!mulai || !selesai) return { error: "Format waktu tidak valid.", values };
  if (selesai <= mulai) {
    return {
      error: "Waktu selesai harus setelah waktu mulai.",
      fieldErrors: { selesai: "Harus setelah waktu mulai." },
      values,
    };
  }

  const id = angka(d.id);
  const ruanganId = angka(d.ruanganId);
  const praktikumId = angka(d.praktikumId);
  if ([id, ruanganId, praktikumId].some(Number.isNaN)) {
    return { error: "Data tidak valid.", values };
  }

  // Cek bentrok ruangan
  if (ruanganId && !paksa) {
    const bentrok = await prisma.jadwal.findMany({
      where: {
        ruanganId,
        mulai: { lt: selesai },
        selesai: { gt: mulai },
        ...(id ? { NOT: { id } } : {}),
      },
      orderBy: { mulai: "asc" },
      select: { id: true, judul: true, mulai: true, selesai: true },
      take: 5,
    });

    if (bentrok.length > 0) {
      return {
        error: "Ruangan sudah terpakai pada waktu tersebut.",
        bentrok: bentrok.map((b) => ({
          id: b.id,
          judul: b.judul,
          waktu: `${formatTanggalPendek(b.mulai)}, ${formatJam(b.mulai)}-${formatJam(b.selesai)}`,
        })),
        values,
      };
    }
  }

  const data = {
    judul: d.judul,
    jenis: d.jenis,
    mulai,
    selesai,
    ruanganId,
    praktikumId,
    kelas: teksAtauNull(d.kelas),
    pengampu: teksAtauNull(d.pengampu),
    keterangan: teksAtauNull(d.keterangan),
  };

  if (id) {
    await prisma.jadwal.update({ where: { id }, data });
  } else {
    await prisma.jadwal.create({ data });
  }

  redirect("/admin/jadwal");
}

export async function hapusJadwal(formData: FormData) {
  await wajibLogin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await prisma.jadwal.deleteMany({ where: { id } });
  revalidatePath("/admin/jadwal");
}