<script setup>
import { toRef, computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtInt } from '@/core/format.js';
import NumberField from '@/components/common/NumberField.vue';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';

const data = toRef(store, 'data');
const rows = computed(() => data.value.rent.filter((r) => (r.luas || 0) > 0 && (r.sewa || 0) > 0));
const summary = computed(() => (rows.value.length ? `${rows.value.length} pembanding` : 'Opsional'));
const own = computed(() => {
  const a = result.value.area;
  if (!(a > 0) || !result.value.ready) return null;
  const s = result.value.main;
  return { y1: s.cf1 / a, avg: s.rounded / 5 / a };
});

function add() {
  data.value.rent.push({ nama: '', luas: null, sewa: null });
}
function remove(i) {
  data.value.rent.splice(i, 1);
}
</script>

<template>
  <CollapsibleSection id="in-pembanding" title="4. Sewa pembanding (uji kewajaran)" :summary="summary" :default-open="false">
    <div class="stack">
      <p class="lead">Opsional. Bandingkan hasil penilaian dengan sewa properti sejenis.</p>
      <p v-if="!data.rent.length" class="hint">Belum ada pembanding.</p>
      <div v-for="(r, i) in data.rent" :key="i" class="rrow">
        <div class="grid">
          <input v-model="r.nama" class="input" type="text" placeholder="Nama pembanding" :aria-label="`Nama pembanding sewa ${i + 1}`" autocomplete="off" />
          <NumberField v-model="r.luas" kind="num" suffix="m²" :label="`Luas pembanding ${i + 1}`" />
          <NumberField v-model="r.sewa" kind="rp" prefix="Rp" placeholder="Sewa per tahun" :label="`Sewa per tahun pembanding ${i + 1}`" />
        </div>
        <button type="button" class="btn-x" :aria-label="`Hapus pembanding ${i + 1}`" @click="remove(i)">×</button>
      </div>
      <div><button type="button" class="btn sm" @click="add">Tambah pembanding</button></div>

      <div v-if="rows.length || own" class="tscroll">
        <table class="tbl">
          <thead>
            <tr><th>Objek</th><th class="n">Rp/m²/tahun</th><th class="n">Rp/m²/bulan</th></tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in rows" :key="i">
              <th scope="row">{{ r.nama || 'Pembanding' }}</th>
              <td class="n">{{ fmtInt(r.sewa / r.luas) }}</td>
              <td class="n">{{ fmtInt(r.sewa / r.luas / 12) }}</td>
            </tr>
            <template v-if="own">
              <tr class="sel"><th scope="row">Hasil penilaian, tahun ke-1</th><td class="n">{{ fmtInt(own.y1) }}</td><td class="n">{{ fmtInt(own.y1 / 12) }}</td></tr>
              <tr class="sel"><th scope="row">Hasil penilaian, rata-rata 5 tahun</th><td class="n">{{ fmtInt(own.avg) }}</td><td class="n">{{ fmtInt(own.avg / 12) }}</td></tr>
            </template>
          </tbody>
        </table>
        <p class="fn">Sewa pembanding dianggap nilai sewa per tahun.</p>
      </div>
    </div>
  </CollapsibleSection>
</template>

<style scoped>
.rrow {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 28px;
  gap: 6px;
  align-items: center;
}
.grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 6px;
}
@media (max-width: 520px) {
  .grid {
    grid-template-columns: 1fr 1fr;
  }
  .grid > :first-child {
    grid-column: 1 / -1;
  }
}
</style>
