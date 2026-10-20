<script setup>
import { computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtRp } from '@/core/format.js';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';
import ProjectionTable from './ProjectionTable.vue';
import ProjectionChart from './ProjectionChart.vue';
import CalcSteps from './CalcSteps.vue';

const title = computed(() => `Rincian sewa ${store.ui.tenor} tahun`);
const summary = computed(() => {
  const s = result.value.rent.scen[store.ui.tenor - 1];
  return s.missing || !(result.value.value > 0) ? 'Belum lengkap' : `Nilai wajar ${fmtRp(s.rounded)}`;
});
const TABS = [
  { id: 'proyeksi', label: 'Proyeksi DCF' },
  { id: 'grafik', label: 'Grafik' },
  { id: 'langkah', label: 'Langkah hitung' }
];
</script>

<template>
  <CollapsibleSection id="out-rincian" :title="title" :summary="summary">
    <div class="subtabs" role="tablist" aria-label="Rincian proyeksi">
      <button
        v-for="t in TABS"
        :key="t.id"
        type="button"
        role="tab"
        class="subtab"
        :aria-selected="store.ui.detailTab === t.id"
        @click="store.ui.detailTab = t.id"
      >
        {{ t.label }}
      </button>
    </div>
    <ProjectionTable v-if="store.ui.detailTab === 'proyeksi'" />
    <ProjectionChart v-else-if="store.ui.detailTab === 'grafik'" />
    <CalcSteps v-else />
  </CollapsibleSection>
</template>
