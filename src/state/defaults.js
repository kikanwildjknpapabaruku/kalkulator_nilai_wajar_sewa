/**
 * Bentuk data input aplikasi. Semua angka persen disimpan dalam satuan persen (7.216 = 7,216%),
 * nilai kosong disimpan sebagai null.
 */
import { CRIT_ORDER, DEFAULT_CRIT_WEIGHTS } from '@/core/constants.js';

export const STATE_VERSION = 2;

export function createBlankState() {
  const scores = {};
  CRIT_ORDER.filter((k) => k !== 'luas').forEach((k) => {
    scores[k] = { op: 3, c: [3, 3, 3] };
  });
  return {
    v: STATE_VERSION,
    example: false,
    nama: '',
    luas: null,
    mode: 'langsung',
    nilaiLangsung: null,
    growth: { mode: 'hist', manual: null, hist: [{ label: '', v: null }, { label: '', v: null }, { label: '', v: null }], sumber: '' },
    rf: { same: true, v: [null, null, null, null, null], sumber: '' },
    objek: { jenis: 'tanah' },
    bangunan: { nilai: null, luas: null, umurEkonomis: null, umurEfektif: null },
    rent: [],
    land: {
      comps: [0, 1, 2].map(() => ({ nama: '', luas: null, harga: null, bangunan: null, adj: [0, 0, 0, 0, 0] })),
      wCrit: { ...DEFAULT_CRIT_WEIGHTS },
      scores,
      wComp: [50, 20, 30]
    }
  };
}

/** Data contoh: KKAP Sewa UPBU Mozes Kilangin Timika (angka sama dengan file Excel) */
export function createExampleState() {
  const s = createBlankState();
  s.example = true;
  s.nama = 'UPBU Kelas II Mozes Kilangin Timika';
  s.luas = 15299;
  s.mode = 'tanah';
  s.nilaiLangsung = 49639047000;
  s.growth = {
    mode: 'hist',
    manual: 1.07,
    hist: [['2021', -0.07], ['2022', 0.05], ['2023', 1.12], ['2024', 1.1], ['2025', 3.78], ['2026', 0.43]].map(([y, v]) => ({ label: `Tahun ${y}`, v })),
    sumber: 'Bank Indonesia, Indeks Harga Properti Komersial Triwulan I 2026 (kenaikan sewa retail)'
  };
  s.rf = { same: true, v: [7.216, 7.216, 7.216, 7.216, 7.216], sumber: 'Investing.com, imbal hasil obligasi Indonesia 5 tahun (Juli 2026)' };
  s.rent = [
    { nama: 'Bandara DEO Sorong', luas: 14200, sewa: 3598075000 },
    { nama: 'Bandara Rendani Manokwari', luas: 5000, sewa: 911511000 }
  ];
  const L = s.land;
  L.comps = [
    { nama: 'Pembanding 1, Kab. Mimika (transaksi)', luas: 555, harga: 2300000000, bangunan: 454557000, adj: [0, 0, 0, 0, 0] },
    { nama: 'Pembanding 2, Kab. Mimika (penawaran)', luas: 2500, harga: 6000000000, bangunan: 0, adj: [0, 0, -3, 0, 0] },
    { nama: 'Pembanding 3, Kab. Mimika (penawaran)', luas: 750, harga: 3000000000, bangunan: 769211000, adj: [0, 0, -3, 0, 0] }
  ];
  // Bobot yang dipakai file Excel (lihat catatan di tab Nilai tanah)
  L.wCrit = { lokasi: 30, luas: 2, bentuk: 3, jenis: 8, kontur: 6, elevasi: 4, peruntukan: 0, akses: 27, fasilitas: 20 };
  const P = {
    lokasi: [4, [4, 2, 3]], bentuk: [5, [5, 5, 5]], jenis: [4, [4, 2, 4]], kontur: [4, [4, 4, 4]],
    elevasi: [4, [4, 4, 4]], peruntukan: [4, [4, 4, 4]], akses: [4, [4, 2, 3]], fasilitas: [3, [3, 2, 2]]
  };
  Object.entries(P).forEach(([k, [op, c]]) => {
    L.scores[k] = { op, c };
  });
  L.wComp = [50, 20, 30];
  return s;
}

/** Identitas laporan PDF, disimpan terpisah agar tidak hilang saat memuat contoh/mengosongkan data */
export function createReportMeta() {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return {
    lokasi: '',
    pengguna: '',
    tanggal: iso,
    tempat: '',
    suratTugas: '',
    penilai: '',
    nip: '',
    sections: { asumsi: true, langkah: true, grafik: true, proyeksi: [1, 2, 3, 4, 5], tanah: true, kewajaran: true, ttd: true }
  };
}

const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

/** Lengkapi data tersimpan (versi lama) dengan kunci yang belum ada */
export function mergeDefaults(base, saved) {
  if (!isObj(saved)) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  Object.keys(saved).forEach((k) => {
    if (!(k in base)) {
      out[k] = saved[k];
    } else if (isObj(base[k]) && isObj(saved[k])) {
      out[k] = mergeDefaults(base[k], saved[k]);
    } else if (Array.isArray(base[k]) === Array.isArray(saved[k]) || base[k] === null || saved[k] === null) {
      out[k] = saved[k];
    }
  });
  return out;
}

export function normalizeState(saved) {
  const s = mergeDefaults(createBlankState(), saved);
  // Versi lama menyimpan "sisa umur ekonomis" di objek.umur
  if (saved?.objek?.umur > 0 && s.bangunan.umurEkonomis == null) {
    s.bangunan.umurEkonomis = saved.objek.umur;
    s.bangunan.umurEfektif = 0;
  }
  delete s.objek.umur;
  s.v = STATE_VERSION;
  return s;
}
