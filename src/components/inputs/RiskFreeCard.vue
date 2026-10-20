<script setup>
import { toRef, computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtDec } from '@/core/format.js';
import { TENORS } from '@/core/constants.js';
import NumberField from '@/components/common/NumberField.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';
import HelpTip from '@/components/common/HelpTip.vue';

const data = toRef(store, 'data');
const summary = computed(() => {
  const rf5 = data.value.rf.v[4];
  const rf = rf5 == null ? 'Risk free belum diisi' : `Risk free ${fmtDec(rf5, 0, 4)}%${data.value.rf.same ? '' : ' (5 th)'}`;
  return `${rf} · Recapture ${fmtDec(result.value.rent.rc * 100, 2, 4)}%`;
});

function onSameChange(e) {
  const rf = data.value.rf;
  rf.same = e.target.checked;
  // Saat dilepas, isi tenor yang masih kosong dengan nilai tenor 5 tahun sebagai titik awal
  if (!rf.same) rf.v = rf.v.map((x, i) => (i < 4 && x == null ? rf.v[4] : x));
}
</script>

<template>
  <CollapsibleSection id="in-riskfree" title="3. Risk free dan recapture" :summary="summary">
    <p class="lead">Imbal hasil investasi bebas risiko sesuai jangka waktu sewa. <HelpTip inline term="risk-free" /></p>
    <div class="stack">
      <label class="chk">
        <input type="checkbox" :checked="data.rf.same" @change="onSameChange" />
        <span>Pakai risk free tenor 5 tahun untuk semua jangka waktu</span>
      </label>
      <div class="stack inner">
        <div v-for="n in TENORS" :key="n" class="rfrow">
          <label :for="`rf-${n}`">Sewa {{ n }} tahun</label>
          <NumberField
            :id="`rf-${n}`"
            :model-value="data.rf.same ? data.rf.v[4] : data.rf.v[n - 1]"
            kind="pct"
            suffix="%"
            :disabled="data.rf.same && n < 5"
            @update:model-value="(v) => (data.rf.v[n - 1] = v)"
          />
        </div>
      </div>
      <div class="field">
        <label for="rfSumber">Sumber informasi</label>
        <input id="rfSumber" v-model="data.rf.sumber" class="input" type="text" placeholder="Contoh: Investing.com atau PHEI, imbal hasil SBN" autocomplete="off" />
      </div>
      <div class="chips">
        <span class="chip">Recapture rate <b>{{ fmtDec(result.rent.rc * 100, 2, 4) }}%</b></span>
      </div>
      <p class="hint">
        {{ data.objek.jenis === 'tanah_bangunan' ? 'Recapture dihitung dari sisa umur ekonomis bangunan di bagian 1.' : 'Objek berupa tanah, recapture 0%. Pilih Tanah dan bangunan di bagian 1 untuk menghitung recapture.' }}
        <HelpTip inline term="recapture" />
      </p>
    </div>
  </CollapsibleSection>
</template>

<style scoped>
.inner {
  margin-top: 0 !important;
  gap: 6px;
}
.rfrow {
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}
.rfrow label {
  font-size: 13px;
  color: var(--ink-2);
}
</style>
