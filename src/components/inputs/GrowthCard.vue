<script setup>
import { toRef, computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtDec } from '@/core/format.js';
import { growthAverage, growthUsed } from '@/core/rent.js';
import NumberField from '@/components/common/NumberField.vue';
import SegmentedControl from '@/components/common/SegmentedControl.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';

const data = toRef(store, 'data');
const MODES = [
  { value: 'hist', label: 'Rata-rata data historis' },
  { value: 'manual', label: 'Input manual' }
];
const summary = computed(() => `Dipakai ${fmtDec(result.value.rent.g * 100, 2, 4)}%`);
const avgText = computed(() => `Rata-rata ${fmtDec(growthAverage(data.value), 2, 4)}%, dibulatkan ${fmtDec(growthUsed(data.value), 2, 2)}%`);

function addRow() {
  data.value.growth.hist.push({ label: '', v: null });
}
function removeRow(i) {
  data.value.growth.hist.splice(i, 1);
}
</script>

<template>
  <CollapsibleSection id="in-kenaikan" title="2. Tingkat kenaikan sewa" :summary="summary">
    <p class="lead">Pertumbuhan sewa per tahun untuk memproyeksikan arus kas.</p>
    <div class="stack">
      <SegmentedControl v-model="data.growth.mode" :options="MODES" name="gmode" label="Cara menentukan kenaikan sewa" />

      <div v-if="data.growth.mode === 'hist'" class="stack inner">
        <div v-for="(h, i) in data.growth.hist" :key="i" class="hrow">
          <input v-model="h.label" class="input" type="text" placeholder="Periode" :aria-label="`Periode ${i + 1}`" autocomplete="off" />
          <NumberField v-model="h.v" kind="pct" suffix="%" :label="`Kenaikan sewa periode ${i + 1}`" />
          <button type="button" class="btn-x" :aria-label="`Hapus baris ${i + 1}`" @click="removeRow(i)">×</button>
        </div>
        <div class="row-between">
          <button type="button" class="btn sm" @click="addRow">Tambah tahun</button>
          <span class="hint">{{ avgText }}</span>
        </div>
      </div>

      <div v-else class="field">
        <label for="gManual">Kenaikan sewa per tahun</label>
        <NumberField id="gManual" v-model="data.growth.manual" kind="pct" suffix="%" />
      </div>

      <div class="field">
        <label for="gSumber">Sumber informasi</label>
        <input id="gSumber" v-model="data.growth.sumber" class="input" type="text" placeholder="Contoh: Bank Indonesia, indeks harga properti komersial" autocomplete="off" />
      </div>
      <div class="chips">
        <span class="chip">Dipakai <b>{{ fmtDec(result.rent.g * 100, 2, 4) }}%</b></span>
      </div>
    </div>
  </CollapsibleSection>
</template>

<style scoped>
.inner {
  margin-top: 0 !important;
  gap: 6px;
}
.hrow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 130px 28px;
  gap: 6px;
  align-items: center;
}
</style>
