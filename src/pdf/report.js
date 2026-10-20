/**
 * Generator laporan PDF (A4) proses dan hasil perhitungan nilai wajar sewa.
 * Murni berbasis data: menerima input + hasil perhitungan + identitas laporan,
 * mengembalikan dokumen jsPDF. Tidak membaca DOM, jadi bisa diuji di Node.
 */
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { fmtInt, fmtRp, fmtPct, fmtDec, fmtAdj, fmtDateLong, compact } from '@/core/format.js';
import { terbilangRupiah } from '@/core/terbilang.js';
import { buildSteps } from '@/core/steps.js';
import { CRIT, CRIT_ORDER, TRANSACTION_ADJ, TENORS, levelName } from '@/core/constants.js';
import { growthAverage, growthCount, riskFreeFor } from '@/core/rent.js';
import { perM2Month } from '@/core/valuation.js';
import { yScale } from '@/utils/chartScale.js';

const PAGE = { w: 210, h: 297 };
const M = { l: 18, r: 18, t: 18, b: 20 };
const CW = PAGE.w - M.l - M.r;
const PT = 0.3528; // mm per point

const C = {
  ink: [19, 33, 43],
  ink2: [68, 84, 95],
  ink3: [102, 116, 127],
  accent: [11, 95, 115],
  accentSoft: [221, 236, 240],
  soft: [236, 241, 243],
  line: [205, 214, 219],
  s1: [42, 120, 214],
  s2: [235, 104, 52]
};

/** Font standar PDF memakai WinAnsi: ganti karakter di luar set itu */
export function pdfText(value) {
  return String(value ?? '')
    .replace(/−/g, '-')
    .replace(/[–—]/g, '-')
    .replace(/→/g, 'menjadi')
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/²/g, '2')
    .replace(/³/g, '3');
}

function clean(rows) {
  if (!rows) return rows;
  return rows.map((row) =>
    row.map((cell) => {
      if (cell && typeof cell === 'object') return { ...cell, content: pdfText(cell.content) };
      return pdfText(cell);
    })
  );
}

function slug(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function reportFilename(data, meta) {
  const date = meta.tanggal || new Date().toISOString().slice(0, 10);
  return `KKAP-Sewa-DCF_${slug(data.nama) || 'Objek'}_${date}.pdf`;
}

const RIGHT = { halign: 'right' };
const scoreText = (k, s) => (s == null ? '-' : `${s} · ${levelName(k, s)}`);

class ReportWriter {
  constructor(doc) {
    this.doc = doc;
    this.y = M.t;
    this.no = 0;
  }

  ensure(h) {
    if (this.y + h > PAGE.h - M.b) {
      this.doc.addPage();
      this.y = M.t;
    }
  }

  font(style = 'normal', size = 9, color = C.ink, family = 'helvetica') {
    this.doc.setFont(family, style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }

  /** Judul bagian; `follow` = ruang minimum (mm) untuk isi pertama agar judul tidak yatim di dasar halaman */
  section(title, follow = 16) {
    this.ensure(11 + follow);
    this.no += 1;
    this.y += 2;
    this.font('bold', 11, C.accent);
    this.doc.text(`${this.no}.`, M.l, this.y);
    this.font('bold', 11, C.ink);
    this.doc.text(pdfText(title), M.l + 7, this.y);
    this.doc.setDrawColor(...C.line);
    this.doc.setLineWidth(0.25);
    this.doc.line(M.l, this.y + 2, PAGE.w - M.r, this.y + 2);
    this.y += 7;
  }

  sub(title, x = M.l) {
    this.ensure(14);
    this.font('bold', 9.2, C.ink2);
    this.doc.text(pdfText(title), x, this.y + 3);
    this.y += 5.5;
  }

  para(text, { size = 8.8, color = C.ink2, style = 'normal', family = 'helvetica', indent = 0, after = 2 } = {}) {
    this.font(style, size, color, family);
    const lines = this.doc.splitTextToSize(pdfText(text), CW - indent);
    const lh = size * PT * 1.3;
    lines.forEach((line) => {
      this.ensure(lh);
      this.doc.text(line, M.l + indent, this.y + size * PT);
      this.y += lh;
    });
    this.y += after;
  }

  table(opts, { advance = true } = {}) {
    const { styles, headStyles, footStyles, margin, head, body, foot, ...rest } = opts;
    autoTable(this.doc, {
      startY: this.y,
      theme: 'grid',
      showHead: 'everyPage',
      showFoot: 'lastPage',
      margin: { left: M.l, right: M.r, top: M.t + 2, bottom: M.b, ...(margin || {}) },
      styles: {
        font: 'helvetica',
        fontSize: 8.2,
        cellPadding: { top: 1.4, bottom: 1.4, left: 1.8, right: 1.8 },
        textColor: C.ink,
        lineColor: C.line,
        lineWidth: 0.15,
        overflow: 'linebreak',
        valign: 'middle',
        ...(styles || {})
      },
      headStyles: { fillColor: C.soft, textColor: C.ink2, fontStyle: 'bold', fontSize: 7.8, ...(headStyles || {}) },
      footStyles: { fillColor: C.accentSoft, textColor: C.ink, fontStyle: 'bold', ...(footStyles || {}) },
      head: clean(head),
      body: clean(body),
      foot: clean(foot),
      ...rest
    });
    const finalY = this.doc.lastAutoTable.finalY;
    if (advance) this.y = finalY + 5;
    return finalY;
  }
}

/* ---------------- Bagian laporan ---------------- */

function drawHeader(w, data, res, meta) {
  const d = w.doc;
  d.setFillColor(...C.accent);
  d.rect(0, 0, PAGE.w, 4, 'F');
  w.y = M.t;
  w.font('bold', 8, C.ink3);
  d.text('KERTAS KERJA ANALISIS PERHITUNGAN', M.l, w.y, { charSpace: 0.35 });
  w.y += 7.5;
  w.font('bold', 17, C.ink);
  d.text('Nilai Wajar atas Sewa', M.l, w.y);
  w.y += 5.5;
  w.font('normal', 9.2, C.ink2);
  d.text('Pemanfaatan BMN melalui sewa · Metode discounted cashflow · Sewa dibayar sekaligus di muka', M.l, w.y);
  w.y += 5;

  const area = res.area;
  const penilai = [meta.penilai, meta.nip ? `NIP ${meta.nip}` : ''].filter(Boolean).join(' / ');
  const rows = [
    ['Objek penilaian', data.nama || '-', true],
    ['Lokasi', meta.lokasi],
    ['Pengguna barang', meta.pengguna],
    ['Luas tanah', area > 0 ? `${fmtDec(area)} m²` : '-', true],
    ['Luas bangunan', res.building && res.building.luas > 0 ? `${fmtDec(res.building.luas)} m²` : ''],
    ['Tanggal penilaian', fmtDateLong(meta.tanggal)],
    ['Nomor surat tugas', meta.suratTugas],
    ['Penilai', penilai]
  ]
    .filter((r) => r[2] || r[1])
    .map((r) => [r[0], r[1]]);

  w.table({
    body: rows,
    theme: 'plain',
    styles: { fontSize: 8.8, cellPadding: { top: 0.8, bottom: 0.8, left: 0, right: 2 } },
    columnStyles: { 0: { cellWidth: 38, textColor: C.ink3 }, 1: { fontStyle: 'bold' } }
  });

  // Kotak hasil utama
  const s = res.main;
  const ready = res.ready;
  w.font('italic', 8.5);
  const words = ready ? d.splitTextToSize(pdfText(terbilangRupiah(s.rounded)), CW - 12) : [];
  const kpi = ready
    ? `Rata-rata per tahun ${fmtRp(s.rounded / 5)}${area > 0 ? `  ·  Per m² per bulan: tahun ke-1 ${fmtRp(s.cf1 / area / 12)}, rata-rata ${fmtRp(s.rounded / 5 / area / 12)}` : ''}`
    : 'Lengkapi nilai properti dan risk free tenor 5 tahun.';
  const h = 22 + words.length * 3.6 + 5;
  w.ensure(h + 4);
  d.setFillColor(...C.accentSoft);
  d.setDrawColor(...C.accent);
  d.setLineWidth(0.3);
  d.roundedRect(M.l, w.y, CW, h, 2, 2, 'FD');
  w.font('bold', 7.6, C.accent);
  d.text('NILAI WAJAR ATAS SEWA 5 TAHUN, DIBAYAR SEKALIGUS DI MUKA', M.l + 6, w.y + 6, { charSpace: 0.25 });
  w.font('bold', 19, C.ink);
  d.text(ready ? pdfText(fmtRp(s.rounded)) : 'Belum dapat dihitung', M.l + 6, w.y + 14.5);
  let yy = w.y + 20;
  if (words.length) {
    w.font('italic', 8.5, C.ink2);
    words.forEach((line) => {
      d.text(line, M.l + 6, yy);
      yy += 3.6;
    });
  }
  w.font('normal', 7.8, C.ink2);
  d.text(pdfText(kpi), M.l + 6, yy + 1.5);
  w.y += h + 6;
}

function drawSummary(w, data, res) {
  w.section('Ringkasan nilai wajar sewa per jangka waktu', 50);
  const body = res.rent.scen.map((s) => {
    if (s.missing) return [`${s.n} tahun`, { content: 'Risk free belum diisi', colSpan: 6, styles: { textColor: C.ink3 } }];
    const m2 = res.value > 0 ? perM2Month(s, res.area) : null;
    return [`${s.n} tahun`, fmtPct(s.rf), fmtPct(s.cap), fmtPct(s.disc), fmtInt(s.cf1), fmtInt(s.rounded), m2 == null ? '-' : fmtInt(m2)];
  });
  w.table({
    head: [['Jangka waktu', 'Risk free', 'Kapitalisasi', 'Diskonto', 'Arus kas tahun 1 (Rp)', 'Nilai wajar sewa (Rp)', 'Rp/m²/bulan*']],
    body,
    columnStyles: { 1: RIGHT, 2: RIGHT, 3: RIGHT, 4: RIGHT, 5: RIGHT, 6: RIGHT },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right';
      if (hook.section === 'body' && hook.row.index === 4) {
        hook.cell.styles.fontStyle = 'bold';
        hook.cell.styles.fillColor = C.accentSoft;
      }
    }
  });
  w.y -= 2;
  w.para('*Rata-rata per m² per bulan selama jangka waktu sewa. Nilai wajar sewa dibulatkan ke ribuan rupiah.', { size: 7.5, color: C.ink3, after: 3 });
}

function drawAssumptions(w, data, res) {
  w.section('Data dan asumsi', 60);
  const b = res.building;
  const landSource = data.mode === 'tanah' ? 'Pendekatan pembandingan data pasar (lihat lampiran)' : 'Input langsung penilai';
  const rows = [
    ['Jenis objek', b ? 'Tanah dan bangunan' : 'Tanah', ''],
    ['Luas tanah', res.area > 0 ? `${fmtDec(res.area)} m²` : '-', ''],
    ...(b
      ? [
          ['Nilai tanah', fmtRp(res.landValue), landSource],
          ['Nilai bangunan', fmtRp(b.nilai), b.luas > 0 ? `Input langsung penilai; ${fmtDec(b.luas)} m², ${fmtRp(b.perM2)} per m²` : 'Input langsung penilai'],
          ['Nilai properti objek penilaian', fmtRp(res.value), 'Nilai tanah + nilai bangunan'],
          ['Umur ekonomis bangunan', b.umurEkonomis > 0 ? `${fmtDec(b.umurEkonomis)} tahun` : '-', ''],
          ['Umur efektif bangunan', `${fmtDec(b.umurEfektif)} tahun`, ''],
          ['Sisa umur ekonomis', `${fmtDec(b.sisa)} tahun`, 'Umur ekonomis - umur efektif']
        ]
      : [['Nilai properti objek penilaian', fmtRp(res.value), landSource]]),
    [
      'Recapture rate',
      fmtPct(res.rent.rc),
      b ? (b.sisa > 0 ? `1 ÷ ${fmtDec(b.sisa)} tahun, diterapkan ke seluruh nilai properti` : 'Sisa umur ekonomis belum tersedia') : 'Objek berupa tanah, recapture 0%'
    ],
    [
      'Tingkat kenaikan sewa',
      fmtPct(res.rent.g),
      data.growth.mode === 'hist'
        ? `Rata-rata ${growthCount(data)} data historis (${fmtDec(growthAverage(data), 2, 4)}%), dibulatkan 2 desimal`
        : 'Input manual penilai'
    ],
    ['Sumber kenaikan sewa', { content: data.growth.sumber || '-', colSpan: 2 }],
    ['Risk free', data.rf.same ? 'Satu nilai' : 'Per tenor', data.rf.same ? 'Risk free tenor 5 tahun dipakai untuk semua jangka waktu' : 'Risk free sesuai jangka waktu sewa'],
    ['Sumber risk free', { content: data.rf.sumber || '-', colSpan: 2 }]
  ];
  w.table({
    head: [['Uraian', 'Nilai', 'Keterangan']],
    body: rows,
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' } },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index === 1) hook.cell.styles.halign = 'right';
      if (hook.section === 'body' && hook.cell.colSpan === 2) {
        hook.cell.styles.halign = 'left';
        hook.cell.styles.fontStyle = 'normal';
      }
    }
  });

  const rfBody = TENORS.map((n) => {
    const v = riskFreeFor(data, n);
    return [`${n} tahun`, v == null ? '-' : `${fmtDec(v, 2, 4)}%`];
  });
  const hist = data.growth.mode === 'hist' ? data.growth.hist : [];
  const histBody = hist.map((h) => [h.label || '-', h.v == null ? '-' : `${fmtDec(h.v, 2, 4)}%`]);
  const histFoot = [
    ['Rata-rata', `${fmtDec(growthAverage(data), 2, 4)}%`],
    ['Dibulatkan', `${fmtDec(res.rent.g * 100, 2, 2)}%`]
  ];
  const half = (CW - 8) / 2;
  const sideBySide = hist.length > 0 && hist.length <= 10;

  const halfRight = { right: M.r + half + 8 };
  const rightAlign = (hook) => { if (hook.section !== 'body' && hook.column.index === 1) hook.cell.styles.halign = 'right'; };

  w.ensure(sideBySide ? 16 + (hist.length + 3) * 6 : 50);
  const start = w.y;
  w.sub('Risk free per jangka waktu');
  const tableY = w.y;
  const rfEnd = w.table(
    { head: [['Jangka waktu', 'Risk free']], body: rfBody, margin: halfRight, columnStyles: { 1: RIGHT }, didParseCell: rightAlign },
    { advance: false }
  );
  if (!hist.length) {
    w.y = rfEnd + 5;
    return;
  }

  const histTable = (margin) =>
    w.table({ head: [['Periode', 'Kenaikan sewa']], body: histBody, foot: histFoot, margin, columnStyles: { 1: RIGHT }, didParseCell: rightAlign }, { advance: false });

  if (sideBySide) {
    w.y = start;
    w.sub('Data historis kenaikan sewa', M.l + half + 8);
    w.y = tableY;
    const histEnd = histTable({ left: M.l + half + 8 });
    w.y = Math.max(rfEnd, histEnd) + 5;
  } else {
    w.y = rfEnd + 5;
    w.sub('Data historis kenaikan sewa');
    w.y = histTable(halfRight) + 5;
  }
}

function drawSteps(w, data, res, tenor) {
  const steps = buildSteps(data, res, tenor);
  if (!steps.length) return;
  w.section(`Langkah perhitungan (sewa ${tenor} tahun)`, 34);
  w.para('Jangka waktu lain memakai rumus yang sama dengan risk free sesuai tenornya (lihat ringkasan).', { size: 8.2, color: C.ink3, after: 3 });
  const d = w.doc;
  steps.forEach((st, i) => {
    w.ensure(20);
    d.setFillColor(...C.accentSoft);
    d.circle(M.l + 2.6, w.y + 2.2, 2.6, 'F');
    w.font('bold', 7.5, C.accent);
    d.text(String(i + 1), M.l + 2.6, w.y + 3.2, { align: 'center' });
    w.font('bold', 9, C.ink);
    d.text(pdfText(st.title), M.l + 8, w.y + 3.2);
    w.y += 5;
    w.para(st.formula, { family: 'courier', size: 8.2, color: C.ink3, indent: 8, after: 0.4 });
    w.para(st.result, { family: 'courier', style: 'bold', size: 8.4, color: C.ink, indent: 8, after: st.note ? 0.4 : 3 });
    if (st.note) w.para(st.note, { size: 7.8, color: C.ink3, style: 'italic', indent: 8, after: 3 });
  });
}

function drawChart(w, s) {
  const d = w.doc;
  const h = 62;
  w.ensure(h + 10);
  w.sub(`Grafik arus kas dan nilai kini, sewa ${s.n} tahun`);
  const x0 = M.l + 16;
  const y0 = w.y + 6;
  const pw = CW - 18;
  const ph = h - 18;
  const maxV = Math.max(0, ...s.rows.map((r) => r.cf));
  if (!(maxV > 0)) return;
  const { top, values } = yScale(maxV, 4);
  const y = (v) => y0 + ph - (v / top) * ph;

  // legenda
  w.font('normal', 7.5, C.ink2);
  d.setFillColor(...C.s1);
  d.rect(PAGE.w - M.r - 72, w.y - 3.2, 3, 3, 'F');
  d.text('Arus kas', PAGE.w - M.r - 67.5, w.y - 0.8);
  d.setFillColor(...C.s2);
  d.rect(PAGE.w - M.r - 46, w.y - 3.2, 3, 3, 'F');
  d.text('Nilai kini (terdiskonto)', PAGE.w - M.r - 41.5, w.y - 0.8);

  values.forEach((v) => {
    d.setDrawColor(...C.line);
    d.setLineWidth(v === 0 ? 0.3 : 0.1);
    d.line(x0, y(v), x0 + pw, y(v));
    w.font('normal', 7, C.ink3);
    d.text(pdfText(compact(v)), x0 - 2, y(v) + 1, { align: 'right' });
  });

  const n = s.rows.length;
  const gw = pw / n;
  const bw = Math.min(14, gw * 0.3);
  s.rows.forEach((r, i) => {
    const cx = x0 + i * gw + gw / 2;
    d.setFillColor(...C.s1);
    d.rect(cx - bw - 0.4, y(r.cf), bw, y(0) - y(r.cf), 'F');
    d.setFillColor(...C.s2);
    d.rect(cx + 0.4, y(r.pv), bw, y(0) - y(r.pv), 'F');
    w.font('normal', 7, C.ink3);
    d.text(`Tahun ${r.t}`, cx, y(0) + 4, { align: 'center' });
    if (i === 0 || i === n - 1) {
      w.font('normal', 6.6, C.ink2);
      d.text(pdfText(compact(r.cf)), cx - 0.8, y(r.cf) - 1.2, { align: 'right' });
      d.text(pdfText(compact(r.pv)), cx + 0.8, y(r.pv) - 1.2);
    }
  });
  w.y = y0 + ph + 8;
  w.para('Rupiah. M = miliar, jt = juta.', { size: 7, color: C.ink3, after: 3 });
}

function drawProjections(w, data, res, meta) {
  const tenors = [...(meta.sections.proyeksi || [])].sort((a, b) => a - b);
  if (!tenors.length && !meta.sections.grafik) return;
  const mainTenor = !res.main.missing ? res.main : null;
  const withChart = meta.sections.grafik && mainTenor && res.value > 0;
  w.section('Proyeksi arus kas terdiskonto', withChart ? 80 : 50);
  if (withChart) drawChart(w, mainTenor);

  tenors.forEach((n) => {
    const s = res.rent.scen[n - 1];
    if (s.missing) {
      w.para(`Sewa ${n} tahun: risk free belum diisi.`, { color: C.ink3 });
      return;
    }
    w.ensure(18 + (s.rows.length + 3) * 6);
    w.sub(`Sewa ${n} tahun`);
    w.y -= 1;
    w.para(`Risk free ${fmtPct(s.rf)}  ·  Kapitalisasi ${fmtPct(s.cap)}  ·  Kenaikan sewa ${fmtPct(res.rent.g)}  ·  Diskonto ${fmtPct(s.disc)}`, { size: 7.8, color: C.ink3, after: 1 });
    const m2 = res.value > 0 ? perM2Month(s, res.area) : null;
    const foot = [
      [{ content: 'Total nilai kini arus kas', colSpan: 3 }, fmtInt(s.total)],
      [{ content: `Nilai wajar sewa ${n} tahun di muka (dibulatkan ribuan)`, colSpan: 3 }, fmtInt(s.rounded)]
    ];
    if (m2 != null) foot.push([{ content: 'Rata-rata per m² per bulan', colSpan: 3 }, fmtInt(m2)]);
    w.table({
      head: [['Tahun ke-', 'Arus kas (Rp)', 'Faktor diskonto', 'Nilai kini (Rp)']],
      body: s.rows.map((r) => [String(r.t), fmtInt(r.cf), fmtDec(r.df, 6, 6), fmtInt(r.pv)]),
      foot,
      columnStyles: { 0: { cellWidth: 24 }, 1: RIGHT, 2: RIGHT, 3: RIGHT },
      didParseCell: (hook) => {
        if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right';
        if (hook.section === 'foot') hook.cell.styles.halign = hook.column.index === 0 ? 'left' : 'right';
      }
    });
  });
  w.para('Sewa dibayar di muka, sehingga arus kas tahun ke-1 tidak didiskon. Faktor diskonto = 1 ÷ (1 + diskonto)^(tahun - 1).', { size: 7.6, color: C.ink3, after: 3 });
}

function drawLand(w, data, res) {
  const L = res.land;
  const comps = data.land.comps;
  w.section('Lampiran: perhitungan nilai tanah', 70);
  w.para('Pendekatan pembandingan data pasar dengan 3 data pembanding. Penyesuaian properti memakai ranking analysis: penyesuaian = (skor objek - skor pembanding) ÷ 5 × bobot kriteria.', { size: 8.2, after: 3 });

  const grp = (t) => [{ content: t, colSpan: 4, styles: { fillColor: C.soft, fontStyle: 'bold', textColor: C.ink2 } }];
  const bodyA = [
    ['Sumber data', ...comps.map((c) => c.nama || '-')],
    ['Luas tanah (m²)', ...comps.map((c) => (c.luas ? fmtDec(c.luas) : '-'))],
    ['Harga properti (Rp)', ...comps.map((c) => fmtInt(c.harga || 0))],
    ['Ekstraksi nilai bangunan (Rp)', ...comps.map((c) => fmtInt(c.bangunan || 0))],
    ['Harga tanah (Rp)', ...L.comps.map((c) => fmtInt(c.hargaTanah))],
    ['Harga tanah per m² (Rp)', ...L.comps.map((c) => fmtInt(c.perM2))],
    grp('Penyesuaian transaksi'),
    ...TRANSACTION_ADJ.map((lbl, j) => [lbl, ...comps.map((c) => `${fmtDec(c.adj[j] || 0, 0, 2)}%`)]),
    ['Indikasi nilai tanah 1 per m² (Rp)', ...L.comps.map((c) => fmtInt(c.ind1))]
  ];
  w.sub('A. Data pembanding dan penyesuaian transaksi');
  w.table({
    head: [['Uraian', 'Pembanding 1', 'Pembanding 2', 'Pembanding 3']],
    body: bodyA,
    styles: { fontSize: 7.8 },
    columnStyles: { 0: { cellWidth: 50 }, 1: RIGHT, 2: RIGHT, 3: RIGHT },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right';
      if (hook.section === 'body' && hook.row.index === 0 && hook.column.index > 0) hook.cell.styles.halign = 'left';
    }
  });

  const bodyB = CRIT_ORDER.map((k) => [
    CRIT[k].name,
    `${fmtDec(data.land.wCrit[k] || 0, 0, 2)}%`,
    scoreText(k, L.comps[0].scores[k].op),
    ...L.comps.map((c) => `${scoreText(k, c.scores[k].p)}\n${fmtAdj(c.critAdj[k])}`)
  ]);
  const bold = (t) => ({ content: t, styles: { fontStyle: 'bold' } });
  bodyB.push(
    [bold('Jumlah'), bold(`${fmtDec(L.wSum, 0, 2)}%`), '', ...L.comps.map((c) => bold(fmtAdj(c.sum2)))],
    [{ content: 'Indikasi nilai tanah 2 per m² (Rp)', colSpan: 3 }, ...L.comps.map((c) => fmtInt(c.ind2))],
    [{ content: 'Total penyesuaian absolut', colSpan: 3 }, ...L.comps.map((c) => `${fmtDec(c.absTot * 100, 2, 2)}%`)],
    [{ content: 'Bobot saran (kebalikan penyesuaian absolut)', colSpan: 3 }, ...L.sug.map((x) => `${fmtDec(x * 100, 1, 1)}%`)],
    [{ content: 'Bobot yang dipakai', colSpan: 3 }, ...data.land.wComp.map((x) => bold(`${fmtDec(x || 0, 0, 2)}%`))],
    [{ content: 'Nilai terbobot per m² (Rp)', colSpan: 3 }, ...L.weighted.map((x) => bold(fmtInt(x)))]
  );
  w.sub('B. Penyesuaian properti (ranking analysis) dan pembobotan');
  w.table({
    head: [['Kriteria', 'Bobot', 'Objek penilaian', 'Pembanding 1', 'Pembanding 2', 'Pembanding 3']],
    body: bodyB,
    styles: { fontSize: 7.6 },
    columnStyles: { 0: { cellWidth: 36 }, 1: { cellWidth: 15, halign: 'right' }, 2: { cellWidth: 28 }, 3: RIGHT, 4: RIGHT, 5: RIGHT },
    didParseCell: (hook) => {
      if (hook.section === 'head' && hook.column.index >= 3) hook.cell.styles.halign = 'right';
      if (hook.section === 'head' && hook.column.index === 1) hook.cell.styles.halign = 'right';
    }
  });

  w.sub('C. Kesimpulan nilai tanah');
  w.table({
    body: [
      ['Nilai wajar per m² (sebelum pembulatan)', fmtRp(L.perM2W)],
      ['Luas tanah objek penilaian', `${fmtDec(L.area)} m²`],
      ['Total nilai wajar tanah', fmtRp(L.total)],
      [bold('Nilai wajar tanah (dibulatkan ke ribuan)'), bold(fmtRp(L.rounded))],
      ['Nilai wajar per m² setelah pembulatan', fmtRp(L.m2Rounded)]
    ],
    columnStyles: { 0: { cellWidth: 90 }, 1: RIGHT }
  });
}

function drawFairness(w, data, res) {
  const rows = data.rent.filter((r) => (r.luas || 0) > 0 && (r.sewa || 0) > 0);
  if (!rows.length) return;
  w.section('Uji kewajaran dengan sewa pembanding', 36);
  const body = rows.map((r) => [r.nama || 'Pembanding', fmtDec(r.luas), fmtInt(r.sewa), fmtInt(r.sewa / r.luas), fmtInt(r.sewa / r.luas / 12)]);
  if (res.ready && res.area > 0) {
    const s = res.main;
    const hi = (t) => ({ content: t, styles: { fontStyle: 'bold', fillColor: C.accentSoft } });
    body.push([hi('Hasil penilaian, tahun ke-1'), hi(fmtDec(res.area)), hi(fmtInt(s.cf1)), hi(fmtInt(s.cf1 / res.area)), hi(fmtInt(s.cf1 / res.area / 12))]);
    body.push([hi('Hasil penilaian, rata-rata 5 tahun'), hi(fmtDec(res.area)), hi(fmtInt(s.rounded / 5)), hi(fmtInt(s.rounded / 5 / res.area)), hi(fmtInt(s.rounded / 5 / res.area / 12))]);
  }
  w.table({
    head: [['Objek', 'Luas (m²)', 'Sewa per tahun (Rp)', 'Rp/m²/tahun', 'Rp/m²/bulan']],
    body,
    columnStyles: { 1: RIGHT, 2: RIGHT, 3: RIGHT, 4: RIGHT },
    didParseCell: (hook) => { if (hook.section === 'head' && hook.column.index > 0) hook.cell.styles.halign = 'right'; }
  });
  w.y -= 2;
  w.para('Sewa pembanding dianggap nilai sewa per tahun.', { size: 7.5, color: C.ink3, after: 3 });
}

function drawSignature(w, meta) {
  const d = w.doc;
  w.ensure(36);
  w.y += 3;
  const x = PAGE.w - M.r - 74;
  w.font('normal', 9, C.ink);
  d.text(pdfText(`${meta.tempat || '....................'}, ${fmtDateLong(meta.tanggal) || '....................'}`), x, w.y);
  d.text('Penilai,', x, w.y + 5);
  w.font('bold', 9, C.ink);
  d.text(pdfText(meta.penilai || '(......................................)'), x, w.y + 24);
  w.font('normal', 9, C.ink);
  d.text(pdfText(`NIP ${meta.nip || '......................................'}`), x, w.y + 29);
  w.y += 33;
}

function drawFooters(doc, data) {
  const total = doc.getNumberOfPages();
  const now = new Date();
  const stamp = `${fmtDateLong(now)} pukul ${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.2);
    doc.line(M.l, PAGE.h - 13, PAGE.w - M.r, PAGE.h - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...C.ink3);
    doc.text(pdfText(`Kalkulator Nilai Wajar Sewa · ${data.nama || 'Objek penilaian'} · dibuat ${stamp}`), M.l, PAGE.h - 9);
    doc.text(`Halaman ${i} dari ${total}`, PAGE.w - M.r, PAGE.h - 9, { align: 'right' });
  }
}

/**
 * @param {object} data   store.data
 * @param {object} res    hasil computeValuation(data)
 * @param {object} meta   store.report (identitas dan pilihan bagian)
 * @returns {jsPDF}
 */
export function buildReport(data, res, meta) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  doc.setProperties({
    title: `KKAP Sewa DCF - ${data.nama || 'Objek penilaian'}`,
    subject: 'Nilai wajar atas sewa, metode discounted cashflow',
    author: meta.penilai || 'Penilai',
    creator: 'Kalkulator Nilai Wajar Sewa'
  });
  const w = new ReportWriter(doc);
  const sec = meta.sections;

  drawHeader(w, data, res, meta);
  drawSummary(w, data, res);
  if (sec.asumsi) drawAssumptions(w, data, res);
  if (sec.langkah) {
    const tenor = !res.main.missing ? 5 : [...TENORS].reverse().find((n) => !res.rent.scen[n - 1].missing);
    if (tenor) drawSteps(w, data, res, tenor);
  }
  drawProjections(w, data, res, meta);
  if (sec.tanah && data.mode === 'tanah') drawLand(w, data, res);
  if (sec.kewajaran) drawFairness(w, data, res);
  if (sec.ttd) w.ensure(46); // catatan dan tanda tangan tetap satu halaman
  w.para('Catatan: perhitungan mengikuti KKAP Sewa metode discounted cashflow dengan sewa dibayar sekaligus di muka. Nilai wajar sewa dibulatkan ke ribuan rupiah.', { size: 7.6, color: C.ink3, after: 2 });
  if (sec.ttd) drawSignature(w, meta);
  drawFooters(doc, data);
  return doc;
}

export function generateReport(data, res, meta) {
  const doc = buildReport(data, res, meta);
  return { blob: doc.output('blob'), filename: reportFilename(data, meta), pages: doc.getNumberOfPages() };
}
