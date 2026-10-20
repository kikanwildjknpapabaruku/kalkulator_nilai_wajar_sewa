/** Tabel ringkasan dalam format teks bertab, siap ditempel ke Excel. */
import { fmtPct } from './format.js';

export function scenarioTsv(data, res) {
  const lines = [];
  lines.push(`Nilai wajar sewa${data.nama ? ` - ${data.nama}` : ''} (dibayar sekaligus di muka)`);
  lines.push(`Nilai properti\t${Math.round(res.value)}`);
  lines.push(`Kenaikan sewa\t${fmtPct(res.rent.g)}\tRecapture\t${fmtPct(res.rent.rc)}`);
  lines.push(['Jangka waktu', 'Risk free', 'Kapitalisasi', 'Diskonto', 'Arus kas tahun 1', 'Nilai wajar sewa'].join('\t'));
  res.rent.scen.forEach((s) => {
    if (s.missing) lines.push(`${s.n} tahun\t-\t-\t-\t-\t-`);
    else lines.push([`${s.n} tahun`, fmtPct(s.rf), fmtPct(s.cap), fmtPct(s.disc), Math.round(s.cf1), s.rounded].join('\t'));
  });
  return lines.join('\n');
}
