<script setup>
/**
 * Input angka berformat Indonesia.
 *  kind="rp"  : rupiah tanpa desimal, titik ribuan saat diketik
 *  kind="num" : angka dengan maksimal 2 desimal (luas, umur)
 *  kind="pct" : persen, menerima koma atau titik sebagai desimal
 * v-model berisi Number atau null (kosong).
 */
import { ref, watch } from 'vue';
import { fmtInt, fmtDec, parseId, parsePct } from '@/core/format.js';
import { liveFormat } from '@/utils/liveFormat.js';

const props = defineProps({
  modelValue: { type: Number, default: null },
  kind: { type: String, default: 'num' },
  id: { type: String, default: undefined },
  label: { type: String, default: undefined },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  placeholder: { type: String, default: '0' },
  disabled: Boolean,
  compact: Boolean
});
const emit = defineEmits(['update:modelValue']);

function show(v) {
  if (v == null || Number.isNaN(v)) return '';
  if (props.kind === 'rp') return fmtInt(v);
  if (props.kind === 'pct') return fmtDec(v, 0, 4);
  return fmtDec(v, 0, 2);
}

const focused = ref(false);
const display = ref(show(props.modelValue));

watch(() => props.modelValue, (v) => {
  if (!focused.value) display.value = show(v);
});

function onInput(e) {
  const el = e.target;
  if (props.kind === 'pct') {
    display.value = el.value;
    emit('update:modelValue', parsePct(el.value));
    return;
  }
  display.value = liveFormat(el, props.kind === 'num' ? 2 : 0);
  emit('update:modelValue', parseId(display.value));
}

function onBlur() {
  focused.value = false;
  display.value = show(props.modelValue);
}
</script>

<template>
  <div class="aff" :class="{ compact }">
    <i v-if="prefix">{{ prefix }}</i>
    <input
      :id="id"
      :value="display"
      :aria-label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :inputmode="kind === 'rp' ? 'numeric' : 'decimal'"
      autocomplete="off"
      @focus="focused = true"
      @blur="onBlur"
      @input="onInput"
    />
    <i v-if="suffix">{{ suffix }}</i>
  </div>
</template>
