/**
 * Menyimpan file hasil generate ke perangkat pengguna.
 *  - Saat dibuka di claude.ai (artifact): memakai izin unduhan claude.ai (pengguna mengonfirmasi).
 *  - Saat dibuka sebagai file HTML di komputer: memakai unduhan browser biasa.
 */
let downloadsPromise = null;

export function prepareDownloads() {
  if (!downloadsPromise) {
    const claude = typeof window !== 'undefined' ? window.claude : undefined;
    downloadsPromise = claude && typeof claude.use === 'function'
      ? Promise.resolve(claude.use('downloads')).catch(() => null)
      : Promise.resolve(null);
  }
  return downloadsPromise;
}

function browserDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * @returns {Promise<'saved'|'downloaded'>}
 * @throws {{code: string, message: string}} bila pengguna membatalkan atau unduhan tidak tersedia
 */
export async function saveFile(blob, filename) {
  const downloads = await prepareDownloads();
  if (downloads) {
    await downloads.save({ filename, data: blob });
    return 'saved';
  }
  browserDownload(blob, filename);
  return 'downloaded';
}

/** Pesan yang mudah dipahami untuk kode galat unduhan */
export function saveErrorMessage(err) {
  switch (err?.code) {
    case 'declined':
      return 'Penyimpanan dibatalkan.';
    case 'rate_limited':
      return 'Masih ada konfirmasi penyimpanan yang terbuka. Selesaikan dulu, lalu coba lagi.';
    case 'too_large':
      return 'File terlalu besar untuk disimpan di tampilan ini.';
    default:
      return 'Unduhan tidak tersedia di tampilan ini. Buka file HTML aplikasi di komputer Anda lalu coba lagi.';
  }
}
