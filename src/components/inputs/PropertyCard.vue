<script setup>
import { toRef, computed } from 'vue';
import { store, result, setTab } from '@/state/store.js';
import { fmtRp, fmtDec, fmtPct } from '@/core/format.js';
import NumberField from '@/components/common/NumberField.vue';
import SegmentedControl from '@/components/common/SegmentedControl.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';

const data = toRef(store, 'data');
const JENIS = [
  { value: 'tanah', label: 'Tanah saja' },
  { value: 'tanah_bangunan', label: 'Tanah dan bangunan' }
];
const summary = computed(() => `${fmtRp(result.value.value)}${result.value.building ? ' · tanah + bangunan' : ''}`);
const MODES = [
  { value: 'langsung', label: 'Input langsung' },
  { value: 'tanah', label: 'Dari modul nilai tanah' }
];
</script>

<template>
  <CollapsibleSection id="in-objek" title="1. Objek dan nilai properti" :summary="summary">
    <div class="stack">
      <div class="field">
        <label for="nama">Nama objek penilaian</label>
        <input id="nama" v-model="data.nama" class="input" type="text" placeholder="Contoh: UPBU Kelas II Mozes Kilangin Timika" autocomplete="off" />
      </div>
      <div class="field">
        <span class="lbl">Jenis objek</span>
        <SegmentedControl v-model="data.objek.jenis" :options="JENIS" name="jenis" label="Jenis objek" />
      </div>
      <div class="field">
        <label for="luas">Luas tanah</label>
        <NumberField id="luas" v-model="data.luas" kind="num" suffix="m²" />
        <span class="hint">Dipakai untuk nilai per m² per bulan dan untuk modul nilai tanah.</span>
      </div>

      <div class="sub">
        <h3>Nilai tanah</h3>
        <SegmentedControl v-model="data.mode" :options="MODES" name="mode" label="Sumber nilai tanah" />
        <div v-if="data.mode === 'langsung'" class="field">
          <label for="nilaiLangsung">Nilai tanah objek penilaian</label>
          <NumberField id="nilaiLangsung" v-model="data.nilaiLangsung" kind="rp" prefix="Rp" />
          <span class="hint">Hasil penilaian tanah sesuai pedoman DJKN.</span>
        </div>
        <div v-else class="box">
          <div class="lbl">Nilai tanah dari modul nilai tanah</div>
          <b>{{ fmtRp(result.land.rounded) }}</b>
          <div class="hint">
            <template v-if="result.land.area > 0">{{ fmtRp(result.land.m2Rounded) }} per m² × {{ fmtDec(result.land.area) }} m²</template>
            <template v-else>Isi luas tanah dan data pembanding di tab Nilai tanah.</template>
          </div>
          <button type="button" class="btn sm go" @click="setTab('tanah')">Buka modul nilai tanah</button>
        </div>
      </div>

      <div v-if="data.objek.jenis === 'tanah_bangunan'" class="sub">
        <h3>Bangunan</h3>
        <div class="field">
          <label for="bNilai">Nilai bangunan</label>
          <NumberField id="bNilai" v-model="data.bangunan.nilai" kind="rp" prefix="Rp" />
          <span class="hint">Hasil penilaian bangunan (misalnya pendekatan biaya), diisi langsung.</span>
        </div>
        <div class="grid3">
          <div class="field">
            <label for="bLuas">Luas bangunan</label>
            <NumberField id="bLuas" v-model="data.bangunan.luas" kind="num" suffix="m²" />
          </div>
          <div class="field">
            <label for="bUE">Umur ekonomis</label>
            <NumberField id="bUE" v-model="data.bangunan.umurEkonomis" kind="num" suffix="tahun" />
          </div>
          <div class="field">
            <label for="bEF">Umur efektif</label>
            <NumberField id="bEF" v-model="data.bangunan.umurEfektif" kind="num" suffix="tahun" />
          </div>
        </div>
        <div class="chips">
          <span class="chip">Sisa umur ekonomis <b>{{ fmtDec(result.building?.sisa || 0) }} tahun</b></span>
          <span class="chip">Recapture <b>{{ fmtPct(result.rent.rc) }}</b></span>
          <span v-if="result.building && result.building.luas > 0" class="chip">Nilai bangunan per m² <b>{{ fmtRp(result.building.perM2) }}</b></span>
        </div>
        <span class="hint">Recapture = 1 ÷ (umur ekonomis − umur efektif), diterapkan ke seluruh nilai properti sesuai rumus KKAP.</span>
      </div>

      <div class="total">
        <div class="lbl">Nilai properti objek penilaian</div>
        <b>{{ fmtRp(result.value) }}</b>
        <div v-if="result.building" class="hint">Nilai tanah {{ fmtRp(result.landValue) }} + nilai bangunan {{ fmtRp(result.building.nilai) }}</div>
        <div v-else class="hint">Sama dengan nilai tanah</div>
      </div>
    </div>
  </CollapsibleSection>
</template>

<style scoped>
.sub {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid var(--line-2);
  padding-top: 12px;
}
.sub h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
@media (max-width: 480px) {
  .grid3 {
    grid-template-columns: 1fr 1fr;
  }
}
.box,
.total {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.total {
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  background: var(--accent-soft);
}
.total b,
.box b {
  font-family: var(--font-num);
  font-weight: 500;
  font-size: 15px;
}
.go {
  align-self: flex-start;
  margin-top: 8px;
}
</style>
