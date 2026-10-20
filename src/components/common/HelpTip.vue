<script setup>
/**
 * Tombol tanda tanya kecil. Bila diklik, penjelasan singkat istilah muncul tepat di bawahnya
 * (bukan melayang, supaya tidak terpotong kartu yang bisa dibuka-tutup). Dari sana pengguna
 * bisa lanjut ke penjelasan lengkap di tab Petunjuk.
 *
 * Dua cara pasang:
 *  - di akhir teks paragraf: <p>Teks ... <HelpTip inline term="risk-free" /></p>
 *  - di sebelah judul/label pendek, dalam wadah `.hl` (flex, wrap):
 *      <div class="hl"><h3>Bangunan</h3><HelpTip term="nilai-bangunan" /></div>
 */
import { ref, computed } from 'vue';
import { TERM_BY_ID } from '@/content/glossary.js';
import { openGlossary } from '@/state/store.js';

const props = defineProps({
  term: { type: String, required: true },
  // inline: tombol ikut mengalir di akhir teks paragraf; penjelasan muncul sebagai blok di bawahnya
  inline: { type: Boolean, default: false }
});

const open = ref(false);
const entry = computed(() => TERM_BY_ID[props.term]);
const uid = `ht-${Math.random().toString(36).slice(2, 8)}`;
</script>

<template>
  <span v-if="entry" class="ht" :class="{ inl: inline }">
    <button
      type="button"
      class="ht-btn"
      :aria-expanded="open"
      :aria-controls="uid"
      :aria-label="`Apa itu ${entry.term}?`"
      @click="open = !open"
      @keydown.esc="open = false"
    >
      ?
    </button>
    <span v-if="open" :id="uid" class="ht-pop" role="note">
      <b>{{ entry.term }}.</b> {{ entry.short }}
      <button type="button" class="ht-more" @click="openGlossary(term)">Baca penjelasan lengkap</button>
    </span>
  </span>
</template>

<style scoped>
.ht {
  display: contents;
}
.ht-btn {
  flex: none;
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--ink-2);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ht-btn:hover,
.ht-btn[aria-expanded='true'] {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
.ht.inl {
  display: inline;
}
.ht.inl .ht-btn {
  display: inline-flex;
  vertical-align: -4px;
  margin-left: 4px;
}
.ht.inl .ht-btn:first-child {
  margin-left: 2px;
}
.ht.inl .ht-pop {
  display: block;
  margin: 6px 0 2px;
  order: 0;
  flex: none;
}
.ht-pop {
  order: 1; /* penjelasan selalu di bawah semua tombol (?) pada baris yang sama */
  flex: 1 0 100%;
  display: block;
  font-size: 12.5px;
  line-height: 1.5;
  font-weight: 400;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  text-transform: none;
  letter-spacing: 0;
  font-style: normal;
}
.ht-more {
  display: inline;
  border: 0;
  background: none;
  padding: 0;
  margin-left: 4px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
