<script setup>
/** Tab Petunjuk: cara pakai, alur perhitungan, cara membaca hasil, tanya jawab, dan daftar istilah */
import { ref, computed, onBeforeUnmount } from 'vue';
import { store, result, setTab, loadExample } from '@/state/store.js';
import { GROUPS, setOpen } from '@/state/ui.js';
import { INTRO, READING } from '@/content/guide.js';
import { GLOSSARY } from '@/content/glossary.js';
import CollapsibleSection from '@/components/common/CollapsibleSection.vue';
import ExpandControls from '@/components/common/ExpandControls.vue';
import Icon from '@/components/common/Icon.vue';
import StepList from './StepList.vue';
import FlowDiagram from './FlowDiagram.vue';
import FaqList from './FaqList.vue';
import GlossaryList from './GlossaryList.vue';

const TAB_LABEL = { sewa: 'Sewa (DCF)', tanah: 'Nilai tanah' };
const backLabel = computed(() => TAB_LABEL[store.ui.returnTab] || '');

// Memuat contoh mengganti data pengguna, jadi minta klik kedua bila sudah ada isian sendiri
const hasOwnData = computed(() => !store.data.example && (store.data.nama || store.data.nilaiLangsung || store.data.luas || result.value.value > 0));
const armed = ref(false);
let timer;
function tryExample() {
  if (hasOwnData.value && !armed.value) {
    armed.value = true;
    timer = setTimeout(() => { armed.value = false; }, 3500);
    return;
  }
  clearTimeout(timer);
  armed.value = false;
  loadExample();
  setTab('sewa');
}
onBeforeUnmount(() => clearTimeout(timer));

function toGlossary() {
  setOpen(['guide-istilah'], true);
  setTimeout(() => document.getElementById('guide-istilah-head')?.closest('.coll')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}
</script>

<template>
  <div class="guide">
    <div v-if="store.ui.returnTab" class="back">
      <button type="button" class="btn sm" @click="setTab(store.ui.returnTab)">← Kembali ke {{ backLabel }}</button>
    </div>

    <section class="card intro" aria-labelledby="g-h">
      <p class="eyebrow">Petunjuk penggunaan</p>
      <h2 id="g-h">Apa yang dilakukan aplikasi ini</h2>
      <p v-for="(p, i) in INTRO" :key="i" class="para">{{ p }}</p>
      <div class="acts">
        <button type="button" class="btn primary" :class="{ danger: armed }" @click="tryExample">
          <Icon name="book" />{{ armed ? 'Klik lagi untuk mengganti data Anda dengan contoh' : 'Coba dengan data contoh' }}
        </button>
        <button type="button" class="btn" @click="toGlossary">Lihat daftar istilah ({{ GLOSSARY.length }})</button>
      </div>
    </section>

    <ExpandControls :ids="GROUPS.petunjuk" label="Bagian petunjuk" :defaults="{ 'guide-baca': false, 'guide-faq': false }" />

    <CollapsibleSection id="guide-cara" title="Cara memakai, langkah demi langkah" summary="7 langkah">
      <StepList />
    </CollapsibleSection>

    <CollapsibleSection id="guide-alur" title="Alur perhitungan dengan contoh angka" summary="5 langkah dari nilai properti sampai nilai wajar sewa">
      <FlowDiagram />
    </CollapsibleSection>

    <CollapsibleSection id="guide-baca" title="Cara membaca hasil" summary="Kotak nilai, tabel, rincian, peringatan" :default-open="false">
      <dl class="read">
        <div v-for="r in READING" :key="r.t">
          <dt>{{ r.t }}</dt>
          <dd>{{ r.d }}</dd>
        </div>
      </dl>
    </CollapsibleSection>

    <CollapsibleSection id="guide-faq" title="Pertanyaan yang sering muncul" summary="Penyimpanan data, pembulatan, bobot tanah" :default-open="false">
      <FaqList />
    </CollapsibleSection>

    <CollapsibleSection id="guide-istilah" title="Daftar istilah" :summary="`${GLOSSARY.length} istilah, bisa dicari`">
      <GlossaryList />
    </CollapsibleSection>
  </div>
</template>

<style scoped>
.guide {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 900px;
  width: 100%;
  margin-inline: auto;
}
.intro h2 {
  font-size: 18px;
  margin-top: 2px;
}
.para {
  color: var(--ink-2);
  margin-top: 8px;
  max-width: 70ch;
}
.acts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.acts .btn {
  white-space: normal;
  text-align: left;
}
.read {
  margin: 12px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
dt {
  font-weight: 600;
  font-size: 13.5px;
}
dd {
  margin: 2px 0 0;
  color: var(--ink-2);
}
</style>
