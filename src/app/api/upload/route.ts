// Unggah berkas dari pengajuan sudah ditangani langsung oleh Server Action.
// Berkas ini disiapkan untuk unggahan lain (mis. modul, foto) di tahap berikutnya.
export async function POST() {
  return new Response("Belum tersedia.", { status: 501 });
}