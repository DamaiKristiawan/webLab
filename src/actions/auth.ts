"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buatSesi, hapusSesi } from "@/lib/auth";

export type LoginState = { error?: string; username?: string };

// Hash palsu agar waktu respons sama, baik username ada maupun tidak.
const HASH_PALSU = bcrypt.hashSync("tidak-dipakai", 10);

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username dan password wajib diisi.", username };
  }

  const staff = await prisma.staff.findUnique({ where: { username } });
  const cocok = await bcrypt.compare(password, staff?.passwordHash ?? HASH_PALSU);

  if (!staff || !staff.aktif || !cocok) {
    return { error: "Username atau password salah.", username };
  }

  await buatSesi(staff.id);
  redirect(staff.rol === "ADMIN" ? "/admin" : "/admin/praktikum");
}

export async function logout() {
  await hapusSesi();
  redirect("/admin/login");
}