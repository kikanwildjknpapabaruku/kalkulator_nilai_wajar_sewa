<script setup>
import { result } from '@/state/store.js';
</script>

<template>
  <div v-if="result.warnings.length" class="chips" role="status" aria-live="polite">
    <span v-for="(w, i) in result.warnings" :key="i" class="chip" :class="w.level">{{ w.text }}</span>
  </div>
</template>
