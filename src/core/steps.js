/**
 * Uraian langkah perhitungan dengan angka yang sudah dimasukkan ke rumus.
 * Dipakai di tab "Langkah hitung" dan di laporan PDF.
 */
import { fmtPct, fmtRp, fmtDec } from './format.js';
import { growthAverage, growthCount } from './rent.js';

export function buildSteps(data, res, tenor) {
  const s = res.rent.scen[tenor - 1];
  if (!s || s.missing) return [];
  const { g, rc } = res.rent;
  const source = data.mode === 'tanah' ? 'hasil modul nilai tanah' : 'input langsung';
  const b = res.building;
  const propertyStep = b
    ? {
        title: 'Nilai properti objek penilaian',
        formula: `= nilai tanah (${source}) + nilai bangunan`,
        result: `${fmtRp(res.landValue)} + ${fmtRp(b.nilai)} = ${fmtRp(res.value)}`,
        value: fmtRp(res.value)
      }
    : { title: 'Nilai properti objek penilaian', formula: `Nilai tanah, ${source}`, result: fmtRp(res.value), value: fmtRp(res.value) };
  const recaptureNote = b
    ? b.sisa > 0
      ? ` Recapture = 1 ÷ sisa umur ekonomis (${fmtDec(b.umurEkonomis)} − ${fmtDec(b.umurEfektif)} = ${fmtDec(b.sisa)} tahun) = ${fmtPct(rc)}.`
      : ' Recapture 0% karena sisa umur ekonomis belum tersedia.'
    : ' Recapture 0% karena objek berupa tanah.';
  const growthNote =
    data.growth.mode === 'hist'
      ? `rata-rata ${growthCount(data)} data historis (${fmtDec(growthAverage(data), 2, 4)}%) dibulatkan 2 desimal`
      : 'input manual';

  return [
    propertyStep,
    {
      title: 'Tingkat kapitalisasi',
      formula: '= risk free + recapture − kenaikan sewa',
      result: `${fmtPct(s.rf)} + ${fmtPct(rc)} − ${fmtPct(g)} = ${fmtPct(s.cap)}`,
      value: fmtPct(s.cap),
      note: `Risk free sesuai jangka waktu sewa ${s.n} tahun. Kenaikan sewa: ${growthNote}.${recaptureNote}`
    },
    {
      title: 'Arus kas tahun pertama',
      formula: '= nilai properti × tingkat kapitalisasi',
      result: `${fmtRp(res.value)} × ${fmtPct(s.cap)} = ${fmtRp(s.cf1)}`,
      value: fmtRp(s.cf1)
    },
    {
      title: 'Tingkat diskonto',
      formula: '= tingkat kapitalisasi + kenaikan sewa',
      result: `${fmtPct(s.cap)} + ${fmtPct(g)} = ${fmtPct(s.disc)}`,
      value: fmtPct(s.disc),
      note: 'Hasilnya sama dengan risk free + recapture.'
    },
    {
      title: 'Proyeksi arus kas',
      formula: 'arus kas tahun t = arus kas tahun (t−1) × (1 + kenaikan sewa)',
      result: `Faktor kenaikan per tahun: 1 + ${fmtPct(g)} = ${fmtDec(1 + g, 4, 6)}`,
      value: `× ${fmtDec(1 + g, 4, 6)} per tahun`,
      note: `Tahun 1 sampai ${s.n} mengikuti jangka waktu sewa.`
    },
    {
      title: 'Nilai kini setiap tahun',
      formula: 'nilai kini = arus kas × 1 ÷ (1 + diskonto)^(t − 1)',
      result: `Faktor diskonto: ${s.rows.map((r) => fmtDec(r.df, 4, 4)).join(' ; ')}`,
      value: s.rows.length > 1 ? `${fmtDec(s.rows[0].df, 4, 4)} s.d. ${fmtDec(s.rows[s.rows.length - 1].df, 4, 4)}` : fmtDec(s.rows[0].df, 4, 4),
      note: 'Sewa dibayar di muka, sehingga arus kas tahun ke-1 diterima di awal periode dan tidak didiskon.'
    },
    {
      title: 'Nilai wajar atas sewa',
      formula: '= jumlah nilai kini, dibulatkan ke ribuan',
      result: `${fmtRp(s.total)} → ${fmtRp(s.rounded)}`,
      value: fmtRp(s.rounded)
    }
  ];
}
