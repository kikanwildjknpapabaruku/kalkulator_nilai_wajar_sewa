<script setup>
/** Langkah pemakaian bernomor. Tombol di tiap langkah membawa pengguna ke bagian yang dimaksud. */
import { nextTick } from 'vue';
import { store, setTab } from '@/state/store.js';
import { setOpen } from '@/state/ui.js';
import { STEPS } from '@/content/guide.js';

function go(g) {
  if (g.action === 'pdf') {
    store.ui.pdfOpen = true;
    return;
  }
  if (g.detailTab) store.ui.detailTab = g.detailTab;
  setTab('sewa');
  setOpen([g.section], true);
  nextTick(() => {
    // tunggu animasi buka selesai agar posisi gulir tepat
    setTimeout(() => {
      const head = document.getElementById(`${g.section}-head`);
      head?.closest('.coll')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      head?.focus({ preventScroll: true });
    }, 260);
  });
}
</script>

<template>
  <ol class="steps">
    <li v-for="(s, i) in STEPS" :key="i">
      <span class="no" aria-hidden="true">{{ i + 1 }}</span>
      <div class="txt">
        <h3>{{ s.title }}</h3>
        <p>{{ s.text }}</p>
        <button type="button" class="btn sm" @click="go(s.go)">{{ s.go.label }}</button>
      </div>
    </li>
  </ol>
</template>

<style scoped>
.steps {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
li {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 12px;
}
.no {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
h3 {
  font-size: 14px;
  font-weight: 600;
}
p {
  color: var(--ink-2);
  margin: 2px 0 8px;
}
</style>
