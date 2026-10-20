/**
 * Titik masuk perhitungan: menerima seluruh data input, mengembalikan semua hasil.
 * Dipakai oleh tampilan (Vue), generator PDF, dan unit test.
 */
import { calcLand } from './land.js';
import { calcRent, riskFreeFor } from './rent.js';
import { calcBuilding, hasBuilding } from './building.js';
import { fmtDec } from './format.js';
import { TENORS } from './constants.js';

const near100 = (x) => Math.abs(x - 100) < 0.0001;

export function buildWarnings(data, land, rent, value) {
  const w = [];
  if (!(value > 0)) w.push({ level: 'warn', text: 'Nilai properti belum diisi.' });
  TENORS.forEach((n) => {
    const s = rent.scen[n - 1];
    if (riskFreeFor(data, n) == null) w.push({ level: 'warn', text: `Risk free untuk sewa ${n} tahun belum diisi.` });
    else if (value > 0 && s.cap <= 0) {
      w.push({ level: 'crit', text: `Kapitalisasi sewa ${n} tahun nol atau negatif: risk free + recapture lebih kecil dari kenaikan sewa.` });
    }
  });
  if (hasBuilding(data)) {
    const b = calcBuilding(data);
    if (!(b.nilai > 0)) w.push({ level: 'warn', text: 'Nilai bangunan belum diisi.' });
    if (!(b.umurEkonomis > 0)) w.push({ level: 'warn', text: 'Umur ekonomis bangunan belum diisi, recapture dihitung 0%.' });
    else if (b.sisa <= 0) w.push({ level: 'crit', text: 'Umur efektif sama atau melebihi umur ekonomis: sisa umur ekonomis habis, recapture tidak dapat dihitung.' });
    else if (b.sisa < 5) w.push({ level: 'warn', text: `Sisa umur ekonomis bangunan (${fmtDec(b.sisa)} tahun) lebih pendek dari sewa 5 tahun.` });
  }
  if (data.mode === 'tanah') {
    if (!(land.area > 0)) w.push({ level: 'warn', text: 'Luas tanah objek belum diisi.' });
    if (!near100(land.wSum)) w.push({ level: 'warn', text: `Jumlah bobot kriteria tanah ${fmtDec(land.wSum)}%, seharusnya 100%.` });
    if (!near100(land.wSumComp)) w.push({ level: 'warn', text: `Jumlah bobot pembanding tanah ${fmtDec(land.wSumComp)}%, seharusnya 100%.` });
  }
  return w;
}

export function computeValuation(data) {
  const land = calcLand(data);
  const building = hasBuilding(data) ? calcBuilding(data) : null;
  const buildingValue = building ? building.nilai : 0;
  const landValue = data.mode === 'tanah' ? land.rounded : data.nilaiLangsung || 0;
  const value = landValue + buildingValue;
  const rent = calcRent(data, value);
  const rentFromLand = calcRent(data, land.rounded + buildingValue);
  const area = data.luas || 0;
  return {
    land,
    building,
    landValue,
    value,
    area,
    rent,
    main: rent.scen[4],
    ready: value > 0 && !rent.scen[4].missing,
    landRent5: rentFromLand.scen[4],
    warnings: buildWarnings(data, land, rent, value)
  };
}

/** Rupiah per m2 per bulan rata-rata selama n tahun */
export function perM2Month(scenario, area) {
  if (!(area > 0) || scenario.missing) return null;
  return scenario.rounded / scenario.n / area / 12;
}
