import { describe, it, expect } from 'vitest';
import { buildReport, reportFilename, pdfText } from '../src/pdf/report.js';
import { computeValuation } from '../src/core/valuation.js';
import { createExampleState, createBlankState, createReportMeta } from '../src/state/defaults.js';

describe('laporan PDF', () => {
  it('membuat PDF lengkap dari data contoh', () => {
    const data = createExampleState();
    const meta = { ...createReportMeta(), penilai: 'Nama Penilai', nip: '199001012015031001', tanggal: '2026-07-13' };
    const doc = buildReport(data, computeValuation(data), meta);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
    expect(doc.output('arraybuffer').byteLength).toBeGreaterThan(10000);
  });

  it('memuat data bangunan untuk objek tanah dan bangunan', () => {
    const data = createExampleState();
    data.objek.jenis = 'tanah_bangunan';
    data.bangunan = { nilai: 2000000000, luas: 400, umurEkonomis: 40, umurEfektif: 15 };
    const doc = buildReport(data, computeValuation(data), createReportMeta());
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
  });

  it('tetap bisa dibuat saat data masih kosong', () => {
    const data = createBlankState();
    const doc = buildReport(data, computeValuation(data), createReportMeta());
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('nama file dan teks aman untuk font PDF', () => {
    const data = createExampleState();
    expect(reportFilename(data, { tanggal: '2026-07-13' })).toBe('KKAP-Sewa-DCF_UPBU-Kelas-II-Mozes-Kilangin-Timika_2026-07-13.pdf');
    expect(pdfText('a − b → c')).toBe('a - b menjadi c');
  });
});
