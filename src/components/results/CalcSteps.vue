<script setup>
import { computed } from 'vue';
import { store, result } from '@/state/store.js';
import { buildSteps } from '@/core/steps.js';
import { isOpen, toggle, GROUPS } from '@/state/ui.js';
import Icon from '@/components/common/Icon.vue';
import ExpandControls from '@/components/common/ExpandControls.vue';

const steps = computed(() => buildSteps(store.data, result.value, store.ui.tenor));
const idOf = (i) => `step-${i}`;
</script>

<template>
  <p v-if="!steps.length" class="empty">Isi risk free untuk sewa {{ store.ui.tenor }} tahun di bagian 3 agar langkah hitung muncul.</p>
  <template v-else>
    <ExpandControls :ids="GROUPS.langkah" label="7 tahap perhitungan" class="ctl" />
    <ol class="steps">
      <li v-for="(st, i) in steps" :key="i" :class="{ open: isOpen(idOf(i)) }">
        <button
          :id="`${idOf(i)}-h`"
          type="button"
          class="head"
          :aria-expanded="isOpen(idOf(i))"
          :aria-controls="`${idOf(i)}-b`"
          @click="toggle(idOf(i))"
        >
          <span class="no" aria-hidden="true">{{ i + 1 }}</span>
          <span class="ttl">{{ st.title }}</span>
          <span class="val">{{ st.value }}</span>
          <Icon name="chevron" class="chev" />
        </button>
        <div v-show="isOpen(idOf(i))" :id="`${idOf(i)}-b`" class="body" role="region" :aria-labelledby="`${idOf(i)}-h`">
          <div class="formula">{{ st.formula }}</div>
          <div class="formula res">{{ st.result }}</div>
          <p v-if="st.note">{{ st.note }}</p>
        </div>
      </li>
    </ol>
  </template>
</template>

<style scoped>
.ctl {
  margin-bottom: 8px;
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line-2);
  border-radius: var(--radius-sm);
}
li + li {
  border-top: 1px solid var(--line-2);
}
.head {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto 18px;
  align-items: center;
  gap: 10px;
  width: 100%;
  border: 0;
  background: none;
  padding: 9px 10px;
  text-align: left;
  font: inherit;
  color: var(--ink);
}
.head:hover {
  background: var(--surface-3);
}
.no {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ttl {
  font-size: 13.5px;
  font-weight: 600;
}
.val {
  font-family: var(--font-num);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  white-space: nowrap;
}
.chev {
  width: 18px;
  height: 18px;
  color: var(--ink-3);
}
.open .chev {
  transform: rotate(180deg);
}
.body {
  padding: 0 10px 10px 44px;
}
.formula {
  font-family: var(--font-num);
  font-size: 12.5px;
  color: var(--ink-2);
  overflow-wrap: anywhere;
}
.formula.res {
  color: var(--ink);
  font-weight: 500;
  margin-top: 2px;
}
p {
  font-size: 12.5px;
  color: var(--ink-3);
  margin-top: 4px;
}
@media (max-width: 520px) {
  .head {
    grid-template-columns: 24px minmax(0, 1fr) 18px;
  }
  .val {
    grid-column: 2;
    grid-row: 2;
  }
  .chev {
    grid-column: 3;
    grid-row: 1;
  }
  .body {
    padding-left: 10px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .chev {
    transition: transform 0.2s ease;
  }
}
</style>
