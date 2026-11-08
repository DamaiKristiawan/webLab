"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { wajibStaf } from "@/lib/auth";
import type { FormState } from "@/lib/form";

export async function hapusHasil(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  const h = await prisma.hasilTes.findUnique({ where: { id }, select: { tesId: true, npm: true } });
  if (!h) return {};
  await prisma.$transaction([
    prisma.hasilTes.deleteMany({ where: { id } }),
    prisma.sesiTes.deleteMany({ where: { tesId: h.tesId, npm: h.npm } }),
  ]);
  revalidatePath("/admin/hasil-tes");
  return {};
}

export async function resetSesi(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibStaf();
  const id = Number(formData.get("id"));
  await prisma.sesiTes.deleteMany({ where: { id, selesai: false } });
  revalidatePath("/admin/hasil-tes");
  return {};
}