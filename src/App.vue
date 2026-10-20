<script setup>
import { store, result } from '@/state/store.js';
import { fmtRp } from '@/core/format.js';
import AppHeader from '@/components/layout/AppHeader.vue';
import PropertyCard from '@/components/inputs/PropertyCard.vue';
import GrowthCard from '@/components/inputs/GrowthCard.vue';
import RiskFreeCard from '@/components/inputs/RiskFreeCard.vue';
import RentCompareCard from '@/components/inputs/RentCompareCard.vue';
import WarningList from '@/components/results/WarningList.vue';
import ResultHero from '@/components/results/ResultHero.vue';
import ScenarioTable from '@/components/results/ScenarioTable.vue';
import DetailPanel from '@/components/results/DetailPanel.vue';
import LandModule from '@/components/land/LandModule.vue';
import PdfDialog from '@/components/pdf/PdfDialog.vue';
import ExpandControls from '@/components/common/ExpandControls.vue';
import { GROUPS } from '@/state/ui.js';
</script>

<template>
  <AppHeader />

  <div v-show="store.ui.tab === 'sewa'" class="mini" aria-hidden="true">
    <span>Nilai wajar sewa 5 tahun di muka</span>
    <b>{{ result.ready ? fmtRp(result.main.rounded) : 'Rp 0' }}</b>
  </div>

  <main v-show="store.ui.tab === 'sewa'" id="tab-sewa" class="wrap layout" role="tabpanel" aria-labelledby="tabbtn-sewa">
    <div class="col-in">
      <p v-if="store.data.example" class="notice">
        Angka yang tampil adalah data contoh dari KKAP Sewa UPBU Mozes Kilangin Timika. Ganti dengan data objek Anda atau pilih Kosongkan.
      </p>
      <ExpandControls :ids="GROUPS.input" label="Tahapan input" :defaults="{ 'in-pembanding': false }" />
      <PropertyCard />
      <GrowthCard />
      <RiskFreeCard />
      <RentCompareCard />
    </div>
    <aside class="col-out" aria-label="Hasil perhitungan">
      <WarningList />
      <ResultHero />
      <ExpandControls :ids="GROUPS.hasil" label="Rincian hasil" />
      <ScenarioTable />
      <DetailPanel />
    </aside>
  </main>

  <main v-show="store.ui.tab === 'tanah'" id="tab-tanah" class="wrap sec" role="tabpanel" aria-labelledby="tabbtn-tanah">
    <LandModule />
  </main>

  <footer class="wrap foot">
    Rumus mengikuti KKAP Sewa metode DCF (sewa dibayar sekaligus di muka). Hasil adalah alat bantu analisis penilai.
  </footer>

  <PdfDialog />
</template>

<style>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  padding-block: 18px 32px;
}
.col-in,
.col-out {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.sec {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-block: 18px 32px;
}
.mini {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: env(safe-area-inset-top, 0px);
  z-index: 30;
  padding-block: 8px;
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
.mini span {
  font-size: 12px;
  color: var(--ink-2);
}
.mini b {
  font-family: var(--font-num);
  font-size: 15px;
  font-weight: 500;
}
.foot {
  font-size: 12px;
  color: var(--ink-3);
  padding-block: 0 32px;
}
@media (min-width: 1000px) {
  .layout {
    grid-template-columns: minmax(340px, 430px) minmax(0, 1fr);
  }
  .col-out {
    position: sticky;
    top: 12px;
    max-height: calc(100vh - 24px);
    overflow-y: auto;
    padding-right: 2px;
  }
  .mini {
    display: none !important;
  }
}
</style>
