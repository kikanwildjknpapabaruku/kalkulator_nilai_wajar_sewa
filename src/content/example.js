/**
 * Angka contoh untuk bahan penjelasan (tab Petunjuk dan tanda tanya di form).
 * Dihitung dari data contoh KKAP Mozes Kilangin memakai logika yang sama dengan aplikasi,
 * jadi angka di penjelasan tidak bisa menyimpang dari hasil hitung sebenarnya.
 */
import { createExampleState } from '@/state/defaults.js';
import { computeValuation } from '@/core/valuation.js';
import { growthAverage, growthUsed } from '@/core/rent.js';
import { fmtRp, fmtPct, fmtDec } from '@/core/format.js';

const data = createExampleState();
const res = computeValuation(data);
const s1 = res.rent.scen[0];
const s5 = res.rent.scen[4];

// Variasi dengan bangunan, untuk menjelaskan recapture
const withBuilding = createExampleState();
withBuilding.objek.jenis = 'tanah_bangunan';
withBuilding.bangunan = { nilai: 2000000000, luas: 400, umurEkonomis: 40, umurEfektif: 15 };
const resB = computeValuation(withBuilding);
const s5b = resB.rent.scen[4];

const crit = data.land.scores.lokasi;
const rankAdj = ((crit.op - crit.c[1]) / 5) * data.land.wCrit.lokasi;

export const EX = {
  nama: data.nama,
  area: fmtDec(res.area),
  nilai: fmtRp(res.value),
  rf: fmtPct(s5.rf, 2, 4),
  rc: fmtPct(res.rent.rc, 2, 4),
  g: fmtPct(res.rent.g, 2, 4),
  gAvg: `${fmtDec(growthAverage(data), 2, 4)}%`,
  gUsed: `${fmtDec(growthUsed(data), 2, 2)}%`,
  gCount: data.growth.hist.length,
  cap: fmtPct(s5.cap, 2, 4),
  disc: fmtPct(s5.disc, 2, 4),
  cf1: fmtRp(s5.cf1),
  cf2: fmtRp(s5.rows[1].cf),
  pv2: fmtRp(s5.rows[1].pv),
  df2: fmtDec(s5.rows[1].df, 4, 4),
  total5: fmtRp(s5.total),
  rounded5: fmtRp(s5.rounded),
  rounded1: fmtRp(s1.rounded),
  perM2y1: fmtRp(s5.cf1 / res.area / 12),
  perYear5: fmtRp(s5.rounded / 5),
  rows: s5.rows.map((r) => ({
    t: r.t,
    cf: fmtRp(r.cf),
    df: fmtDec(r.df, 4, 4),
    pv: fmtRp(r.pv)
  })),
  // contoh dengan bangunan Rp 2 miliar, umur ekonomis 40 tahun, umur efektif 15 tahun
  b: {
    nilai: fmtRp(withBuilding.bangunan.nilai),
    ue: withBuilding.bangunan.umurEkonomis,
    uf: withBuilding.bangunan.umurEfektif,
    sisa: withBuilding.bangunan.umurEkonomis - withBuilding.bangunan.umurEfektif,
    rc: fmtPct(resB.rent.rc, 2, 4),
    cap: fmtPct(s5b.cap, 2, 4),
    total: fmtRp(resB.value),
    rounded5: fmtRp(s5b.rounded)
  },
  // contoh ranking analysis: kriteria lokasi, pembanding 2
  rank: {
    op: crit.op,
    c: crit.c[1],
    w: data.land.wCrit.lokasi,
    adj: `${rankAdj > 0 ? '+' : ''}${fmtDec(rankAdj, 2, 2)}%`
  },
  wComp: data.land.wComp.join(' / ')
};
