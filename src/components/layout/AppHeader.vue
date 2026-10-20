<script setup>
import { ref } from 'vue';
import { store, loadExample, clearAll, setTab } from '@/state/store.js';
import Icon from '@/components/common/Icon.vue';
import ThemeToggle from '@/components/common/ThemeToggle.vue';

const TABS = [
  { id: 'sewa', label: 'Sewa (DCF)' },
  { id: 'tanah', label: 'Nilai tanah' },
  { id: 'petunjuk', label: 'Petunjuk dan istilah' }
];

const armed = ref(false);
let timer;
function onClear() {
  if (armed.value) {
    clearTimeout(timer);
    armed.value = false;
    clearAll();
    return;
  }
  armed.value = true;
  timer = setTimeout(() => { armed.value = false; }, 3500);
}
</script>

<template>
  <header class="top">
    <div class="wrap top-in">
      <div class="brand">
        <p class="eyebrow">Penilaian pemanfaatan BMN melalui sewa</p>
        <h1>Kalkulator Nilai Wajar Sewa</h1>
        <p class="sub">Metode discounted cashflow, sewa dibayar sekaligus di muka. Hasil langsung muncul untuk jangka waktu 1 sampai 5 tahun.</p>
      </div>
      <div class="actions">
        <button type="button" class="btn" @click="loadExample"><Icon name="book" />Muat contoh KKAP</button>
        <button type="button" class="btn" :class="{ danger: armed }" @click="onClear">
          <Icon name="trash" />{{ armed ? 'Klik lagi untuk menghapus' : 'Kosongkan' }}
        </button>
        <button type="button" class="btn primary" @click="store.ui.pdfOpen = true"><Icon name="pdf" />Generate PDF</button>
        <ThemeToggle />
      </div>
    </div>
    <div class="wrap">
      <div class="tabs" role="tablist" aria-label="Bagian aplikasi">
        <button
          v-for="t in TABS"
          :id="`tabbtn-${t.id}`"
          :key="t.id"
          type="button"
          role="tab"
          class="tab"
          :aria-selected="store.ui.tab === t.id"
          :aria-controls="`tab-${t.id}`"
          @click="setTab(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top {
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.top-in {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  justify-content: space-between;
  align-items: flex-end;
  padding-block: 18px 12px;
}
.brand {
  min-width: 0;
}
h1 {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-top: 2px;
  text-wrap: balance;
}
.sub {
  color: var(--ink-2);
  margin-top: 4px;
  max-width: 62ch;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
}
.tab {
  border: 0;
  background: none;
  padding: 10px 14px;
  font-weight: 500;
  color: var(--ink-2);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.tab:hover {
  color: var(--ink);
}
.tab[aria-selected='true'] {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
</style>
