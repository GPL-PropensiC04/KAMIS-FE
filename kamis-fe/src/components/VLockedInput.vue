<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  value: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="bg-[#8BA3BE] flex items-center justify-between border text-white px-4 py-2 rounded-md h-[45px] font-semibold">
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