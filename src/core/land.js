/**
 * Penilaian tanah dengan pendekatan pembandingan data pasar
 * (sheet "KKAP Tanah" dan "Penyesuaian Tanah").
 *
 *  1. Harga tanah pembanding = harga properti - ekstraksi nilai bangunan
 *  2. Penyesuaian transaksi diterapkan berurutan: x = x * (1 + a_i)
 *  3. Penyesuaian properti (ranking analysis):
 *       a_k = (skor objek - skor pembanding) / 5 * bobot kriteria
 *     dijumlahkan, lalu indikasi 2 = indikasi 1 * (1 + jumlah a_k)
 *  4. Nilai per m2 = jumlah (bobot pembanding * indikasi 2)
 *  5. Nilai tanah = nilai per m2 * luas, dibulatkan ke ribuan
 */
import { CRIT_ORDER, luasScore } from './constants.js';
import { roundThousand } from './format.js';

const EPS = 1e-12;

function comparable(c, i, land, area) {
  const luas = c.luas || 0;
  const hargaTanah = (c.harga || 0) - (c.bangunan || 0);
  const perM2 = luas > 0 ? hargaTanah / luas : 0;

  const afterTransaction = [];
  let v = perM2;
  c.adj.forEach((a) => {
    v *= 1 + (a || 0) / 100;
    afterTransaction.push(v);
  });
  const ind1 = v;

  const critAdj = {};
  const scores = {};
  let sum2 = 0;
  CRIT_ORDER.forEach((k) => {
    let op;
    let p;
    if (k === 'luas') {
      op = area > 0 ? luasScore(area) : null;
      p = luas > 0 ? luasScore(luas) : null;
    } else {
      op = land.scores[k].op;
      p = land.scores[k].c[i];
    }
    scores[k] = { op, p };
    const a = op == null || p == null ? 0 : ((op - p) / 5) * ((land.wCrit[k] || 0) / 100);
    critAdj[k] = a;
    sum2 += a;
  });

  const ind2 = ind1 * (1 + sum2);
  const absTot =
    c.adj.reduce((t, x) => t + Math.abs((x || 0) / 100), 0) +
    CRIT_ORDER.reduce((t, k) => t + Math.abs(critAdj[k]), 0);

  return { luas, hargaTanah, perM2, afterTransaction, ind1, critAdj, scores, sum2, ind2, absTot };
}

/** Bobot saran: kebalikan total penyesuaian absolut, dinormalkan menjadi 1 */
export function suggestedWeights(comps) {
  const zero = comps.filter((c) => c.absTot <= EPS).length;
  if (zero > 0) return comps.map((c) => (c.absTot <= EPS ? 1 / zero : 0));
  const inv = comps.map((c) => 1 / c.absTot);
  const total = inv.reduce((a, b) => a + b, 0);
  return inv.map((x) => x / total);
}

/** Bobot saran dalam persen 2 desimal yang totalnya tepat 100 */
export function suggestedWeightsPercent(sug) {
  const w = sug.map((x) => Math.round(x * 10000) / 100);
  const diff = Math.round((100 - w.reduce((a, b) => a + b, 0)) * 100) / 100;
  const iMax = w.indexOf(Math.max(...w));
  w[iMax] = Math.round((w[iMax] + diff) * 100) / 100;
  return w;
}

export function calcLand(data) {
  const land = data.land;
  const area = data.luas || 0;
  const comps = land.comps.map((c, i) => comparable(c, i, land, area));
  const sug = suggestedWeights(comps);
  const wSum = CRIT_ORDER.reduce((t, k) => t + (land.wCrit[k] || 0), 0);
  const wSumComp = land.wComp.reduce((t, w) => t + (w || 0), 0);
  const weighted = comps.map((c, i) => ((land.wComp[i] || 0) / 100) * c.ind2);
  const perM2W = weighted.reduce((a, b) => a + b, 0);
  const total = perM2W * area;
  const rounded = roundThousand(total);
  const m2Rounded = area > 0 ? roundThousand(rounded / area) : 0;
  return { comps, sug, wSum, wSumComp, weighted, perM2W, total, rounded, m2Rounded, area };
}
