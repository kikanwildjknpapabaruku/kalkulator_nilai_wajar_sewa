/**
 * Mengubah bilangan bulat menjadi kalimat bahasa Indonesia.
 * terbilang(13602653000) -> "tiga belas miliar enam ratus dua juta enam ratus lima puluh tiga ribu"
 */
const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function words(n) {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${words(n - 10)} belas`;
  if (n < 100) return `${words(Math.floor(n / 10))} puluh${n % 10 ? ` ${words(n % 10)}` : ''}`;
  if (n < 200) return `seratus${n % 100 ? ` ${words(n % 100)}` : ''}`;
  if (n < 1000) return `${words(Math.floor(n / 100))} ratus${n % 100 ? ` ${words(n % 100)}` : ''}`;
  if (n < 2000) return `seribu${n % 1000 ? ` ${words(n % 1000)}` : ''}`;
  if (n < 1e6) return `${words(Math.floor(n / 1e3))} ribu${n % 1e3 ? ` ${words(n % 1e3)}` : ''}`;
  if (n < 1e9) return `${words(Math.floor(n / 1e6))} juta${n % 1e6 ? ` ${words(n % 1e6)}` : ''}`;
  if (n < 1e12) return `${words(Math.floor(n / 1e9))} miliar${n % 1e9 ? ` ${words(n % 1e9)}` : ''}`;
  if (n < 1e15) return `${words(Math.floor(n / 1e12))} triliun${n % 1e12 ? ` ${words(n % 1e12)}` : ''}`;
  return String(n);
}

export function terbilang(value) {
  const n = Math.floor(Math.abs(Number(value)));
  if (!Number.isFinite(n)) return '';
  if (n === 0) return 'nol';
  return words(n);
}

/** "Tiga belas miliar ... rupiah" */
export function terbilangRupiah(value) {
  const t = terbilang(value);
  return t ? `${t.charAt(0).toUpperCase()}${t.slice(1)} rupiah` : '';
}
