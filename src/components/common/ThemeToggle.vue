<script setup>
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme.js';
import Icon from './Icon.vue';

const { theme, toggle } = useTheme();
const dark = computed(() => theme.value === 'dark');
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    role="switch"
    aria-label="Mode gelap"
    :aria-checked="dark"
    :title="dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'"
    @click="toggle"
  >
    <span class="track" aria-hidden="true">
      <span class="thumb"><Icon :name="dark ? 'moon' : 'sun'" /></span>
    </span>
    <span class="txt">{{ dark ? 'Mode gelap' : 'Mode terang' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--line);
  background: var(--surface);
  border-radius: 99px;
  padding: 4px 12px 4px 4px;
  font-weight: 500;
  font-size: 13px;
  color: var(--ink-2);
}
.theme-toggle:hover {
  background: var(--surface-2);
}
.track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 99px;
  background: var(--surface-2);
  border: 1px solid var(--line);
  flex: none;
}
.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb svg {
  width: 12px;
  height: 12px;
}
[aria-checked='true'] .thumb {
  transform: translateX(20px);
}
@media (prefers-reduced-motion: no-preference) {
  .thumb {
    transition: transform 0.2s ease;
  }
}
@media (max-width: 560px) {
  .txt {
    display: none;
  }
  .theme-toggle {
    padding-right: 4px;
  }
}
</style>
