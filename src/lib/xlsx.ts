import { deflateRawSync } from "node:zlib";

// Pembuat berkas .xlsx sederhana tanpa pustaka tambahan (satu sheet, baris judul tebal dan dibekukan).
// Teks disimpan sebagai teks biasa, sehingga isi yang diawali = + - @ tidak dibaca Excel sebagai rumus.

export type SelXlsx = string | number | null | undefined;

const TABEL_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABEL_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(berkas: { nama: string; isi: string }[]) {
  const bagian: Buffer[] = [];
  const pusat: Buffer[] = [];
  let posisi = 0;

  for (const b of berkas) {
    const nama = Buffer.from(b.nama, "utf8");
    const mentah = Buffer.from(b.isi, "utf8");
    const mampat = deflateRawSync(mentah);
    const crc = crc32(mentah);

    const lokal = Buffer.alloc(30);
    lokal.writeUInt32LE(0x04034b50, 0);
    lokal.writeUInt16LE(20, 4);
    lokal.writeUInt16LE(0x0800, 6); // nama berkas UTF-8
    lokal.writeUInt16LE(8, 8); // deflate
    lokal.writeUInt16LE(0, 10);
    lokal.writeUInt16LE(0x21, 12); // tanggal tetap 1980-01-01
    lokal.writeUInt32LE(crc, 14);
    lokal.writeUInt32LE(mampat.length, 18);
    lokal.writeUInt32LE(mentah.length, 22);
    lokal.writeUInt16LE(nama.length, 26);
    lokal.writeUInt16LE(0, 28);
    bagian.push(lokal, nama, mampat);

    const p = Buffer.alloc(46);
    p.writeUInt32LE(0x02014b50, 0);
    p.writeUInt16LE(20, 4);
    p.writeUInt16LE(20, 6);
    p.writeUInt16LE(0x0800, 8);
    p.writeUInt16LE(8, 10);
    p.writeUInt16LE(0, 12);
    p.writeUInt16LE(0x21, 14);
    p.writeUInt32LE(crc, 16);
    p.writeUInt32LE(mampat.length, 20);
    p.writeUInt32LE(mentah.length, 24);
    p.writeUInt16LE(nama.length, 28);
    p.writeUInt32LE(posisi, 42);
    pusat.push(p, nama);

    posisi += lokal.length + nama.length + mampat.length;
  }

  const ukuranPusat = pusat.reduce((a, b) => a + b.length, 0);
  const akhir = Buffer.alloc(22);
  akhir.writeUInt32LE(0x06054b50, 0);
  akhir.writeUInt16LE(berkas.length, 8);
  akhir.writeUInt16LE(berkas.length, 10);
  akhir.writeUInt32LE(ukuranPusat, 12);
  akhir.writeUInt32LE(posisi, 16);

  return Buffer.concat([...bagian, ...pusat, akhir]);
}

function esc(s: string) {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function kolom(i: number) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** baris[0] dianggap judul kolom. lebar = lebar tiap kolom (satuan karakter). */
export function buatXlsx(namaSheet: string, baris: SelXlsx[][], lebar: number[] = []) {
  const xml = (isi: string) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n${isi}`;

  const data = baris
    .map((b, r) => {
      const sel = b
        .map((v, c) => {
          if (v === null || v === undefined || v === "") return "";
          const ref = `${kolom(c)}${r + 1}`;
          const gaya = r === 0 ? ' s="1"' : "";
          if (typeof v === "number" && Number.isFinite(v)) return `<c r="${ref}"${gaya}><v>${v}</v></c>`;
          return `<c r="${ref}"${gaya} t="inlineStr"><is><t xml:space="preserve">${esc(String(v))}</t></is></c>`;
        })
        .join("");
      return `<row r="${r + 1}">${sel}</row>`;
    })
    .join("");

  const cols = lebar.length
    ? `<cols>${lebar.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols>`
    : "";

  const sheet = xml(
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
      `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
      `${cols}<sheetData>${data}</sheetData></worksheet>`,
  );

  const nama = esc(namaSheet.replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Data");

  return zip([
    {
      nama: "[Content_Types].xml",
      isi: xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
          `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
          `<Default Extension="xml" ContentType="application/xml"/>` +
          `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
          `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
          `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
      ),
    },
    {
      nama: "_rels/.rels",
      isi: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
    },
    {
      nama: "xl/workbook.xml",
      isi: xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
          `<sheets><sheet name="${nama}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
    },
    {
      nama: "xl/_rels/workbook.xml.rels",
      isi: xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
          `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
      ),
    },
    {
      nama: "xl/styles.xml",
      isi: xml(
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
          `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>` +
          `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
          `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
          `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
          `<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
          `<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs>` +
          `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
      ),
    },
    { nama: "xl/worksheets/sheet1.xml", isi: sheet },
  ]);
}