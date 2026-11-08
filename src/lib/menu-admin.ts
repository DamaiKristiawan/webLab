export type Rol = "ADMIN" | "ASISTEN";

export type IkonKey =
  | "dash"
  | "inbox"
  | "cal"
  | "book"
  | "clip"
  | "box"
  | "users"
  | "mega"
  | "chat"
  | "img"
  | "cog"
  | "key";

export type ItemMenu = { label: string; href: string; ikon: IkonKey; rol: Rol[] };
export type GrupMenu = { grup: string; items: ItemMenu[] };

const SEMUA: Rol[] = ["ADMIN", "ASISTEN"];
const ADMIN: Rol[] = ["ADMIN"];

// Satu-satunya tempat yang menentukan menu per peran.
// Ini hanya tampilan: penegakan akses tetap di server (wajibAdmin / wajibStaf).
export const menuAdmin: GrupMenu[] = [
  {
    grup: "Utama",
    items: [
      { label: "Dashboard", href: "/admin", ikon: "dash", rol: ADMIN },
      { label: "Pengajuan", href: "/admin/pengajuan", ikon: "inbox", rol: ADMIN },
      { label: "Jadwal", href: "/admin/jadwal", ikon: "cal", rol: ADMIN },
      { label: "Jadwal Piket", href: "/admin/piket", ikon: "users", rol: ADMIN },
    ],
  },
  {
    grup: "Praktikum",
    items: [
      { label: "Praktikum", href: "/admin/praktikum", ikon: "book", rol: SEMUA },
      { label: "Hasil Tes", href: "/admin/hasil-tes", ikon: "clip", rol: SEMUA },
    ],
  },
  {
    grup: "Kelola",
    items: [
      { label: "Inventaris", href: "/admin/inventaris", ikon: "box", rol: ADMIN },
      { label: "Anggota Lab", href: "/admin/anggota", ikon: "users", rol: ADMIN },
      { label: "Pengumuman", href: "/admin/pengumuman", ikon: "mega", rol: ADMIN },
      { label: "Survei", href: "/admin/survei", ikon: "chat", rol: ADMIN },
      { label: "Dokumentasi", href: "/admin/dokumentasi", ikon: "img", rol: ADMIN },
      { label: "Pengaturan", href: "/admin/pengaturan", ikon: "cog", rol: ADMIN },
      { label: "Akun Staf", href: "/admin/staf", ikon: "key", rol: ADMIN },
    ],
  },
];

export function menuUntuk(rol: Rol): GrupMenu[] {
  return menuAdmin
    .map((g) => ({ ...g, items: g.items.filter((i) => i.rol.includes(rol)) }))
    .filter((g) => g.items.length > 0);
}