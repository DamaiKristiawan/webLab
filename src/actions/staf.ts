"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin, wajibStaf } from "@/lib/auth";

export type StafState = {
  error?: string;
  sukses?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{3,30}$/, "3-30 karakter: huruf kecil, angka, titik, strip, garis bawah.");

const password = z
  .string()
  .min(8, "Password minimal 8 karakter.")
  .max(72, "Password maksimal 72 karakter.");

const skemaTambah = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  username,
  rol: z.enum(["ADMIN", "ASISTEN"]),
  password,
});

function kumpulkanGalat(isu: { path: PropertyKey[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const i of isu) {
    const k = String(i.path[0] ?? "");
    if (k && !fieldErrors[k]) fieldErrors[k] = i.message;
  }
  return fieldErrors;
}

export async function tambahStaf(_prev: StafState, formData: FormData): Promise<StafState> {
  await wajibAdmin();

  const values = {
    nama: String(formData.get("nama") ?? ""),
    username: String(formData.get("username") ?? ""),
    rol: String(formData.get("rol") ?? "ASISTEN"),
  };

  const hasil = skemaTambah.safeParse({ ...values, password: String(formData.get("password") ?? "") });
  if (!hasil.success) {
    return {
      error: "Periksa kembali isian formulir.",
      fieldErrors: kumpulkanGalat(hasil.error.issues),
      values,
    };
  }
  const d = hasil.data;

  try {
    await prisma.staff.create({
      data: {
        nama: d.nama,
        username: d.username,
        rol: d.rol,
        passwordHash: await bcrypt.hash(d.password, 12),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Username sudah dipakai.", fieldErrors: { username: "Sudah dipakai." }, values };
    }
    throw e;
  }

  revalidatePath("/admin/staf");
  return { sukses: `Akun @${d.username} berhasil dibuat.` };
}

/** Admin terakhir yang aktif tidak boleh dinonaktifkan atau diturunkan. */
async function adminLain(kecualiId: number) {
  return prisma.staff.count({ where: { rol: "ADMIN", aktif: true, NOT: { id: kecualiId } } });
}

export async function alihkanAktif(formData: FormData) {
  const saya = await wajibAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id === saya.id) return; // tidak boleh menonaktifkan diri sendiri

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return;
  if (target.aktif && target.rol === "ADMIN" && (await adminLain(id)) === 0) return;

  await prisma.staff.update({ where: { id }, data: { aktif: !target.aktif } });
  revalidatePath("/admin/staf");
}

export async function alihkanRol(formData: FormData) {
  const saya = await wajibAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id === saya.id) return; // tidak boleh mengubah peran sendiri

  const target = await prisma.staff.findUnique({ where: { id } });
  if (!target) return;
  if (target.rol === "ADMIN" && target.aktif && (await adminLain(id)) === 0) return;

  await prisma.staff.update({
    where: { id },
    data: { rol: target.rol === "ADMIN" ? "ASISTEN" : "ADMIN" },
  });
  revalidatePath("/admin/staf");
}

export async function resetPasswordStaf(_prev: StafState, formData: FormData): Promise<StafState> {
  await wajibAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "Data tidak valid." };

  const hasil = password.safeParse(String(formData.get("password") ?? ""));
  if (!hasil.success) return { error: hasil.error.issues[0]?.message ?? "Password tidak valid." };

  const { count } = await prisma.staff.updateMany({
    where: { id },
    data: { passwordHash: await bcrypt.hash(hasil.data, 12) },
  });
  if (count === 0) return { error: "Akun tidak ditemukan." };

  return { sukses: "Password diubah." };
}

export async function ubahPasswordSendiri(_prev: StafState, formData: FormData): Promise<StafState> {
  const saya = await wajibStaf();

  const lama = String(formData.get("lama") ?? "");
  const baru = String(formData.get("baru") ?? "");
  const konfirmasi = String(formData.get("konfirmasi") ?? "");

  const hasil = password.safeParse(baru);
  if (!hasil.success) return { error: hasil.error.issues[0]?.message ?? "Password tidak valid." };
  if (baru !== konfirmasi) return { error: "Konfirmasi password tidak sama." };

  const data = await prisma.staff.findUnique({ where: { id: saya.id }, select: { passwordHash: true } });
  if (!data || !(await bcrypt.compare(lama, data.passwordHash))) {
    return { error: "Password lama salah." };
  }

  await prisma.staff.update({
    where: { id: saya.id },
    data: { passwordHash: await bcrypt.hash(hasil.data, 12) },
  });
  return { sukses: "Password berhasil diubah." };
}