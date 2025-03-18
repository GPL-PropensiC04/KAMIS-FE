<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

// Props untuk menerima nilai input dari parent
const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: "",
  },
  placeholder: {
    type: String,
    required: false,
    default: "Search",
  },
});

// Emit perubahan ke parent
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="relative w-full max-w-md">
    <!-- Input Field -->
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      class="w-full pl-10 pr-4 py-2 text-gray-700 bg-[#E5EAF2] border border-[#1E3A5F] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
      @input="(event) => emit('update:modelValue', (event.target as HTMLInputElement).value)"
    />

    <!-- Icon Search -->
    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 1 0-12 0 6 6 0 0 0 12 0z" />
      </svg>
    </span>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  font-family: 'Inter', sans-serif;
}
</style>
