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
    class="bg-[#1E3A5F] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:bg-[#172D4E] active:scale-95"
  >
    {{ label }}
  </button>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
