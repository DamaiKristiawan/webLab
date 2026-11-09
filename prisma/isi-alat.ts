import { prisma } from "../src/lib/prisma";

// [kategori, nama, stok]
const DATA: [string, string, number][] = [
  // Sensor
  ["Sensor", "Sensor PIR", 2],
  ["Sensor", "HC SR04", 4],
  ["Sensor", "RCWL", 2],
  ["Sensor", "DHT 22", 1],
  ["Sensor", "DHT 11", 5],
  ["Sensor", "Flame Sensor", 1],
  ["Sensor", "Infrared Sensor", 3],
  ["Sensor", "LDR", 6],
  ["Sensor", "Mic", 3],
  ["Sensor", "Capacitive Soil", 2],
  ["Sensor", "Soil Moisture Sensor", 1],
  ["Sensor", "Water Sensor", 3],
  ["Sensor", "Touch Sensor", 2],
  ["Sensor", "RFID", 2],
  ["Sensor", "RTC", 3],
  ["Sensor", "MPU 6050", 1],

  // Mikrokontroler
  ["Mikrokontroler", "Arduino R3", 3],
  ["Mikrokontroler", "Arduino R3 SMD", 5],
  ["Mikrokontroler", "Arduino Mega", 1],
  ["Mikrokontroler", "ESP 8266", 3],
  ["Mikrokontroler", "ESP 32", 1], // GANTI: stok belum disebutkan
  ["Mikrokontroler", "Board NodeMCU", 1],

  // Aktuator
  ["Aktuator", "Servo", 4],
  ["Aktuator", "Buzzer", 2],
  ["Aktuator", "LCD 20x4", 1],
  ["Aktuator", "LCD 16x2", 2],
  ["Aktuator", "Fan Motor", 1],
  ["Aktuator", "Step Motor 5VDC", 1],
  ["Aktuator", "Pompa Air", 4],
  ["Aktuator", "Speaker", 1],
  ["Aktuator", "Relay", 4],

  // IC
  ["IC", "IC 7400", 8],
  ["IC", "IC 7402", 7],
  ["IC", "IC 7404", 13],
  ["IC", "IC 7406", 2],
  ["IC", "IC 7408", 33],
  ["IC", "IC 7410", 1],
  ["IC", "IC 7411", 2],
  ["IC", "IC 7414", 2],
  ["IC", "IC 7420", 3],
  ["IC", "IC 7421", 2],
  ["IC", "IC 7429", 2],
  ["IC", "IC 7430", 1],
  ["IC", "IC 7432", 8],
  ["IC", "IC 7436", 10],
  ["IC", "IC 7447", 15],
  ["IC", "IC 7448", 10],
  ["IC", "IC 7473", 9],
  ["IC", "IC 7474", 24],
  ["IC", "IC 7476", 25],
  ["IC", "IC 7478", 1],
  ["IC", "IC 7486", 5],
  ["IC", "IC 7490", 2],
  ["IC", "IC 7503", 6],
  ["IC", "IC 74138", 1],
  ["IC", "IC 74139", 11], // 10 + 1 (dua baris digabung)
  ["IC", "IC 74147", 6],
  ["IC", "IC 74148", 3],
  ["IC", "IC 74151", 3],
  ["IC", "IC 74153", 3],
  ["IC", "IC 74158", 2],
  ["IC", "IC 74164", 1],
  ["IC", "IC 74193", 1],
  ["IC", "IC 74266", 2],
  ["IC", "IC 74574", 10], // 9 + 1 (dua baris digabung)
  ["IC", "IC 4002", 2],
  ["IC", "IC 4026", 1],
  ["IC", "IC 4027", 18],
  ["IC", "IC 4511", 1],
  ["IC", "IC 380", 2],
  ["IC", "IC L2930", 1],
];

// Alat lama yang tidak dipinjamkan lagi (dinonaktifkan, bukan dihapus,
// supaya riwayat pengajuan lama tetap utuh).
const ALAT_LAMA = [
  "Function Generator",
  "Multimeter Digital",
  "Osiloskop",
  "Power Supply DC",
  "Trainer Digital",
];

async function main() {
  for (const [kategori, nama, stokTotal] of DATA) {
    const ada = await prisma.alat.findFirst({ where: { nama } });
    if (ada) {
      await prisma.alat.update({
        where: { id: ada.id },
        data: { kategori, stokTotal, aktif: true },
      });
    } else {
      await prisma.alat.create({ data: { nama, kategori, stokTotal, aktif: true } });
    }
  }

  const nonaktif = await prisma.alat.updateMany({
    where: { nama: { in: ALAT_LAMA } },
    data: { aktif: false },
  });

  console.log(`Selesai: ${DATA.length} alat diproses, ${nonaktif.count} alat lama dinonaktifkan.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());