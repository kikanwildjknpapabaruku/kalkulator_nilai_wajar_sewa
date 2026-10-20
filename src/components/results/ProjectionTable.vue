<script setup>
import { computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtInt, fmtDec, fmtPct } from '@/core/format.js';
import { perM2Month } from '@/core/valuation.js';

const s = computed(() => result.value.rent.scen[store.ui.tenor - 1]);
const m2 = computed(() => (result.value.value > 0 ? perM2Month(s.value, result.value.area) : null));
</script>

<template>
  <p v-if="s.missing" class="empty">Isi risk free untuk sewa {{ s.n }} tahun di bagian 3 agar proyeksi muncul.</p>
  <template v-else>
    <div class="chips params">
      <span class="chip">Jangka waktu <b>{{ s.n }} tahun</b></span>
      <span class="chip">Risk free <b>{{ fmtPct(s.rf) }}</b></span>
      <span class="chip">Recapture <b>{{ fmtPct(result.rent.rc) }}</b></span>
      <span class="chip">Kenaikan sewa <b>{{ fmtPct(result.rent.g) }}</b></span>
      <span class="chip">Kapitalisasi <b>{{ fmtPct(s.cap) }}</b></span>
      <span class="chip">Diskonto <b>{{ fmtPct(s.disc) }}</b></span>
    </div>
    <div class="tscroll">
      <table class="tbl">
        <thead>
          <tr><th>Tahun ke-</th><th class="n">Arus kas (Rp)</th><th class="n">Faktor diskonto</th><th class="n">Nilai kini (Rp)</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in s.rows" :key="r.t">
            <th scope="row">{{ r.t }}</th>
            <td class="n">{{ fmtInt(r.cf) }}</td>
            <td class="n">{{ fmtDec(r.df, 6, 6) }}</td>
            <td class="n">{{ fmtInt(r.pv) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr><th scope="row" colspan="3">Total nilai kini arus kas</th><td class="n">{{ fmtInt(s.total) }}</td></tr>
          <tr><th scope="row" colspan="3">Nilai wajar sewa {{ s.n }} tahun di muka (dibulatkan ribuan)</th><td class="n">{{ fmtInt(s.rounded) }}</td></tr>
          <tr v-if="m2 != null"><th scope="row" colspan="3">Rata-rata per m² per bulan</th><td class="n">{{ fmtInt(m2) }}</td></tr>
        </tfoot>
      </table>
    </div>
    <p class="fn">Sewa dibayar di muka, jadi arus kas tahun ke-1 tidak didiskon. Faktor diskonto = 1 ÷ (1 + diskonto)^(tahun − 1).</p>
  </template>
</template>

<style scoped>
.params {
  margin-bottom: 10px;
}
</style>
