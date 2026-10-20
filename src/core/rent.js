/**
 * Nilai wajar atas sewa, metode discounted cashflow, sewa dibayar sekaligus di muka
 * (sheet "KKAP Sewa").
 *
 *   Kapitalisasi       = risk free + recapture - kenaikan sewa
 *   Arus kas tahun 1   = nilai properti * kapitalisasi
 *   Diskonto           = kapitalisasi + kenaikan sewa
 *   Arus kas tahun t   = arus kas tahun (t-1) * (1 + kenaikan sewa)
 *   Faktor diskonto t  = 1 / (1 + diskonto)^(t-1)    (dibayar di muka)
 *   Nilai wajar sewa   = jumlah nilai kini, dibulatkan ke ribuan
 */
import { TENORS } from './constants.js';
import { roundThousand } from './format.js';
import { calcBuilding, hasBuilding } from './building.js';

/** Rata-rata data historis kenaikan sewa (persen), tanpa pembulatan */
export function growthAverage(data) {
  const rows = data.growth.hist.filter((h) => h.v != null);
  if (!rows.length) return 0;
  return rows.reduce((t, h) => t + h.v, 0) / rows.length;
}

/** Kenaikan sewa yang dipakai (persen). Rata-rata historis dibulatkan 2 desimal seperti Excel. */
export function growthUsed(data) {
  if (data.growth.mode === 'manual') return data.growth.manual || 0;
  return Math.round(growthAverage(data) * 100) / 100;
}

export function growthCount(data) {
  return data.growth.hist.filter((h) => h.v != null).length;
}

/** Recapture rate (pecahan): 0 untuk tanah, 1 / sisa umur ekonomis bangunan untuk tanah dan bangunan */
export function recaptureRate(data) {
  return hasBuilding(data) ? calcBuilding(data).recapture : 0;
}

/** Risk free (persen) untuk jangka waktu n tahun, atau null bila belum diisi */
export function riskFreeFor(data, n) {
  const v = data.rf.same ? data.rf.v[4] : data.rf.v[n - 1];
  return v == null ? null : v;
}

export function projectScenario({ n, rf, rc, g, value }) {
  const cap = rf + rc - g;
  const disc = cap + g;
  const cf1 = value * cap;
  const rows = [];
  let total = 0;
  for (let t = 1; t <= n; t += 1) {
    const cf = cf1 * (1 + g) ** (t - 1);
    const df = 1 / (1 + disc) ** (t - 1);
    const pv = cf * df;
    total += pv;
    rows.push({ t, cf, df, pv });
  }
  return { n, missing: false, rf, cap, disc, cf1, rows, total, rounded: roundThousand(total) };
}

export function calcRent(data, value) {
  const g = growthUsed(data) / 100;
  const rc = recaptureRate(data);
  const scen = TENORS.map((n) => {
    const rfPct = riskFreeFor(data, n);
    if (rfPct == null) return { n, missing: true, rf: null, cap: 0, disc: 0, cf1: 0, rows: [], total: 0, rounded: 0 };
    return projectScenario({ n, rf: rfPct / 100, rc, g, value });
  });
  return { g, rc, scen };
}
