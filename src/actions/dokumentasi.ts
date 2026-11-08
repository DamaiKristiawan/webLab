"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { wajibAdmin } from "@/lib/auth";
import { ambilTeks, kumpulkanGalat, type FormState } from "@/lib/form";
import { slugify } from "@/lib/slug";
import { hapusGambar, periksaGambar, simpanGambar, type GambarValid } from "@/lib/media";

const MAKS_FOTO_SEKALI = 12;

const skema = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter.").max(150, "Maksimal 150 karakter."),
  ringkasan: z.string().trim().max(300, "Maksimal 300 karakter."),
  isi: z.string().trim().max(10000, "Maksimal 10.000 karakter."),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Isi tanggal kegiatan."),
});

// Tanggal disimpan pukul 12.00 WIB supaya tidak bergeser hari di zona waktu mana pun.
function parseTanggal(teks: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(teks);
  if (!m) return null;
  const [y, mo, d] = m.slice(1).map(Number);
  const t = new Date(Date.UTC(y, mo - 1, d, 5, 0));
  return t.getUTCMonth() === mo - 1 && t.getUTCDate() === d ? t : null;
}

async function slugUnik(judul: string) {
  const dasar = slugify(judul);
  for (let i = 1; i < 100; i++) {
    const calon = i === 1 ? dasar : `${dasar}-${i}`;
    if (!(await prisma.dokumentasi.findUnique({ where: { slug: calon }, select: { id: true } }))) return calon;
  }
  return `${dasar}-${Date.now()}`;
}

function segarkan(slug?: string | null) {
  revalidatePath("/admin/dokumentasi");
  revalidatePath("/dokumentasi");
  if (slug) revalidatePath(`/dokumentasi/${slug}`);
}

export async function simpanDokumentasi(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id")) || 0;
  const terbit = formData.get("terbit") === "on";
  const values = { ...ambilTeks(formData, ["judul", "ringkasan", "isi", "tanggal"]), terbit: terbit ? "on" : "" };

  const h = skema.safeParse(values);
  const galat: Record<string, string> = h.success ? {} : kumpulkanGalat(h.error.issues);
  const tanggal = parseTanggal(values.tanggal);
  if (!tanggal && !galat.tanggal) galat.tanggal = "Tanggal tidak valid.";
  if (!h.success || !tanggal || Object.keys(galat).length > 0) {
    return { error: "Periksa kembali isian.", fieldErrors: galat, values };
  }
  const d = h.data;

  // Foto: periksa semuanya dulu sebelum ada yang disimpan
  const berkas = formData.getAll("foto").filter((f): f is File => f instanceof File && f.size > 0);
  if (berkas.length > MAKS_FOTO_SEKALI) {
    return { error: `Maksimal ${MAKS_FOTO_SEKALI} foto sekali unggah.`, values };
  }
  const diterima: GambarValid[] = [];
  for (const f of berkas) {
    const p = await periksaGambar(f);
    if ("error" in p) return { error: `Foto "${f.name}": ${p.error}`, values };
    diterima.push(p);
  }

  const lama = id
    ? await prisma.dokumentasi.findUnique({
        where: { id },
        select: {
          slug: true,
          coverUrl: true,
          foto: { select: { urutan: true }, orderBy: { urutan: "desc" }, take: 1 },
        },
      })
    : null;
  if (id && !lama) return { error: "Kegiatan tidak ditemukan.", values };

  const urls: string[] = [];
  let tujuanId = id;
  try {
    for (const g of diterima) urls.push(await simpanGambar(g));

    if (id && lama) {
      const awalUrutan = (lama.foto[0]?.urutan ?? -1) + 1;
      await prisma.dokumentasi.update({
        where: { id },
        data: {
          judul: d.judul,
          ringkasan: d.ringkasan || null,
          isi: d.isi || null,
          tanggal,
          terbit,
          coverUrl: lama.coverUrl ?? urls[0] ?? null,
          foto: urls.length > 0 ? { create: urls.map((url, i) => ({ url, urutan: awalUrutan + i })) } : undefined,
        },
      });
    } else {
      const baru = await prisma.dokumentasi.create({
        data: {
          judul: d.judul,
          slug: await slugUnik(d.judul),
          ringkasan: d.ringkasan || null,
          isi: d.isi || null,
          tanggal,
          terbit,
          coverUrl: urls[0] ?? null,
          foto: { create: urls.map((url, i) => ({ url, urutan: i })) },
        },
      });
      tujuanId = baru.id;
    }
  } catch (e) {
    await Promise.all(urls.map((u) => hapusGambar(u))); // batalkan unggahan bila database gagal
    throw e;
  }

  segarkan(lama?.slug);
  if (!id) redirect(`/admin/dokumentasi/${tujuanId}`);
  return {
    sukses: urls.length > 0 ? `Tersimpan, ${urls.length} foto ditambahkan.` : "Perubahan disimpan.",
    values,
  };
}

export async function alihkanTerbit(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const k = await prisma.dokumentasi.findUnique({ where: { id } });
  if (!k) return { error: "Data tidak ditemukan." };
  await prisma.dokumentasi.update({ where: { id }, data: { terbit: !k.terbit } });
  segarkan(k.slug);
  return {};
}

export async function hapusDokumentasi(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const k = await prisma.dokumentasi.findUnique({ where: { id }, include: { foto: { select: { url: true } } } });
  if (!k) return {};
  await prisma.dokumentasi.delete({ where: { id } }); // foto ikut terhapus dari database
  await Promise.all(k.foto.map((f) => hapusGambar(f.url)));
  segarkan(k.slug);
  return {};
}

export async function hapusFoto(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const f = await prisma.dokumentasiFoto.findUnique({ where: { id }, include: { dokumentasi: true } });
  if (!f) return {};

  await prisma.dokumentasiFoto.delete({ where: { id } });
  await hapusGambar(f.url);

  // Bila yang dihapus adalah sampul, pindahkan ke foto lain (atau kosongkan)
  if (f.dokumentasi.coverUrl === f.url) {
    const sisa = await prisma.dokumentasiFoto.findFirst({
      where: { dokumentasiId: f.dokumentasiId },
      orderBy: { urutan: "asc" },
    });
    await prisma.dokumentasi.update({ where: { id: f.dokumentasiId }, data: { coverUrl: sisa?.url ?? null } });
  }
  segarkan(f.dokumentasi.slug);
  revalidatePath(`/admin/dokumentasi/${f.dokumentasiId}`);
  return {};
}

export async function jadikanSampul(_p: FormState, formData: FormData): Promise<FormState> {
  await wajibAdmin();
  const id = Number(formData.get("id"));
  const f = await prisma.dokumentasiFoto.findUnique({ where: { id }, include: { dokumentasi: true } });
  if (!f) return { error: "Foto tidak ditemukan." };
  await prisma.dokumentasi.update({ where: { id: f.dokumentasiId }, data: { coverUrl: f.url } });
  segarkan(f.dokumentasi.slug);
  revalidatePath(`/admin/dokumentasi/${f.dokumentasiId}`);
  return {};
}