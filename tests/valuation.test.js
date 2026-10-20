/**
 * Uji perhitungan terhadap angka pada file Excel
 * "KKAP Sewa UPBU Mozes Kilangin Timika DCF".
 * Jalankan: npm test
 */
import { describe, it, expect } from 'vitest';
import { computeValuation, perM2Month } from '../src/core/valuation.js';
import { calcLand, suggestedWeightsPercent } from '../src/core/land.js';
import { growthUsed } from '../src/core/rent.js';
import { terbilang, terbilangRupiah } from '../src/core/terbilang.js';
import { parseId, parsePct, fmtInt, fmtPct } from '../src/core/format.js';
import { buildSteps } from '../src/core/steps.js';
import { createExampleState, createBlankState, normalizeState } from '../src/state/defaults.js';

describe('contoh KKAP Mozes Kilangin = Excel', () => {
  const data = createExampleState();
  const res = computeValuation(data);

  it('nilai tanah (KKAP Tanah J50, J52, J53)', () => {
    expect(res.land.perM2W).toBeCloseTo(3244594.238443171, 6);
    expect(res.land.rounded).toBe(49639047000);
    expect(res.land.m2Rounded).toBe(3245000);
  });

  it('penyesuaian dan indikasi per pembanding (KKAP Tanah baris 33, 45, 46)', () => {
    const [p1, p2, p3] = res.land.comps;
    expect(p1.ind1).toBeCloseTo(3325122.5225225226, 6);
    expect(p2.ind1).toBeCloseTo(2328000, 6);
    expect(p3.ind1).toBeCloseTo(2885153.7733333334, 6);
    expect(p1.sum2).toBeCloseTo(-0.008, 10);
    expect(p2.sum2).toBeCloseTo(0.296, 10);
    expect(p3.sum2).toBeCloseTo(0.146, 10);
    expect(p2.ind2).toBeCloseTo(3017088, 4);
  });

  it('bobot saran = kebalikan penyesuaian absolut (KKAP Tanah baris 59)', () => {
    expect(res.land.sug[0]).toBeCloseTo(0.938421915242332, 10);
    expect(res.land.sug[1]).toBeCloseTo(0.022477171622570822, 10);
    const pct = suggestedWeightsPercent(res.land.sug);
    expect(pct.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 10);
  });

  it('kenaikan sewa rata-rata dibulatkan (Kenaikan sewa G23, G24)', () => {
    expect(growthUsed(data)).toBe(1.07);
  });

  it('kapitalisasi, arus kas tahun 1, diskonto (KKAP Sewa T11, D11, D23)', () => {
    expect(res.main.cap).toBeCloseTo(0.06146, 12);
    expect(res.main.cf1).toBeCloseTo(3050815828.62, 2);
    expect(res.main.disc).toBeCloseTo(0.07216, 12);
  });

  it('proyeksi dan nilai kini per tahun (KKAP Sewa baris 30, 32, 33)', () => {
    const rows = res.main.rows;
    expect(rows[1].cf).toBeCloseTo(3083459557.9862337, 3);
    expect(rows[4].cf).toBeCloseTo(3183501463.02252, 3);
    expect(rows[1].df).toBeCloseTo(0.9326966124459036, 12);
    expect(rows[4].pv).toBeCloseTo(2409165589.3546786, 3);
  });

  it('nilai wajar sewa 5 tahun (KKAP Sewa N34, N35)', () => {
    expect(res.main.total).toBeCloseTo(13602652744.100943, 3);
    expect(res.main.rounded).toBe(13602653000);
  });

  it('nilai per m2 per bulan (KKAP Sewa N37, N38)', () => {
    expect(res.main.cf1 / data.luas / 12).toBeCloseTo(16617.730072880582, 6);
    expect(perM2Month(res.main, data.luas)).toBeCloseTo(14818.673333769091, 6);
  });

  it('jangka waktu 1 sampai 4 tahun dengan risk free sama', () => {
    expect(res.rent.scen.map((s) => s.rounded)).toEqual([3050816000, 5926748000, 8637822000, 11193487000, 13602653000]);
  });

  it('langkah hitung lengkap 7 langkah', () => {
    const steps = buildSteps(data, res, 5);
    expect(steps).toHaveLength(7);
    expect(steps[6].result).toContain('13.602.653.000');
  });
});

describe('aturan perhitungan lain', () => {
  it('risk free per jangka waktu menghitung ulang kapitalisasi', () => {
    const d = createExampleState();
    d.rf.same = false;
    d.rf.v = [6.5, 6.8, 7, 7.1, 7.216];
    const r = computeValuation(d);
    expect(r.rent.scen[0].cap).toBeCloseTo(0.065 - 0.0107, 12);
    expect(r.rent.scen[0].rounded).toBe(Math.round((49639047000 * (0.065 - 0.0107)) / 1000) * 1000);
    expect(r.rent.scen[4].rounded).toBe(13602653000);
  });

  it('tanah dan bangunan: nilai properti = tanah + bangunan, recapture penuh dari sisa umur', () => {
    const d = createExampleState();
    d.objek.jenis = 'tanah_bangunan';
    d.bangunan = { nilai: 2000000000, luas: 400, umurEkonomis: 40, umurEfektif: 15 };
    const r = computeValuation(d);
    expect(r.building.sisa).toBe(25);
    expect(r.rent.rc).toBeCloseTo(1 / 25, 12);
    expect(r.value).toBe(49639047000 + 2000000000);
    expect(r.main.cap).toBeCloseTo(0.07216 + 0.04 - 0.0107, 12);
    expect(r.main.cf1).toBeCloseTo(51639047000 * (0.07216 + 0.04 - 0.0107), 2);
    expect(r.main.disc).toBeCloseTo(0.07216 + 0.04, 12);
    const steps = buildSteps(d, r, 5);
    expect(steps[0].result).toContain('49.639.047.000 + Rp');
  });

  it('bangunan dengan umur efektif melebihi umur ekonomis memberi peringatan', () => {
    const d = createExampleState();
    d.objek.jenis = 'tanah_bangunan';
    d.bangunan = { nilai: 1000000000, luas: 100, umurEkonomis: 20, umurEfektif: 25 };
    const r = computeValuation(d);
    expect(r.rent.rc).toBe(0);
    expect(r.warnings.some((w) => w.level === 'crit')).toBe(true);
  });

  it('memilih Tanah saja mengabaikan data bangunan', () => {
    const d = createExampleState();
    d.bangunan = { nilai: 1000000000, luas: 100, umurEkonomis: 40, umurEfektif: 10 };
    const r = computeValuation(d);
    expect(r.building).toBeNull();
    expect(r.main.rounded).toBe(13602653000);
  });

  it('data kosong tidak menghasilkan angka dan memberi peringatan', () => {
    const r = computeValuation(createBlankState());
    expect(r.ready).toBe(false);
    expect(r.main.missing).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('bobot sesuai tabel Hasil Kajian Tanah memberi nilai berbeda', () => {
    const d = createExampleState();
    d.land.wCrit = { lokasi: 30, luas: 8, bentuk: 3, jenis: 4, kontur: 6, elevasi: 2, peruntukan: 0, akses: 27, fasilitas: 20 };
    expect(calcLand(d).rounded).toBe(48511337000);
  });

  it('data versi lama dilengkapi kunci baru', () => {
    const old = { ...createExampleState(), v: 1 };
    delete old.rent;
    old.objek = { jenis: 'tanah_bangunan', umur: 20 };
    delete old.bangunan;
    const s = normalizeState(old);
    expect(s.v).toBe(2);
    expect(s.bangunan.umurEkonomis).toBe(20);
    expect(s.bangunan.umurEfektif).toBe(0);
    expect('umur' in s.objek).toBe(false);
    expect(Array.isArray(s.rent)).toBe(true);
    expect(s.luas).toBe(15299);
  });
});

describe('format dan terbilang', () => {
  it('terbilang', () => {
    expect(terbilang(13602653000)).toBe('tiga belas miliar enam ratus dua juta enam ratus lima puluh tiga ribu');
    expect(terbilang(1001000)).toBe('satu juta seribu');
    expect(terbilang(115)).toBe('seratus lima belas');
    expect(terbilangRupiah(2000)).toBe('Dua ribu rupiah');
  });

  it('parsing dan format gaya Indonesia', () => {
    expect(parseId('49.639.047.000')).toBe(49639047000);
    expect(parseId('15.299,5')).toBe(15299.5);
    expect(parseId('')).toBeNull();
    expect(parsePct('7,216')).toBe(7.216);
    expect(parsePct('7.216')).toBe(7.216);
    expect(parsePct('-3')).toBe(-3);
    expect(fmtInt(13602653000)).toBe('13.602.653.000');
    expect(fmtPct(0.06146)).toBe('6,146%');
  });
});
