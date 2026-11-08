import { z } from "zod";

const tautanHttps = z
  .string()
  .trim()
  .max(500, "Tautan terlalu panjang.")
  .refine((v) => v === "" || /^https:\/\/\S+$/.test(v), "Tautan harus diawali https://");

export const skemaPraktikum = z.object({
  nama: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Maksimal 100 karakter."),
  deskripsi: z.string().trim().max(1000, "Maksimal 1000 karakter."),
  modulUrl: tautanHttps,
});

export const skemaJudul = z.object({
  judul: z.string().trim().min(3, "Judul minimal 3 karakter.").max(150, "Maksimal 150 karakter."),
});

export const skemaTes = z.object({
  durasiMenit: z
    .string()
    .trim()
    .regex(/^\d{1,3}$/, "Isi dengan angka.")
    .refine((v) => Number(v) >= 1 && Number(v) <= 300, "Antara 1 dan 300 menit."),
});

export const skemaPeserta = z.object({
  namaPeserta: z.string().trim().min(3, "Nama minimal 3 karakter.").max(100, "Maksimal 100 karakter."),
  npm: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z]{5,20}$/, "NPM/NIM 5-20 karakter (huruf atau angka).")
    .transform((v) => v.toUpperCase()),
});
