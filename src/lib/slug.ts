/** "Praktikum Rangkaian Logika #1" -> "praktikum-rangkaian-logika-1" */
export function slugify(teks: string) {
  const hasil = teks
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return hasil || "praktikum";
}