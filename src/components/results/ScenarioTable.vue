<script setup>
import { ref, computed } from 'vue';
import { store, result, selectTenor } from '@/state/store.js';
import { fmtInt, fmtPct, fmtRp } from '@/core/format.js';
import { perM2Month } from '@/core/valuation.js';
import { scenarioTsv } from '@/core/exportText.js';
import Icon from '@/components/common/Icon.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';

const copyLabel = ref('Salin tabel');
const summary = computed(() => (result.value.ready ? `5 tahun: ${fmtRp(result.value.main.rounded)}` : 'Belum lengkap'));

function flash(text) {
  copyLabel.value = text;
  setTimeout(() => { copyLabel.value = 'Salin tabel'; }, 1800);
}

function copy() {
  const text = scenarioTsv(store.data, result.value);
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    flash(ok ? 'Tersalin' : 'Salin manual tidak tersedia');
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => flash('Tersalin'), fallback);
  else fallback();
}
</script>

<template>
  <CollapsibleSection id="out-tabel" title="Nilai wajar sewa menurut jangka waktu" :summary="summary">
    <div class="row-between head">
      <span class="hint">Pilih jangka waktu untuk melihat proyeksinya.</span>
      <button type="button" class="btn sm" @click="copy"><Icon name="copy" />{{ copyLabel }}</button>
    </div>
    <div class="tscroll">
      <table class="tbl">
        <thead>
          <tr>
            <th>Jangka waktu</th>
            <th class="n">Risk free</th>
            <th class="n">Kapitalisasi</th>
            <th class="n">Diskonto</th>
            <th class="n">Arus kas tahun 1 (Rp)</th>
            <th class="n">Nilai wajar sewa (Rp)</th>
            <th class="n">Rp/m²/bulan*</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in result.rent.scen" :key="s.n" :class="{ sel: s.n === store.ui.tenor }">
            <th scope="row">
              <button type="button" class="rowbtn" :aria-pressed="s.n === store.ui.tenor" @click="selectTenor(s.n)">{{ s.n }} tahun</button>
            </th>
            <template v-if="s.missing">
              <td colspan="6" class="missing">Isi risk free untuk tenor ini</td>
            </template>
            <template v-else>
              <td class="n">{{ fmtPct(s.rf) }}</td>
              <td class="n">{{ fmtPct(s.cap) }}</td>
              <td class="n">{{ fmtPct(s.disc) }}</td>
              <td class="n">{{ fmtInt(s.cf1) }}</td>
              <td class="n val">{{ fmtInt(s.rounded) }}</td>
              <td class="n">{{ result.value > 0 && perM2Month(s, result.area) != null ? fmtInt(perM2Month(s, result.area)) : '–' }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="fn">*Rata-rata per m² per bulan selama jangka waktu sewa.</p>
  </CollapsibleSection>
</template>

<style scoped>
.head {
  margin: 10px 0 6px;
}
.rowbtn {
  border: 0;
  background: none;
  padding: 0;
  font-weight: 500;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
.sel .rowbtn {
  font-weight: 600;
}
.val {
  font-weight: 500;
}
.missing {
  text-align: left !important;
  color: var(--ink-3);
}
</style>
