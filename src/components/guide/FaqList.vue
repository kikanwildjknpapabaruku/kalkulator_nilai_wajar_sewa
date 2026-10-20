<script setup>
/** Tanya jawab. Status buka-tutup hanya berlaku selama halaman terbuka. */
import { reactive } from 'vue';
import { FAQ } from '@/content/guide.js';
import Icon from '@/components/common/Icon.vue';

const open = reactive({});
const toggle = (id) => {
  open[id] = !open[id];
};
</script>

<template>
  <ul class="faq">
    <li v-for="f in FAQ" :key="f.id" :class="{ open: open[f.id] }">
      <h3>
        <button :id="`${f.id}-h`" type="button" :aria-expanded="!!open[f.id]" :aria-controls="`${f.id}-b`" @click="toggle(f.id)">
          <span>{{ f.q }}</span>
          <Icon name="chevron" class="chev" />
        </button>
      </h3>
      <p v-show="open[f.id]" :id="`${f.id}-b`" role="region" :aria-labelledby="`${f.id}-h`">{{ f.a }}</p>
    </li>
  </ul>
</template>

<style scoped>
.faq {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  border: 1px solid var(--line-2);
  border-radius: var(--radius-sm);
}
li + li {
  border-top: 1px solid var(--line-2);
}
h3 {
  font-size: 13.5px;
  font-weight: 600;
}
button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18px;
  gap: 10px;
  align-items: center;
  width: 100%;
  border: 0;
  background: none;
  text-align: left;
  font: inherit;
  font-weight: 600;
  padding: 10px 12px;
  color: var(--ink);
}
button:hover {
  background: var(--surface-3);
}
.chev {
  width: 18px;
  height: 18px;
  color: var(--ink-3);
}
.open .chev {
  transform: rotate(180deg);
}
p {
  padding: 0 12px 12px;
  color: var(--ink-2);
}
@media (prefers-reduced-motion: no-preference) {
  .chev {
    transition: transform 0.2s ease;
  }
}
</style>
