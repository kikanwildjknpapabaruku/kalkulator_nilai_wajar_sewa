<script setup>
/** Grafik batang berpasangan: arus kas nominal vs nilai kini per tahun (SVG, tanpa pustaka). */
import { computed, ref } from 'vue';
import { store, result } from '@/state/store.js';
import { compact, fmtRp } from '@/core/format.js';
import { yScale } from '@/utils/chartScale.js';

const W = 640;
const H = 270;
const M = { l: 58, r: 10, t: 22, b: 34 };
const PW = W - M.l - M.r;
const PH = H - M.t - M.b;

function barPath(x, y, w, h) {
  const r = Math.min(4, h / 2, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

const s = computed(() => result.value.rent.scen[store.ui.tenor - 1]);

const chart = computed(() => {
  const sc = s.value;
  const maxV = Math.max(0, ...sc.rows.map((r) => r.cf));
  if (!(maxV > 0)) return null;
  const { top, values } = yScale(maxV, 4);
  const y = (v) => M.t + PH - (v / top) * PH;
  const ticks = values.map((v) => ({ v, y: y(v), label: compact(v) }));
  const n = sc.rows.length;
  const gw = PW / n;
  const bw = Math.min(44, gw * 0.32);
  const gap = 2;
  const groups = sc.rows.map((r, i) => {
    const cx = M.l + i * gw + gw / 2;
    const x1 = cx - bw - gap / 2;
    const x2 = cx + gap / 2;
    return {
      ...r,
      cx,
      hitX: M.l + i * gw,
      cfPath: barPath(x1, y(r.cf), bw, y(0) - y(r.cf)),
      pvPath: barPath(x2, y(r.pv), bw, y(0) - y(r.pv)),
      labelled: i === 0 || i === n - 1,
      cfLabel: { x: cx - gap / 2 - 2, y: y(r.cf) - 5, text: compact(r.cf) },
      pvLabel: { x: cx + gap / 2 + 2, y: y(r.pv) - 5, text: compact(r.pv) }
    };
  });
  return { ticks, groups, gw, base: y(0) };
});

const tip = ref(null);
const box = ref(null);
function showTip(e, g) {
  const b = box.value.getBoundingClientRect();
  let x = e.clientX - b.left + 12;
  if (x + 210 > b.width) x = e.clientX - b.left - 222;
  tip.value = { x: Math.max(0, x), y: Math.max(0, e.clientY - b.top - 44), g };
}
</script>

<template>
  <p v-if="!chart" class="empty">Isi nilai properti dan risk free untuk melihat grafik.</p>
  <template v-else>
    <div class="legend">
      <span><i class="sw s1" />Arus kas</span>
      <span><i class="sw s2" />Nilai kini (terdiskonto)</span>
    </div>
    <div ref="box" class="chartbox" @pointerleave="tip = null">
      <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Grafik arus kas dan nilai kini per tahun untuk sewa ${s.n} tahun`">
        <g v-for="t in chart.ticks" :key="t.v">
          <line class="gl" :x1="M.l" :x2="W - M.r" :y1="t.y" :y2="t.y" />
          <text class="ax" :x="M.l - 8" :y="t.y + 4" text-anchor="end">{{ t.label }}</text>
        </g>
        <line class="base" :x1="M.l" :x2="W - M.r" :y1="chart.base" :y2="chart.base" />
        <g v-for="g in chart.groups" :key="g.t">
          <path :d="g.cfPath" class="b1" />
          <path :d="g.pvPath" class="b2" />
          <template v-if="g.labelled">
            <text class="vl" :x="g.cfLabel.x" :y="g.cfLabel.y" text-anchor="end">{{ g.cfLabel.text }}</text>
            <text class="vl" :x="g.pvLabel.x" :y="g.pvLabel.y" text-anchor="start">{{ g.pvLabel.text }}</text>
          </template>
          <text class="ax" :x="g.cx" :y="H - 12" text-anchor="middle">Tahun {{ g.t }}</text>
          <rect
            :x="g.hitX"
            :y="M.t"
            :width="chart.gw"
            :height="PH"
            fill="transparent"
            @pointermove="showTip($event, g)"
            @pointerdown="showTip($event, g)"
          />
        </g>
      </svg>
      <div v-if="tip" class="tip" :style="{ left: `${tip.x}px`, top: `${tip.y}px` }">
        <b>Tahun ke-{{ tip.g.t }}</b>
        <div>Arus kas: {{ fmtRp(tip.g.cf) }}</div>
        <div>Nilai kini: {{ fmtRp(tip.g.pv) }}</div>
      </div>
    </div>
    <p class="fn">Rupiah. M = miliar, jt = juta. Angka lengkap ada di tab Proyeksi DCF.</p>
  </template>
</template>

<style scoped>
.legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--ink-2);
  margin-bottom: 6px;
}
.legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.sw {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.sw.s1 { background: var(--s1); }
.sw.s2 { background: var(--s2); }
.chartbox {
  position: relative;
}
svg {
  width: 100%;
  height: auto;
  display: block;
}
.b1 { fill: var(--s1); }
.b2 { fill: var(--s2); }
.ax {
  fill: var(--ink-3);
  font: 11px var(--font-num);
}
.vl {
  fill: var(--ink-2);
  font: 11px var(--font-num);
}
.gl {
  stroke: var(--line-2);
  stroke-width: 1;
}
.base {
  stroke: var(--line);
  stroke-width: 1;
}
.tip {
  position: absolute;
  pointer-events: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 6px 9px;
  font-size: 12px;
  box-shadow: var(--shadow);
  z-index: 5;
  white-space: nowrap;
}
.tip div {
  font-family: var(--font-num);
}
</style>
