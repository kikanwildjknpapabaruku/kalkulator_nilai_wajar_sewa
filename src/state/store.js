/**
 * Store aplikasi (reactive Vue). Satu sumber data untuk semua komponen:
 *  - store.data   : data input penilaian (tersimpan otomatis di localStorage)
 *  - store.report : identitas dan pilihan laporan PDF (tersimpan terpisah)
 *  - store.ui     : status tampilan (tab aktif, jangka waktu terpilih, dialog)
 *  - result       : hasil perhitungan, dihitung ulang otomatis setiap input berubah
 */
import { reactive, computed, watch } from 'vue';
import { createBlankState, createExampleState, createReportMeta, normalizeState, mergeDefaults } from './defaults.js';
import { computeValuation } from '@/core/valuation.js';

const KEY_DATA = 'kalkulator-sewa-dcf-v2';
const KEY_DATA_V1 = 'kalkulator-sewa-dcf-v1';
const KEY_REPORT = 'kalkulator-sewa-dcf-report';

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* penyimpanan tidak tersedia (mode privat, dsb.) */
  }
}

function loadData() {
  const saved = read(KEY_DATA) || read(KEY_DATA_V1);
  if (saved && saved.land && saved.growth && saved.rf) return normalizeState(saved);
  return null;
}

function loadReport() {
  const saved = read(KEY_REPORT);
  return saved ? mergeDefaults(createReportMeta(), saved) : createReportMeta();
}

export const store = reactive({
  data: loadData() || createExampleState(),
  report: loadReport(),
  // glossaryTerm: istilah yang harus dibuka di tab Petunjuk; returnTab: tab asal untuk tombol "Kembali"
  ui: { tab: 'sewa', detailTab: 'proyeksi', tenor: 5, pdfOpen: false, glossaryTerm: null, returnTab: null }
});

export const result = computed(() => computeValuation(store.data));

/* ---- Simpan otomatis ---- */
let replacing = false;
let timer;
const saveData = () => write(KEY_DATA, store.data);

watch(
  () => store.data,
  () => {
    if (replacing) replacing = false;
    else if (store.data.example) store.data.example = false; // pengguna mulai mengubah data contoh
    clearTimeout(timer);
    timer = setTimeout(saveData, 300);
  },
  { deep: true }
);
watch(() => store.report, () => write(KEY_REPORT, store.report), { deep: true });

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', saveData);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveData();
  });
}

/* ---- Aksi ---- */
export function loadExample() {
  replacing = true;
  store.data = createExampleState();
}

export function clearAll() {
  replacing = true;
  store.data = createBlankState();
}

export function selectTenor(n) {
  store.ui.tenor = n;
}

export function setTab(tab) {
  store.ui.tab = tab;
  store.ui.returnTab = null;
  if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
}

/** Buka penjelasan lengkap sebuah istilah di tab Petunjuk, dengan jalan kembali ke tab asal */
export function openGlossary(termId) {
  const from = store.ui.tab === 'petunjuk' ? store.ui.returnTab : store.ui.tab;
  setTab('petunjuk');
  store.ui.returnTab = from;
  store.ui.glossaryTerm = termId;
}
