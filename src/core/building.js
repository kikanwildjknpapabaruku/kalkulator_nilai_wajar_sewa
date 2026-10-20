/**
 * Bangunan (untuk objek tanah dan bangunan).
 * Nilai bangunan diisi langsung oleh penilai (hasil penilaian bangunan terpisah).
 *
 *   Sisa umur ekonomis = umur ekonomis - umur efektif
 *   Recapture rate     = 1 / sisa umur ekonomis
 *
 * Recapture diterapkan penuh ke seluruh nilai properti (tanah + bangunan),
 * sesuai rumus KKAP: kapitalisasi = risk free + recapture - kenaikan sewa.
 */
export function calcBuilding(data) {
  const b = data.bangunan || {};
  const nilai = b.nilai || 0;
  const luas = b.luas || 0;
  const umurEkonomis = b.umurEkonomis || 0;
  const umurEfektif = b.umurEfektif || 0;
  const sisa = Math.max(0, umurEkonomis - umurEfektif);
  return {
    nilai,
    luas,
    perM2: luas > 0 ? nilai / luas : 0,
    umurEkonomis,
    umurEfektif,
    sisa,
    recapture: sisa > 0 ? 1 / sisa : 0
  };
}

export const hasBuilding = (data) => data.objek.jenis === 'tanah_bangunan';
