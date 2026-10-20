/**
 * Memformat isi input angka saat diketik (titik ribuan, koma desimal)
 * sambil menjaga posisi kursor tetap di tempat yang benar.
 * @param {HTMLInputElement} el
 * @param {number} decimals jumlah desimal yang diizinkan (0 untuk rupiah)
 */
export function liveFormat(el, decimals) {
  const raw = el.value;
  const caret = el.selectionStart ?? raw.length;
  const keep = decimals ? /[\d,]/g : /\d/g;
  const keepOne = decimals ? /[\d,]/ : /\d/;
  const before = (raw.slice(0, caret).match(keep) || []).length;
  const digits = (raw.match(keep) || []).join('');
  const parts = digits.split(',');
  const intPart = parts.shift().replace(/^0+(?=\d)/, '');
  let out = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimals && parts.length) out += `,${parts.join('').slice(0, decimals)}`;
  el.value = out;
  let pos = 0;
  let count = 0;
  while (pos < out.length && count < before) {
    if (keepOne.test(out[pos])) count += 1;
    pos += 1;
  }
  try {
    el.setSelectionRange(pos, pos);
  } catch {
    /* beberapa jenis input tidak mendukung seleksi */
  }
  return out;
}
