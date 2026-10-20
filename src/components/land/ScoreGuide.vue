<script setup>
import { CRIT, CRIT_ORDER, LEVELS } from '@/core/constants.js';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';
import HelpTip from '@/components/common/HelpTip.vue';
</script>

<template>
  <CollapsibleSection id="land-guide" title="Panduan skor ranking analysis (1 sampai 5)" summary="Definisi skor 9 kriteria" :default-open="false">
    <div class="guide">
      <div v-for="k in CRIT_ORDER" :key="k">
        <h3>{{ CRIT[k].name }}</h3>
        <ol>
          <li v-for="(d, i) in CRIT[k].d" :key="i">
            <b>{{ 5 - i }}</b>{{ (CRIT[k].levels || LEVELS)[i] }}: {{ d }}
          </li>
        </ol>
      </div>
    </div>
    <p class="fn">
      Penyesuaian = (skor objek penilaian − skor pembanding) ÷ 5 × bobot kriteria. Hasilnya positif bila objek penilaian lebih baik dari pembanding.
      Skor luas tanah dihitung otomatis dari rentang luas.
      <HelpTip inline term="ranking" />
    </p>
  </CollapsibleSection>
</template>

<style scoped>
.guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 12px;
}
h3 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}
ol {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 12.5px;
  color: var(--ink-2);
  display: flex;
  flex-direction: column;
  gap: 3px;
}
b {
  font-family: var(--font-num);
  font-weight: 500;
  color: var(--ink);
  margin-right: 6px;
}
</style>
