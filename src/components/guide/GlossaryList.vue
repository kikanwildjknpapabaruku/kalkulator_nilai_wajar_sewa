<script setup>
/**
 * Daftar istilah: bisa dicari, disaring per kelompok, dan tiap istilah bisa dibuka untuk
 * penjelasan lengkap. Tanda tanya (?) di form membuka istilah yang bersangkutan lewat
 * store.ui.glossaryTerm.
 */
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { store } from '@/state/store.js';
import { setOpen, isOpen } from '@/state/ui.js';
import { GLOSSARY, GLOSSARY_GROUPS, TERM_BY_ID } from '@/content/glossary.js';
import Icon from '@/components/common/Icon.vue';

const SECTION_ID = 'guide-istilah';
const query = ref('');
const group = ref('semua');
const opened = reactive({});
const flash = ref('');

const norm = (s) => String(s || '').toLowerCase();
const matches = (t, q) =>
  !q || [t.term, t.alias, t.short, ...t.body, t.formula, t.example].some((x) => norm(x).includes(q));

const groups = computed(() => {
  const q = norm(query.value).trim();
  return GLOSSARY_GROUPS.filter((g) => group.value === 'semua' || group.value === g.id)
    .map((g) => ({ ...g, items: GLOSSARY.filter((t) => t.group === g.id && matches(t, q)) }))
    .filter((g) => g.items.length);
});
const count = computed(() => groups.value.reduce((n, g) => n + g.items.length, 0));
const filtered = computed(() => query.value.trim() !== '' || group.value !== 'semua');

function toggle(id) {
  opened[id] = !opened[id];
}
function setAll(v) {
  groups.value.forEach((g) => g.items.forEach((t) => { opened[t.id] = v; }));
}
function reset() {
  query.value = '';
  group.value = 'semua';
}

/** Buka satu istilah, pastikan terlihat (kosongkan saringan), lalu gulir ke sana */
async function jump(id) {
  if (!TERM_BY_ID[id]) return;
  const wasClosed = !isOpen(SECTION_ID);
  setOpen([SECTION_ID], true);
  reset();
  opened[id] = true;
  await nextTick();
  setTimeout(() => {
    const el = document.getElementById(`term-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    flash.value = id;
    setTimeout(() => { if (flash.value === id) flash.value = ''; }, 1800);
  }, wasClosed ? 260 : 40);
}

watch(
  () => store.ui.glossaryTerm,
  (id) => {
    if (!id) return;
    store.ui.glossaryTerm = null;
    jump(id);
  },
  { flush: 'post', immediate: true }
);
</script>

<template>
  <div class="gl">
    <div class="tools">
      <div class="field search">
        <label for="gl-q" class="visually-hidden">Cari istilah</label>
        <input id="gl-q" v-model="query" class="input" type="search" placeholder="Cari istilah, misalnya risk free atau recapture" autocomplete="off" />
      </div>
      <div class="pills" role="group" aria-label="Kelompok istilah">
        <button type="button" class="pill" :aria-pressed="group === 'semua'" @click="group = 'semua'">Semua</button>
        <button v-for="g in GLOSSARY_GROUPS" :key="g.id" type="button" class="pill" :aria-pressed="group === g.id" @click="group = g.id">
          {{ g.label }}
        </button>
      </div>
      <div class="meta">
        <span class="hint" aria-live="polite">{{ filtered ? `${count} dari ${GLOSSARY.length} istilah` : `${GLOSSARY.length} istilah` }}</span>
        <span class="acts">
          <button type="button" class="lnk" @click="setAll(true)">Buka semua penjelasan</button>
          <span aria-hidden="true">·</span>
          <button type="button" class="lnk" @click="setAll(false)">Tutup semua</button>
        </span>
      </div>
    </div>

    <p v-if="!count" class="empty">
      Tidak ada istilah yang cocok. <button type="button" class="lnk" @click="reset">Tampilkan semua istilah</button>
    </p>

    <section v-for="g in groups" :key="g.id" class="grp" :aria-label="g.label">
      <p class="eyebrow">{{ g.label }}</p>
      <article v-for="t in g.items" :id="`term-${t.id}`" :key="t.id" class="term" :class="{ open: opened[t.id], flash: flash === t.id }">
        <h3>
          <button :id="`term-${t.id}-h`" type="button" :aria-expanded="!!opened[t.id]" :aria-controls="`term-${t.id}-b`" @click="toggle(t.id)">
            <span class="name">{{ t.term }}<span v-if="t.alias" class="alias"> · {{ t.alias }}</span></span>
            <Icon name="chevron" class="chev" />
          </button>
        </h3>
        <p class="short">{{ t.short }}</p>
        <div v-show="opened[t.id]" :id="`term-${t.id}-b`" class="more" role="region" :aria-labelledby="`term-${t.id}-h`">
          <p v-for="(para, i) in t.body" :key="i">{{ para }}</p>
          <div v-if="t.formula" class="formula"><span class="tag">Rumus</span>{{ t.formula }}</div>
          <div v-if="t.example" class="example"><span class="tag">Contoh</span>{{ t.example }}</div>
          <p v-if="t.related?.length" class="rel">
            <span class="tag">Lihat juga</span>
            <button v-for="r in t.related" :key="r" type="button" class="chip link" @click="jump(r)">{{ TERM_BY_ID[r].term }}</button>
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.tools {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}
.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pill {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink-2);
  border-radius: 99px;
  padding: 3px 12px;
  font-size: 12.5px;
  font-weight: 500;
}
.pill:hover {
  background: var(--surface-2);
}
.pill[aria-pressed='true'] {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-ink);
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
}
.acts {
  display: flex;
  gap: 6px;
  align-items: center;
  color: var(--ink-3);
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
.lnk:hover {
  background: var(--accent-soft);
}
.grp {
  margin-top: 16px;
}
.grp > .eyebrow {
  margin-bottom: 6px;
}
.term {
  border: 1px solid var(--line-2);
  border-radius: var(--radius-sm);
  padding: 2px 12px 10px;
  margin-top: 8px;
  scroll-margin-top: 12px;
}
.term.flash {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}
h3 {
  font-size: 14px;
  font-weight: 600;
}
h3 button {
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
  padding: 8px 0 4px;
  color: var(--ink);
}
h3 button:hover .name {
  color: var(--accent);
}
.alias {
  font-weight: 400;
  color: var(--ink-3);
  font-size: 12.5px;
}
.chev {
  width: 18px;
  height: 18px;
  color: var(--ink-3);
}
.open .chev {
  transform: rotate(180deg);
}
.short {
  color: var(--ink-2);
}
.more {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--line-2);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.more p {
  margin: 0;
}
.formula,
.example {
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 12.5px;
  overflow-wrap: anywhere;
}
.formula {
  background: var(--surface-2);
  font-family: var(--font-num);
}
.example {
  background: var(--accent-soft);
}
.tag {
  display: block;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-3);
  margin-bottom: 2px;
}
.rel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.rel .tag {
  margin: 0 4px 0 0;
}
.chip.link {
  cursor: pointer;
  color: var(--accent);
  background: var(--surface);
}
.chip.link:hover {
  background: var(--accent-soft);
}
@media (prefers-reduced-motion: no-preference) {
  .chev {
    transition: transform 0.2s ease;
  }
  .term {
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }
}
</style>
