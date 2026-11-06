"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buatSesi, hapusSesi } from "@/lib/auth";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email dan password wajib diisi." };

  const staff = await prisma.staff.findUnique({ where: { email } });
  const cocok = staff && staff.aktif ? await bcrypt.compare(password, staff.passwordHash) : false;

  if (!staff || !cocok) return { error: "Email atau password salah." };

  await buatSesi(staff.id);
  redirect("/admin");
}

export async function logout() {
  await hapusSesi();
  redirect("/admin/login");
}