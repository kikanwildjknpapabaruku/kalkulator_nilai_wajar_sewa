<script setup>
/**
 * Kartu yang bisa dibuka-tutup. Saat tertutup, `summary` (ringkasan angka) tampil di judul.
 * Status tersimpan per `id` lewat state/ui.js.
 */
import { computed } from 'vue';
import { isOpen, toggle } from '@/state/ui.js';
import Icon from './Icon.vue';

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  defaultOpen: { type: Boolean, default: true }
});

const open = computed(() => isOpen(props.id, props.defaultOpen));
const headId = `${props.id}-head`;
const bodyId = `${props.id}-body`;
</script>

<template>
  <section class="card coll" :class="{ open }">
    <h2 class="coll-h">
      <button :id="headId" type="button" class="coll-btn" :aria-expanded="open" :aria-controls="bodyId" @click="toggle(id, defaultOpen)">
        <span class="ttl">{{ title }}</span>
        <span v-if="!open && summary" class="sum">{{ summary }}</span>
        <Icon name="chevron" class="chev" />
      </button>
    </h2>
    <div :id="bodyId" class="coll-body" role="region" :aria-labelledby="headId" :inert="!open">
      <div class="coll-inner">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.coll-h {
  display: block !important;
  margin: 0;
}
.coll-btn {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18px;
  grid-template-areas: 'ttl chev' 'sum sum';
  align-items: center;
  column-gap: 10px;
  row-gap: 6px;
  width: 100%;
  border: 0;
  background: none;
  padding: 0;
  text-align: left;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}
.coll-btn:hover .ttl {
  color: var(--accent);
}
.ttl {
  grid-area: ttl;
  min-width: 0;
}
.sum {
  grid-area: sum;
  justify-self: start;
  max-width: 100%;
  font-family: var(--font-num);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--surface-2);
  border-radius: 99px;
  padding: 2px 10px;
  overflow-wrap: anywhere;
}
.chev {
  grid-area: chev;
  width: 18px;
  height: 18px;
  flex: none;
  color: var(--ink-3);
}
.open .chev {
  transform: rotate(180deg);
}
.coll-body {
  display: grid;
  grid-template-rows: 1fr;
}
.coll:not(.open) .coll-body {
  grid-template-rows: 0fr;
}
.coll-inner {
  min-height: 0;
  overflow: hidden;
  /* ruang kecil agar garis fokus input tidak terpotong */
  padding: 3px;
  margin: -3px;
}
.coll:not(.open) .coll-inner {
  visibility: hidden;
}
@media (prefers-reduced-motion: no-preference) {
  .coll-body {
    transition: grid-template-rows 0.22s ease;
  }
  .coll-inner {
    transition: visibility 0.22s;
  }
  .chev {
    transition: transform 0.2s ease;
  }
}
</style>
