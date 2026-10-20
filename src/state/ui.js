/**
 * Status buka/tutup setiap tahapan (kartu, langkah hitung, tahap modul tanah).
 * Disimpan di browser agar tampilan tetap seperti terakhir kali dipakai.
 */
import { reactive, watch } from 'vue';

const KEY = 'kalkulator-sewa-dcf-ui';

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export const sections = reactive(load());

watch(sections, () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(sections));
  } catch {
    /* penyimpanan tidak tersedia */
  }
}, { deep: true });

export function isOpen(id, defaultOpen = true) {
  return id in sections ? sections[id] : defaultOpen;
}

export function toggle(id, defaultOpen = true) {
  sections[id] = !isOpen(id, defaultOpen);
}

export function setOpen(ids, open) {
  ids.forEach((id) => {
    sections[id] = open;
  });
}

/** Daftar id per kelompok, dipakai tombol "Buka semua / Tutup semua" */
export const GROUPS = {
  input: ['in-objek', 'in-kenaikan', 'in-riskfree', 'in-pembanding'],
  hasil: ['out-tabel', 'out-rincian'],
  langkah: ['step-0', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6'],
  tanah: ['land-g1', 'land-g2', 'land-g3', 'land-g4']
};
