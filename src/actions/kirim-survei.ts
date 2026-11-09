"use server";

import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ambilIp, batasi, IP_TAK_DIKENAL } from "@/lib/batas";
import { kumpulkanGalat, type FormState } from "@/lib/form";

const skemaPeserta = z.object({
  namaPeserta: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Maksimal 100 karakter."),
  npm: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z]{5,20}$/, "NPM/NIM 5-20 karakter (huruf atau angka).")
    .transform((v) => v.toUpperCase()),
});

// Nama dan NPM disimpan, hanya admin yang bisa melihatnya. Alamat IP hanya dipakai sesaat
// untuk membatasi spam dan tidak disimpan di database.
// Satu NPM hanya bisa mengisi satu kali per kuesioner (per periode); dijaga oleh constraint database.
export async function kirimSurvei(_prev: FormState, formData: FormData): Promise<FormState> {
  // Jebakan bot
  if (String(formData.get("website") ?? "") !== "") return { sukses: "Terima kasih." };

  const surveiId = Number(formData.get("surveiId")) || 0;
  const survei = await prisma.survei.findFirst({
    where: { id: surveiId, aktif: true },
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!survei || survei.pertanyaan.length === 0) return { error: "Kuesioner tidak tersedia." };

  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") values[k] = v;

  const galat: Record<string, string> = {};

  const peserta = skemaPeserta.safeParse(values);
  if (!peserta.success) Object.assign(galat, kumpulkanGalat(peserta.error.issues));

  const jawaban: { pertanyaanId: number; nilai: number | null; teks: string | null }[] = [];
  for (const p of survei.pertanyaan) {
    const mentah = (values[`q_${p.id}`] ?? "").trim();
    if (p.tipe === "SKALA") {
      const n = Number(mentah);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        galat[`q_${p.id}`] = "Wajib dijawab.";
        continue;
      }
      jawaban.push({ pertanyaanId: p.id, nilai: n, teks: null });
    } else {
      if (mentah.length > 1000) {
        galat[`q_${p.id}`] = "Maksimal 1000 karakter.";
        continue;
      }
      if (mentah) jawaban.push({ pertanyaanId: p.id, nilai: null, teks: mentah });
    }
  }

  if (Object.keys(galat).length > 0 || !peserta.success) {
    return { error: "Beberapa isian belum lengkap.", fieldErrors: galat, values };
  }
  const { namaPeserta, npm } = peserta.data;

  const ip = await ambilIp();
  const maks = ip === IP_TAK_DIKENAL ? 500 : 30;
  if (!batasi(`survei:${ip}`, maks, 24 * 60 * 60 * 1000)) {
    return { error: "Terlalu banyak pengisian dari jaringan Anda hari ini.", values };
  }

  const pesanSudah = `NPM ${npm} sudah mengisi kuesioner ini (periode ${survei.tahun}). Setiap NPM hanya dapat mengisi satu kali. Hubungi admin laboratorium bila ada kendala.`;

  const ada = await prisma.responSurvei.findUnique({
    where: { surveiId_npm: { surveiId, npm } },
    select: { id: true },
  });
  if (ada) return { error: pesanSudah, values };

  try {
    await prisma.responSurvei.create({
      data: { surveiId, namaPeserta, npm, jawaban: { create: jawaban } },
    });
  } catch (e) {
    // Dua pengiriman bersamaan untuk NPM yang sama
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: pesanSudah, values };
    }
    throw e;
  }

  return { sukses: "Terima kasih, jawaban Anda sudah tercatat." };
}