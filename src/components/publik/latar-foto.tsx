// Latar hero berupa foto (public/hero-lab.jpg) dengan gradasi biru navy.
// Bila foto belum ada, yang terlihat adalah gradasi bawaan .hero-lab.
export function LatarFoto() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-cover"
        style={{ backgroundImage: "url(/hero-lab.jpg)", backgroundPosition: "center 65%" }}
      />
      {/* Layar kecil: gelap merata supaya tulisan terbaca */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 lg:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(6,22,70,0.9), rgba(6,22,70,0.78))",
        }}
      />
      {/* Layar lebar: gelap di kiri, foto makin jelas ke kanan */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 hidden lg:block"
        style={{
          background:
            "linear-gradient(100deg, rgba(6,22,70,0.96) 0%, rgba(8,32,96,0.88) 36%, rgba(10,40,120,0.4) 68%, rgba(10,40,120,0.12) 100%)",
        }}
      />
      {/* Pudar halus ke bawah agar menyatu dengan halaman */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-20 h-24"
        style={{ background: "linear-gradient(to top, rgba(5,12,28,0.45), transparent)" }}
      />
    </>
  );
}