/**
 * Format dan parsing angka gaya Indonesia (titik pemisah ribuan, koma desimal).
 * Modul murni: tidak bergantung pada DOM atau Vue, sehingga bisa dipakai ulang
 * di server (Node.js), di unit test, dan di generator PDF.
 */

const cache = new Map();

function nf(min, max) {
  const key = `${min}_${max}`;
  if (!cache.has(key)) {
    cache.set(key, new Intl.NumberFormat('id-ID', { minimumFractionDigits: min, maximumFractionDigits: max }));
  }
  return cache.get(key);
}

/** Angka desimal, contoh fmtDec(7.216, 0, 4) -> "7,216" */
export function fmtDec(n, min = 0, max = 2) {
  if (!Number.isFinite(n)) return '0';
  return nf(min, max).format(n);
}

/** Bilangan bulat dengan pemisah ribuan, contoh 13602653000 -> "13.602.653.000" */
export function fmtInt(n) {
  const r = Math.round(n);
  if (!Number.isFinite(r)) return '0';
  return nf(0, 0).format(r === 0 ? 0 : r);
}

/** Rupiah, contoh "Rp 13.602.653.000" (spasi tak terputus setelah Rp) */
export function fmtRp(n) {
  return `Rp ${fmtInt(n)}`;
}

/** Persen dari pecahan, contoh fmtPct(0.07216) -> "7,216%" */
export function fmtPct(fraction, min = 2, max = 4) {
  return `${fmtDec(fraction * 100, min, max)}%`;
}

/** Penyesuaian bertanda, contoh +12,00% atau -0,80% */
export function fmtAdj(fraction) {
  const p = fraction * 100;
  if (Math.abs(p) < 0.00001) return '0,00%';
  return `${p > 0 ? '+' : ''}${fmtDec(p, 2, 2)}%`;
}

/** Ringkas untuk sumbu grafik: 3,05 M (miliar), 12,5 jt (juta), 1,2 T (triliun) */
export function compact(n) {
  const a = Math.abs(n);
  if (a >= 1e12) return `${fmtDec(n / 1e12, 0, 2)} T`;
  if (a >= 1e9) return `${fmtDec(n / 1e9, 0, 2)} M`;
  if (a >= 1e6) return `${fmtDec(n / 1e6, 0, 1)} jt`;
  return fmtInt(n);
}

/** Parsing gaya Indonesia: "49.639.047.000" -> 49639047000, "15.299,5" -> 15299.5. Kosong -> null */
export function parseId(text) {
  let s = String(text ?? '').trim();
  if (!s) return null;
  s = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Parsing persen yang longgar: "7,216" dan "7.216" sama-sama 7.216. Kosong -> null */
export function parsePct(text) {
  let s = String(text ?? '').trim().replace(/[^\d,.-]/g, '');
  if (!s || s === '-') return null;
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '');
  s = s.replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Pembulatan ke ribuan seperti ROUND(x, -3) di Excel */
export function roundThousand(n) {
  return Math.round(n / 1000) * 1000;
}

/** Tanggal panjang Indonesia dari string "YYYY-MM-DD" atau Date */
export function fmtDateLong(value) {
  let d = value;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, day] = value.split('-').map(Number);
    d = new Date(y, m - 1, day);
  }
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
