<script setup lang="ts">
import { defineProps } from "vue";

defineProps({
  value: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
  },
});
</script>

<template>
  <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
    {{ value || placeholder }}
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>