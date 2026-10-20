<script setup>
/** Tombol "Buka semua / Tutup semua" untuk satu kelompok tahapan */
import { computed } from 'vue';
import { isOpen, setOpen } from '@/state/ui.js';

const props = defineProps({
  ids: { type: Array, required: true },
  label: { type: String, default: '' },
  defaults: { type: Object, default: () => ({}) }
});

const allOpen = computed(() => props.ids.every((id) => isOpen(id, props.defaults[id] ?? true)));
const allClosed = computed(() => props.ids.every((id) => !isOpen(id, props.defaults[id] ?? true)));
</script>

<template>
  <div class="ctl">
    <span v-if="label" class="lbl">{{ label }}</span>
    <div class="btns">
      <button type="button" class="lnk" :disabled="allOpen" @click="setOpen(ids, true)">Buka semua</button>
      <span class="sep" aria-hidden="true">·</span>
      <button type="button" class="lnk" :disabled="allClosed" @click="setOpen(ids, false)">Tutup semua</button>
    </div>
  </div>
</template>

<style scoped>
.ctl {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.lbl {
  font-size: 12px;
  color: var(--ink-3);
  font-weight: 500;
}
.btns {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}
.lnk {
  border: 0;
  background: none;
  padding: 2px 4px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--accent);
  border-radius: 4px;
}
.lnk:hover:not(:disabled) {
  background: var(--accent-soft);
}
.lnk:disabled {
  color: var(--ink-3);
  cursor: default;
}
.sep {
  color: var(--ink-3);
}
</style>
