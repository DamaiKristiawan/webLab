import { prisma } from "@/lib/prisma";
import { wajibLogin } from "@/lib/auth";

export const metadata = { title: "Dashboard Admin" };

export default async function Dashboard() {
  const staff = await wajibLogin();

  const [menunggu, totalPengajuan, totalJadwal, totalRespon] = await Promise.all([
    prisma.pengajuan.count({ where: { status: "MENUNGGU" } }),
    prisma.pengajuan.count(),
    prisma.jadwal.count(),
    prisma.responSurvei.count(),
  ]);

  const kartu = [
    { label: "Pengajuan menunggu", nilai: menunggu },
    { label: "Total pengajuan", nilai: totalPengajuan },
    { label: "Total jadwal", nilai: totalJadwal },
    { label: "Respon survei", nilai: totalRespon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Selamat datang, {staff.nama}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kartu.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-1 text-3xl font-bold">{k.nilai}</p>
          </div>
        ))}
      </div>
    </div>
  );
}