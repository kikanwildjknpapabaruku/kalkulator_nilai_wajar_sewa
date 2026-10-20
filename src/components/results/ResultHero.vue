<script setup>
import { computed } from 'vue';
import { result } from '@/state/store.js';
import { fmtRp } from '@/core/format.js';
import { terbilangRupiah } from '@/core/terbilang.js';

const r = computed(() => {
  const res = result.value;
  const s = res.main;
  const a = res.area;
  if (!res.ready) return null;
  return {
    value: fmtRp(s.rounded),
    words: terbilangRupiah(s.rounded),
    perYear: fmtRp(s.rounded / 5),
    m2y1: a > 0 ? fmtRp(s.cf1 / a / 12) : '–',
    m2avg: a > 0 ? fmtRp(s.rounded / 5 / a / 12) : '–'
  };
});
</script>

<template>
  <section class="card hero" aria-labelledby="hero-l">
    <p id="hero-l" class="eyebrow">Nilai wajar sewa 5 tahun, dibayar sekaligus di muka</p>
    <p class="big">{{ r ? r.value : 'Rp 0' }}</p>
    <p class="words">{{ r ? r.words : 'Isi nilai properti dan risk free tenor 5 tahun untuk melihat nilai wajar sewa.' }}</p>
    <dl class="kpis">
      <div><dt>Rata-rata per tahun</dt><dd>{{ r ? r.perYear : '–' }}</dd></div>
      <div><dt>Per m² per bulan, tahun ke-1</dt><dd>{{ r ? r.m2y1 : '–' }}</dd></div>
      <div><dt>Per m² per bulan, rata-rata</dt><dd>{{ r ? r.m2avg : '–' }}</dd></div>
    </dl>
  </section>
</template>

<style scoped>
.hero {
  padding: 18px 20px;
  border-top: 3px solid var(--accent);
}
.big {
  font-size: clamp(26px, 4.2vw, 40px);
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin-top: 6px;
  overflow-wrap: anywhere;
}
.words {
  font-size: 12.5px;
  color: var(--ink-2);
  margin-top: 6px;
  font-style: italic;
  overflow-wrap: anywhere;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px 18px;
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--line-2);
}
dt {
  font-size: 12px;
  color: var(--ink-3);
}
dd {
  margin: 0;
  font-family: var(--font-num);
  font-size: 14px;
  font-weight: 500;
}
</style>
