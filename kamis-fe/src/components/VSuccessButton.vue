<script setup>
import { defineProps } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "button",
  },
});
</script>

<template>
  <button
    :type="type"
    class="bg-[#2D6A4F] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:bg-[#245C40] active:scale-95"
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