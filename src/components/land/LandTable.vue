<script setup>
import { toRef, computed } from 'vue';
import { store, result } from '@/state/store.js';
import { fmtInt, fmtDec, fmtAdj } from '@/core/format.js';
import { CRIT, CRIT_ORDER, TRANSACTION_ADJ, levelName } from '@/core/constants.js';
import NumberField from '@/components/common/NumberField.vue';
import Icon from '@/components/common/Icon.vue';
import { isOpen, toggle } from '@/state/ui.js';

const data = toRef(store, 'data');
const land = computed(() => result.value.land);
const COLS = [0, 1, 2];
const SCORES = [5, 4, 3, 2, 1];
const wOk = computed(() => Math.abs(land.value.wSum - 100) < 0.0001);

const adjClass = (a) => (a > 0.000001 ? 'pos' : a < -0.000001 ? 'neg' : '');
const scoreText = (k, s) => (s == null ? '–' : `${s} · ${levelName(k, s)}`);

/** Tahap perhitungan tanah. Saat ditutup, baris hasil tahap tetap tampil. */
const GROUPS = [
  { id: 'land-g1', title: '1. Data pembanding', hidden: 5 },
  { id: 'land-g2', title: '2. Penyesuaian transaksi (%)', hidden: 5 },
  { id: 'land-g3', title: '3. Penyesuaian properti (ranking analysis)', hidden: 11 },
  { id: 'land-g4', title: '4. Pembobotan data pembanding', hidden: 2 }
];
const open = (i) => isOpen(GROUPS[i].id);
</script>

<template>
  <div class="tscroll wrap-table">
    <table class="tbl land">
      <thead>
        <tr>
          <th>Uraian</th>
          <th>Objek penilaian</th>
          <th v-for="i in COLS" :key="i">Pembanding {{ i + 1 }}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="grp"><th colspan="5"><button type="button" class="gbtn" :aria-expanded="open(0)" @click="toggle(GROUPS[0].id)"><Icon name="chevron" class="chev" :class="{ up: open(0) }" />{{ GROUPS[0].title }}<span v-if="!open(0)" class="gsum">{{ GROUPS[0].hidden }} baris rincian disembunyikan</span></button></th></tr>
        <tr v-show="open(0)">
          <th scope="row">Sumber data</th>
          <td>–</td>
          <td v-for="i in COLS" :key="i">
            <input v-model="data.land.comps[i].nama" class="input" type="text" :aria-label="`Sumber data pembanding ${i + 1}`" autocomplete="off" />
          </td>
        </tr>
        <tr v-show="open(0)">
          <th scope="row">Luas tanah</th>
          <td><NumberField v-model="data.luas" kind="num" suffix="m²" label="Luas tanah objek penilaian" /></td>
          <td v-for="i in COLS" :key="i"><NumberField v-model="data.land.comps[i].luas" kind="num" suffix="m²" :label="`Luas tanah pembanding ${i + 1}`" /></td>
        </tr>
        <tr v-show="open(0)">
          <th scope="row">Harga properti</th>
          <td>–</td>
          <td v-for="i in COLS" :key="i"><NumberField v-model="data.land.comps[i].harga" kind="rp" prefix="Rp" :label="`Harga properti pembanding ${i + 1}`" /></td>
        </tr>
        <tr v-show="open(0)">
          <th scope="row">Ekstraksi nilai bangunan</th>
          <td>–</td>
          <td v-for="i in COLS" :key="i"><NumberField v-model="data.land.comps[i].bangunan" kind="rp" prefix="Rp" :label="`Nilai bangunan pembanding ${i + 1}`" /></td>
        </tr>
        <tr v-show="open(0)" class="calc">
          <th scope="row">Harga tanah (Rp)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtInt(land.comps[i].hargaTanah) }}</td>
        </tr>
        <tr class="calc">
          <th scope="row">Harga tanah per m² (Rp)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtInt(land.comps[i].perM2) }}</td>
        </tr>
      </tbody>

      <tbody>
        <tr class="grp"><th colspan="5"><button type="button" class="gbtn" :aria-expanded="open(1)" @click="toggle(GROUPS[1].id)"><Icon name="chevron" class="chev" :class="{ up: open(1) }" />{{ GROUPS[1].title }}<span v-if="!open(1)" class="gsum">{{ GROUPS[1].hidden }} baris rincian disembunyikan</span></button></th></tr>
        <tr v-for="(lbl, j) in TRANSACTION_ADJ" v-show="open(1)" :key="lbl">
          <th scope="row">{{ lbl }}</th>
          <td>–</td>
          <td v-for="i in COLS" :key="i"><NumberField v-model="data.land.comps[i].adj[j]" kind="pct" suffix="%" :label="`${lbl} pembanding ${i + 1} (%)`" /></td>
        </tr>
        <tr class="calc">
          <th scope="row">Indikasi nilai tanah 1 per m² (Rp)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtInt(land.comps[i].ind1) }}</td>
        </tr>
      </tbody>

      <tbody>
        <tr class="grp"><th colspan="5"><button type="button" class="gbtn" :aria-expanded="open(2)" @click="toggle(GROUPS[2].id)"><Icon name="chevron" class="chev" :class="{ up: open(2) }" />{{ GROUPS[2].title }}<span v-if="!open(2)" class="gsum">{{ GROUPS[2].hidden }} baris rincian disembunyikan</span></button></th></tr>
        <tr v-show="open(2)" class="subhead">
          <th scope="row">Kriteria dan bobotnya</th>
          <td class="hint">Skor</td>
          <td v-for="i in COLS" :key="i" class="hint">Skor dan penyesuaian</td>
        </tr>
        <tr v-for="k in CRIT_ORDER" v-show="open(2)" :key="k">
          <th scope="row">
            <div class="crit">
              <span>{{ CRIT[k].name }}</span>
              <NumberField v-model="data.land.wCrit[k]" kind="pct" suffix="%" compact :label="`Bobot ${CRIT[k].name} (%)`" class="w" />
            </div>
          </th>
          <template v-if="CRIT[k].auto">
            <td><div class="sc"><span class="auto">{{ scoreText(k, land.comps[0].scores.luas.op) }}</span></div></td>
            <td v-for="i in COLS" :key="i">
              <div class="sc">
                <span class="auto">{{ scoreText(k, land.comps[i].scores.luas.p) }}</span>
                <span class="adj" :class="adjClass(land.comps[i].critAdj[k])">{{ fmtAdj(land.comps[i].critAdj[k]) }}</span>
              </div>
            </td>
          </template>
          <template v-else>
            <td>
              <div class="sc">
                <select v-model.number="data.land.scores[k].op" class="input" :aria-label="`Skor ${CRIT[k].name} objek penilaian`">
                  <option v-for="s in SCORES" :key="s" :value="s">{{ s }} · {{ levelName(k, s) }}</option>
                </select>
              </div>
            </td>
            <td v-for="i in COLS" :key="i">
              <div class="sc">
                <select v-model.number="data.land.scores[k].c[i]" class="input" :aria-label="`Skor ${CRIT[k].name} pembanding ${i + 1}`">
                  <option v-for="s in SCORES" :key="s" :value="s">{{ s }} · {{ levelName(k, s) }}</option>
                </select>
                <span class="adj" :class="adjClass(land.comps[i].critAdj[k])">{{ fmtAdj(land.comps[i].critAdj[k]) }}</span>
              </div>
            </td>
          </template>
        </tr>
        <tr v-show="open(2)" class="calc">
          <th scope="row">Jumlah bobot kriteria</th>
          <td colspan="4" class="left">
            {{ fmtDec(land.wSum) }}%
            <span class="chip" :class="wOk ? 'good' : 'warn'">{{ wOk ? 'sesuai 100%' : 'harus 100%' }}</span>
          </td>
        </tr>
        <tr class="calc">
          <th scope="row">Jumlah penyesuaian 2</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtAdj(land.comps[i].sum2) }}</td>
        </tr>
        <tr class="calc">
          <th scope="row">Indikasi nilai tanah 2 per m² (Rp)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtInt(land.comps[i].ind2) }}</td>
        </tr>
        <tr v-show="open(2)" class="calc">
          <th scope="row">Total penyesuaian absolut</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtDec(land.comps[i].absTot * 100, 2, 2) }}%</td>
        </tr>
      </tbody>

      <tbody>
        <tr class="grp"><th colspan="5"><button type="button" class="gbtn" :aria-expanded="open(3)" @click="toggle(GROUPS[3].id)"><Icon name="chevron" class="chev" :class="{ up: open(3) }" />{{ GROUPS[3].title }}<span v-if="!open(3)" class="gsum">{{ GROUPS[3].hidden }} baris rincian disembunyikan</span></button></th></tr>
        <tr v-show="open(3)" class="calc">
          <th scope="row">Bobot saran (kebalikan penyesuaian absolut)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtDec(land.sug[i] * 100, 1, 1) }}%</td>
        </tr>
        <tr v-show="open(3)">
          <th scope="row">Bobot yang dipakai</th>
          <td>–</td>
          <td v-for="i in COLS" :key="i"><NumberField v-model="data.land.wComp[i]" kind="pct" suffix="%" :label="`Bobot pembanding ${i + 1} (%)`" /></td>
        </tr>
        <tr class="calc">
          <th scope="row">Nilai terbobot per m² (Rp)</th><td />
          <td v-for="i in COLS" :key="i" class="n">{{ fmtInt(land.weighted[i]) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.wrap-table {
  margin-top: 10px;
}
.land {
  min-width: 840px;
}
.land td,
.land th {
  padding: 6px 8px;
}
.grp th {
  background: var(--surface-2);
  text-align: left;
  padding: 0;
}
.gbtn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 0;
  background: none;
  padding: 8px;
  text-align: left;
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink-2);
}
.gbtn:hover {
  color: var(--accent);
}
.gsum {
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
  color: var(--ink-3);
}
.chev {
  width: 16px;
  height: 16px;
  flex: none;
}
.chev.up {
  transform: rotate(180deg);
}
@media (prefers-reduced-motion: no-preference) {
  .chev {
    transition: transform 0.2s ease;
  }
}
.calc td,
.calc th {
  background: var(--surface-3);
}
.calc th {
  font-weight: 600;
}
.subhead th {
  font-size: 12.5px;
  color: var(--ink-2);
}
.land td > .aff,
.land td > .input {
  min-width: 120px;
}
.land td > .input {
  text-align: left;
}
.crit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.crit .w {
  width: 86px;
  flex: none;
}
.sc {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.sc select {
  min-width: 124px;
  padding: 4px;
}
.adj {
  font-family: var(--font-num);
  font-size: 12px;
  color: var(--ink-3);
}
.adj.pos {
  color: var(--good);
}
.adj.neg {
  color: var(--crit);
}
.auto {
  font-size: 12.5px;
  color: var(--ink-2);
}
.left {
  text-align: left !important;
}
</style>
