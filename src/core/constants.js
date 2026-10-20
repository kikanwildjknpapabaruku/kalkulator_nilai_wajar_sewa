/**
 * Data tetap: kriteria ranking analysis, panduan skor, dan jenis penyesuaian transaksi.
 * Sumber: sheet "Penyesuaian Tanah" dan "Hasil Kajian Tanah" pada KKAP Sewa DCF.
 */

export const TENORS = [1, 2, 3, 4, 5];

/** Urutan kriteria seperti di sheet Penyesuaian Tanah */
export const CRIT_ORDER = ['lokasi', 'luas', 'bentuk', 'jenis', 'kontur', 'elevasi', 'peruntukan', 'akses', 'fasilitas'];

/** Label skor 5 sampai 1 */
export const LEVELS = ['Sangat baik', 'Baik', 'Sedang', 'Jelek', 'Jelek sekali'];

/** d[0] adalah deskripsi skor 5, d[4] skor 1 */
export const CRIT = {
  lokasi: { name: 'Lokasi', d: [
    'Dekat pusat keramaian, kondisi jalan sekitar baik, kondisi sosial ekonomi masyarakat baik',
    'Cukup dekat dengan pusat keramaian, jalan sekitar baik, sosial ekonomi baik',
    'Jauh dari pusat keramaian, jalan sekitar baik, sosial ekonomi baik',
    'Jauh dari pusat keramaian, jalan sekitar jelek, sosial ekonomi baik',
    'Sangat jauh dari pusat keramaian, jalan sekitar jelek, sosial ekonomi baik'] },
  luas: { name: 'Luas tanah', auto: true, levels: ['Kecil', 'Cukup', 'Menengah', 'Luas', 'Sangat luas'], d: [
    'Kurang dari 500 m²', '500 sampai 2.000 m²', '2.001 sampai 10.000 m²', '10.001 sampai 20.000 m²', 'Lebih dari 20.000 m²'] },
  bentuk: { name: 'Bentuk tanah', d: [
    'Persegi panjang atau persegi', 'Cenderung persegi panjang (tidak ideal)', 'Trapesium', 'Huruf L', 'Tidak beraturan'] },
  jenis: { name: 'Jenis tanah', d: [
    'Darat matang sudah terkavling', 'Darat matang (belum terkavling)', 'Campuran (darat matang dan darat mentah)', 'Darat mentah', 'Rawa atau berair'] },
  kontur: { name: 'Kontur tanah', d: [
    'Datar seluruhnya', 'Dominan datar', 'Miring', 'Miring, bergelombang, berbukit', 'Miring, bergelombang dan tebing curam'] },
  elevasi: { name: 'Elevasi dari jalan', d: [
    'Seluruh bagian tanah sejajar dengan jalan', 'Sebagian besar tanah sejajar dengan jalan', 'Sebagian kecil tanah tidak sejajar jalan',
    'Campuran (di atas dan di bawah jalan)', 'Di bawah jalan'] },
  peruntukan: { name: 'Peruntukan sekitar', d: [
    'Komersial', 'Campuran komersial dan residensial', 'Residensial', 'Industri', 'Perkebunan atau pertanian'] },
  akses: { name: 'Aksesibilitas', d: [
    'Lebar jalan lebih dari 4 m, aspal/beton, kondisi baik, jalan desa/kecamatan, 2 arah dapat dilalui mobil dan motor',
    'Lebar jalan 3 sampai 4 m, aspal/beton, rusak ringan, jalan desa/kecamatan, 2 arah dapat dilalui mobil dan motor',
    'Lebar jalan 3 sampai 4 m, aspal/beton, rusak, jalan desa/kecamatan, 1 arah dapat dilalui mobil dan motor',
    'Lebar jalan 3 sampai 4 m, makadam, rusak berat, jalan desa/kecamatan, sulit dilalui mobil/motor (offroad)',
    'Jalan setapak atau tidak ada jalan'] },
  fasilitas: { name: 'Fasilitas', d: [
    'Tersedia PLN, PDAM, penerangan jalan', 'Tersedia PLN, PDAM', 'Tersedia PLN, penerangan jalan', 'Tersedia PLN', 'Tidak tersedia'] }
};

/** Bobot kriteria menurut tabel Hasil Kajian Tanah (persen, total 100) */
export const DEFAULT_CRIT_WEIGHTS = { lokasi: 30, luas: 8, bentuk: 3, jenis: 4, kontur: 6, elevasi: 2, peruntukan: 0, akses: 27, fasilitas: 20 };

/** Penyesuaian transaksi, diterapkan berurutan (perkalian bertingkat) */
export const TRANSACTION_ADJ = ['Jenis dokumen / hak', 'Pembiayaan', 'Kondisi penjualan', 'Biaya setelah pembelian', 'Kondisi pasar'];

/** Skor luas tanah otomatis menurut rentang pada panduan skor */
export function luasScore(area) {
  if (area < 500) return 5;
  if (area <= 2000) return 4;
  if (area <= 10000) return 3;
  if (area <= 20000) return 2;
  return 1;
}

export function levelName(key, score) {
  return (CRIT[key].levels || LEVELS)[5 - score];
}
