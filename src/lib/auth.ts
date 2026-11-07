import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const NAMA_COOKIE = "ltd_session";
const DURASI_HARI = 7;

function kunci() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diatur di .env");
  return new TextEncoder().encode(secret);
}

export async function buatSesi(staffId: number) {
  const token = await new SignJWT({ sub: String(staffId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURASI_HARI}d`)
    .sign(kunci());

  const store = await cookies();
  store.set(NAMA_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * DURASI_HARI,
  });
}

export async function hapusSesi() {
  const store = await cookies();
  store.delete(NAMA_COOKIE);
}

/** Staf yang sedang login (akun harus aktif), atau null. Peran dibaca dari database, bukan dari cookie. */
export async function ambilStaff() {
  const store = await cookies();
  const token = store.get(NAMA_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, kunci());
    const id = Number(payload.sub);
    if (!id) return null;

    const staff = await prisma.staff.findUnique({
      where: { id },
      select: { id: true, nama: true, username: true, rol: true, aktif: true },
    });
    if (!staff || !staff.aktif) return null;
    return staff;
  } catch {
    return null;
  }
}

/** Halaman dan aksi untuk SEMUA staf (admin dan asisten). */
export async function wajibStaf() {
  const staff = await ambilStaff();
  if (!staff) redirect("/admin/login");
  return staff;
}

/** Halaman dan aksi khusus ADMIN. Asisten diarahkan ke menu praktikum. */
export async function wajibAdmin() {
  const staff = await wajibStaf();
  if (staff.rol !== "ADMIN") redirect("/admin/praktikum");
  return staff;
}

/**
 * Nama lama. Sekarang sama dengan wajibAdmin, sehingga halaman jadwal dan
 * pengumuman yang sudah ada otomatis menjadi khusus admin tanpa mengubah filenya.
 */
export const wajibLogin = wajibAdmin;