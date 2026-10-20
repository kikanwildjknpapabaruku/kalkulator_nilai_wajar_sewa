<script setup>
/** Label kolom isian dengan tanda tanya penjelasan istilah (opsional) di sebelahnya */
import HelpTip from './HelpTip.vue';

defineProps({
  for: { type: String, default: undefined },
  text: { type: String, required: true },
  term: { type: String, default: '' }
});
</script>

<template>
  <div class="hl">
    <label class="fl" :for="$props.for">{{ text }}</label>
    <HelpTip v-if="term" :term="term" />
  </div>
</template>

<style scoped>
.fl {
  font-size: 12.5px;
  color: var(--ink-2);
  font-weight: 500;
}
</style>
