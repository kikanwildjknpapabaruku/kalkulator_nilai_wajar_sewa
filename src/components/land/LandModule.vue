<script setup>
import { computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtRp, fmtDec } from '@/core/format.js';
import { suggestedWeightsPercent } from '@/core/land.js';
import LandTable from './LandTable.vue';
import ScoreGuide from './ScoreGuide.vue';
import ExpandControls from '@/components/common/ExpandControls.vue';
import { GROUPS } from '@/state/ui.js';

const land = computed(() => result.value.land);
const useLand = computed({
  get: () => store.data.mode === 'tanah',
  set: (v) => { store.data.mode = v ? 'tanah' : 'langsung'; }
});
const weightsOk = computed(() => Math.abs(land.value.wSumComp - 100) < 0.0001);

function applySuggested() {
  store.data.land.wComp = suggestedWeightsPercent(land.value.sug);
}
</script>

<template>
  <p v-if="store.data.example" class="notice">
    Pada contoh ini, bobot Luas tanah (2%), Jenis tanah (8%) dan Elevasi (4%) mengikuti angka yang dipakai di file Excel.
    Di tabel Hasil Kajian Tanah pada file yang sama, bobot ketiganya 8%, 4% dan 2%. Ubah bobot di tabel bila perlu.
  </p>

  <div class="top-stats">
    <div class="stat"><div class="k">Nilai wajar tanah per m² (setelah pembulatan)</div><div class="v">{{ land.area > 0 ? fmtRp(land.m2Rounded) : '–' }}</div></div>
    <div class="stat"><div class="k">Nilai wajar tanah (dibulatkan ke ribuan)</div><div class="v">{{ land.area > 0 ? fmtRp(land.rounded) : '–' }}</div></div>
    <div class="stat"><div class="k">{{ result.building ? 'Nilai wajar sewa 5 tahun (tanah ini + bangunan)' : 'Nilai wajar sewa 5 tahun dari nilai ini' }}</div><div class="v">{{ land.rounded > 0 && !result.landRent5.missing ? fmtRp(result.landRent5.rounded) : '–' }}</div></div>
    <div class="stat center">
      <label class="chk"><input v-model="useLand" type="checkbox" /><span>Pakai sebagai nilai tanah di tab Sewa</span></label>
    </div>
  </div>

  <section class="card">
    <div class="row-between">
      <h2>Perhitungan nilai tanah</h2>
      <span class="hint">Pendekatan pembandingan data pasar, ranking analysis, 3 data pembanding</span>
    </div>
    <ExpandControls :ids="GROUPS.tanah" label="4 tahap. Saat ditutup, baris hasil tiap tahap tetap tampil." class="land-ctl" />
    <LandTable />
    <div class="res">
      <div class="stat"><div class="k">Nilai wajar per m² (sebelum pembulatan)</div><div class="v">{{ fmtRp(land.perM2W) }}</div></div>
      <div class="stat"><div class="k">Luas tanah objek</div><div class="v">{{ fmtDec(land.area) }} m²</div></div>
      <div class="stat"><div class="k">Total nilai wajar tanah</div><div class="v">{{ fmtRp(land.total) }}</div></div>
      <div class="stat"><div class="k">Pembulatan ke ribuan</div><div class="v">{{ fmtRp(land.rounded) }}</div></div>
      <div class="stat center">
        <div class="k">
          Bobot pembanding yang dipakai: {{ fmtDec(land.wSumComp) }}%
          <span v-if="!weightsOk" class="chip warn">harus 100%</span>
        </div>
        <button type="button" class="btn sm" @click="applySuggested">Pakai bobot saran</button>
      </div>
    </div>
  </section>

  <ScoreGuide />
</template>

<style scoped>
.land-ctl {
  margin-top: 10px;
}
.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}
.res {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 6px;
}
</style>
