<script setup lang="ts">
import { defineProps, type PropType } from "vue";

const emit = defineEmits(["click"]);

defineProps({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<'button' | 'submit' | 'reset'>,
    default: "button",
  },
});
</script>

<template>
  <button
    :type="type"
    class="bg-[#2D6A4F] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:bg-[#245C40] active:scale-95"
    @click="emit('click')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
/* Menggunakan font Inter */
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>