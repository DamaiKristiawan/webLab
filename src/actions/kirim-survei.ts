"use server";

import { prisma } from "@/lib/prisma";
import { ambilIp, batasi, IP_TAK_DIKENAL } from "@/lib/batas";
import type { FormState } from "@/lib/form";

// Pengisian survei sengaja tidak menyimpan identitas apa pun (nama, NPM, IP).
// Alamat IP hanya dipakai sesaat untuk membatasi spam dan tidak disimpan di database.
export async function kirimSurvei(_prev: FormState, formData: FormData): Promise<FormState> {
  // Jebakan bot
  if (String(formData.get("website") ?? "") !== "") return { sukses: "Terima kasih." };

  const surveiId = Number(formData.get("surveiId")) || 0;
  const survei = await prisma.survei.findFirst({
    where: { id: surveiId, aktif: true },
    include: { pertanyaan: { orderBy: [{ urutan: "asc" }, { id: "asc" }] } },
  });
  if (!survei || survei.pertanyaan.length === 0) return { error: "Survei tidak tersedia." };

  const values: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") values[k] = v;

  const galat: Record<string, string> = {};
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

  if (Object.keys(galat).length > 0) {
    return { error: "Beberapa pertanyaan belum dijawab.", fieldErrors: galat, values };
  }

  const ip = await ambilIp();
  const maks = ip === IP_TAK_DIKENAL ? 500 : 10;
  if (!batasi(`survei:${ip}`, maks, 24 * 60 * 60 * 1000)) {
    return { error: "Terlalu banyak pengisian dari jaringan Anda hari ini.", values };
  }

  await prisma.responSurvei.create({
    data: { surveiId, jawaban: { create: jawaban } },
  });

  return { sukses: "Terima kasih atas masukan Anda." };
}