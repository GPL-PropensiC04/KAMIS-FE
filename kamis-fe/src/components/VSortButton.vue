<script setup lang="ts">
import { ref, defineEmits } from "vue";

// State sorting (true = Descending, false = Ascending)
const isDescending = ref(false);

// Emit event ke parent
const emit = defineEmits(["update:sortOrder"]);

// Toggle sorting
const toggleSort = () => {
  isDescending.value = !isDescending.value;
  emit("update:sortOrder", isDescending.value);
};
</script>

<template>
  <button
    @click="toggleSort"
    class="rounded-md hover:bg-gray-200 transition"
  >
    <svg v-if="isDescending" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7-7m0 0L5 9m7-7v18" />
    </svg>
    <svg v-else  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7 7m0 0l7-7m-7 7V3" />
    </svg>
  </button>
</template>

<style scoped>
/* Styling untuk efek hover */
button {
  transition: all 0.2s ease-in-out;
}
</style>