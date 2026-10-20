/** Langkah garis bantu "rapi" (1, 2, 2,5, 5, 10 × 10^n) untuk sumbu grafik */
export function niceStep(max, ticks = 4) {
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const f = raw / mag;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
}

/** Skala sumbu Y dari 0 sampai kelipatan langkah di atas nilai maksimum */
export function yScale(max, ticks = 4) {
  const step = niceStep(max, ticks);
  const top = Math.ceil(max / step - 1e-9) * step;
  const values = [];
  for (let v = 0; v <= top + step / 2; v += step) values.push(v);
  return { step, top, values };
}
