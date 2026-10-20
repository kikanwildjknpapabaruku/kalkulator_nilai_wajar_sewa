<script setup>
/** Pilihan tunggal bergaya tombol bersambung. options: [{ value, label }] */
defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, required: true },
  name: { type: String, required: true },
  label: { type: String, default: undefined }
});
defineEmits(['update:modelValue']);
</script>

<template>
  <div class="seg" role="radiogroup" :aria-label="label">
    <label v-for="o in options" :key="o.value">
      <input type="radio" :name="name" :value="o.value" :checked="modelValue === o.value" @change="$emit('update:modelValue', o.value)" />
      <span>{{ o.label }}</span>
    </label>
  </div>
</template>
