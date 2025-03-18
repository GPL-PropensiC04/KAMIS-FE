<script setup>
import { defineProps } from "vue";

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="bg-[#8BA3BE] text-white font-inter text-lg font-semibold px-4 py-3 rounded-md w-full">
    {{ value }}
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>