<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { store, result } from '@/state/store.js';
import { TENORS } from '@/core/constants.js';
import { generateReport, reportFilename } from '@/pdf/report.js';
import { saveFile, saveErrorMessage } from '@/pdf/save.js';
import Icon from '@/components/common/Icon.vue';

const dlg = ref(null);
const busy = ref(false);
const status = ref(null); // { kind: 'good' | 'warn', text }

const meta = computed(() => store.report);
const sec = computed(() => store.report.sections);
const landAvailable = computed(() => store.data.mode === 'tanah');
const rentAvailable = computed(() => store.data.rent.some((r) => (r.luas || 0) > 0 && (r.sewa || 0) > 0));
const filename = computed(() => reportFilename(store.data, store.report));

watch(
  () => store.ui.pdfOpen,
  async (open) => {
    await nextTick();
    const el = dlg.value;
    if (!el) return;
    if (open && !el.open) {
      status.value = null;
      if (typeof el.showModal === 'function') el.showModal();
      else el.setAttribute('open', '');
    } else if (!open && el.open) {
      el.close();
    }
  }
);

function close() {
  store.ui.pdfOpen = false;
}

function toggleTenor(n) {
  const list = sec.value.proyeksi;
  const i = list.indexOf(n);
  if (i >= 0) list.splice(i, 1);
  else list.push(n);
}

async function generate() {
  busy.value = true;
  status.value = null;
  await new Promise((r) => setTimeout(r, 30)); // beri waktu tombol menampilkan status
  try {
    const data = JSON.parse(JSON.stringify(store.data));
    const report = JSON.parse(JSON.stringify(store.report));
    const { blob, filename: name, pages } = generateReport(data, result.value, report);
    const how = await saveFile(blob, name);
    status.value = {
      kind: 'good',
      text: how === 'saved' ? `PDF tersimpan (${pages} halaman).` : `PDF diunduh: ${name} (${pages} halaman).`
    };
  } catch (err) {
    status.value = { kind: 'warn', text: err && err.code ? saveErrorMessage(err) : `PDF gagal dibuat: ${err?.message || err}` };
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <dialog ref="dlg" class="pdf-dialog" aria-labelledby="pdf-title" @cancel.prevent="close" @close="store.ui.pdfOpen = false">
    <form method="dialog" class="inner" @submit.prevent="generate">
      <header class="dhead">
        <div>
          <h2 id="pdf-title">Generate PDF laporan perhitungan</h2>
          <p class="hint">Laporan A4 berisi hasil, data dan asumsi, langkah hitung, serta proyeksi DCF.</p>
        </div>
        <button type="button" class="btn icon" aria-label="Tutup" @click="close"><Icon name="close" /></button>
      </header>

      <div class="dbody">
        <p v-if="!result.ready" class="notice warn">
          Hasil belum lengkap: isi nilai properti dan risk free tenor 5 tahun. PDF tetap bisa dibuat, bagian yang kosong ditandai.
        </p>

        <fieldset>
          <legend>Identitas laporan <span class="hint">(opsional, kosongkan bila tidak perlu)</span></legend>
          <div class="grid">
            <div class="field"><label for="r-lokasi">Lokasi objek</label><input id="r-lokasi" v-model="meta.lokasi" class="input" type="text" autocomplete="off" /></div>
            <div class="field"><label for="r-pengguna">Pengguna barang / satker</label><input id="r-pengguna" v-model="meta.pengguna" class="input" type="text" autocomplete="off" /></div>
            <div class="field"><label for="r-tanggal">Tanggal penilaian</label><input id="r-tanggal" v-model="meta.tanggal" class="input" type="date" /></div>
            <div class="field"><label for="r-tempat">Tempat penandatanganan</label><input id="r-tempat" v-model="meta.tempat" class="input" type="text" placeholder="Contoh: Jayapura" autocomplete="off" /></div>
            <div class="field"><label for="r-st">Nomor surat tugas</label><input id="r-st" v-model="meta.suratTugas" class="input" type="text" autocomplete="off" /></div>
            <div class="field"><label for="r-penilai">Nama penilai</label><input id="r-penilai" v-model="meta.penilai" class="input" type="text" autocomplete="off" /></div>
            <div class="field"><label for="r-nip">NIP penilai</label><input id="r-nip" v-model="meta.nip" class="input" type="text" inputmode="numeric" autocomplete="off" /></div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Isi laporan</legend>
          <div class="checks">
            <label class="chk"><input type="checkbox" checked disabled /><span>Hasil utama dan ringkasan 1 sampai 5 tahun</span></label>
            <label class="chk"><input v-model="sec.asumsi" type="checkbox" /><span>Data dan asumsi (risk free, kenaikan sewa, recapture)</span></label>
            <label class="chk"><input v-model="sec.langkah" type="checkbox" /><span>Langkah perhitungan dengan angka</span></label>
            <label class="chk"><input v-model="sec.grafik" type="checkbox" /><span>Grafik arus kas dan nilai kini</span></label>
            <label class="chk" :class="{ off: !landAvailable }">
              <input v-model="sec.tanah" type="checkbox" :disabled="!landAvailable" />
              <span>Lampiran perhitungan nilai tanah<template v-if="!landAvailable"> (hanya bila nilai properti dari modul tanah)</template></span>
            </label>
            <label class="chk" :class="{ off: !rentAvailable }">
              <input v-model="sec.kewajaran" type="checkbox" :disabled="!rentAvailable" />
              <span>Uji kewajaran sewa pembanding<template v-if="!rentAvailable"> (isi sewa pembanding dulu)</template></span>
            </label>
            <label class="chk"><input v-model="sec.ttd" type="checkbox" /><span>Kolom tanda tangan penilai</span></label>
          </div>
          <div class="tenors">
            <span class="lbl">Tabel proyeksi DCF untuk jangka waktu</span>
            <div class="tenor-row" role="group" aria-label="Jangka waktu yang dicetak">
              <button
                v-for="n in TENORS"
                :key="n"
                type="button"
                class="tchip"
                :aria-pressed="sec.proyeksi.includes(n)"
                @click="toggleTenor(n)"
              >
                <Icon v-if="sec.proyeksi.includes(n)" name="check" />{{ n }} tahun
              </button>
            </div>
          </div>
        </fieldset>
      </div>

      <footer class="dfoot">
        <div class="fname">
          <span class="hint">Nama file</span>
          <code>{{ filename }}</code>
          <p v-if="status" class="status" :class="status.kind" role="status">{{ status.text }}</p>
        </div>
        <div class="btns">
          <button type="button" class="btn" @click="close">Tutup</button>
          <button type="submit" class="btn primary" :disabled="busy">
            <Icon name="pdf" />{{ busy ? 'Membuat PDF…' : 'Unduh PDF' }}
          </button>
        </div>
      </footer>
    </form>
  </dialog>
</template>

<style scoped>
.pdf-dialog {
  width: min(680px, calc(100% - 24px));
  max-height: calc(100% - 24px);
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
}
.pdf-dialog::backdrop {
  background: rgba(10, 22, 30, 0.5);
}
.inner {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 24px);
}
.dhead {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--line);
}
.dhead h2 {
  font-size: 16px;
  font-weight: 600;
}
.dbody {
  padding: 14px 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}
legend {
  font-weight: 600;
  font-size: 13.5px;
  margin-bottom: 8px;
  padding: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px 12px;
}
.checks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 8px 16px;
}
.chk.off {
  color: var(--ink-3);
}
.tenors {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tenor-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tchip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 99px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
}
.tchip svg {
  width: 14px;
  height: 14px;
}
.tchip[aria-pressed='true'] {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
.dfoot {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 18px 16px;
  border-top: 1px solid var(--line);
}
.fname {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
code {
  font-family: var(--font-num);
  font-size: 12px;
  color: var(--ink-2);
  overflow-wrap: anywhere;
}
.status {
  font-size: 12.5px;
  font-weight: 500;
  margin-top: 4px;
}
.status.good {
  color: var(--good);
}
.status.warn {
  color: var(--warn);
}
.notice.warn {
  background: var(--warn-bg);
}
.btns {
  display: flex;
  gap: 8px;
}
</style>
