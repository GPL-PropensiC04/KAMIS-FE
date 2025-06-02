<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0, // Harga minimal default adalah 0
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY, // Tidak ada batas maksimal secara default
  },
  step: {
    type: Number,
    default: 100000, // Penambahan default sebesar 100.000
  },
});

const emit = defineEmits(["update:modelValue"]);

// Fungsi untuk menangani input manual dan memastikan hanya angka yang valid
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  
  // Immediately replace any non-numeric characters
  const rawValue = target.value.replace(/[^0-9]/g, "");
  
  // If user entered non-numeric characters, update the input value to only contain numbers
  if (target.value !== rawValue) {
    target.value = rawValue;
  }
  
  let numericValue = rawValue ? parseInt(rawValue, 10) : 0;

  // Pastikan tidak melewati batas min/max
  if (numericValue < props.min) numericValue = props.min;
  if (numericValue > props.max) numericValue = props.max;

  emit("update:modelValue", numericValue);
};

// Fungsi untuk menambah harga dengan kelipatan `step`
const increment = (e: MouseEvent) => {
  // Prevent default to avoid form submission
  e.preventDefault();
  
  const newValue = props.modelValue + props.step;
  if (newValue <= props.max) {
    emit("update:modelValue", newValue);
  }
};

// Fungsi untuk mengurangi harga dengan kelipatan `step`
const decrement = (e: MouseEvent) => {
  // Prevent default to avoid form submission
  e.preventDefault();
  
  const newValue = props.modelValue - props.step;
  if (newValue >= props.min) {
    emit("update:modelValue", newValue);
  }
};

// Handle keyboard events to prevent form submission when arrow keys are pressed
// and block non-numeric key input
const handleKeyDown = (event: KeyboardEvent) => {
  // Allow: backspace, delete, tab, escape, enter, ctrl+A, home, end, left, right
  const allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'
  ];
  
  // Also allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X for copy-paste operations
  if (
    (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) ||
    allowedKeys.includes(event.key)
  ) {
    // Allow these keys
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent form submission on Enter
    }
    return;
  }

  // Handle arrow up/down for increment/decrement with step value
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    
    if (event.key === 'ArrowUp') {
      const newValue = props.modelValue + props.step;
      if (newValue <= props.max) {
        emit("update:modelValue", newValue);
      }
    } else if (event.key === 'ArrowDown') {
      const newValue = props.modelValue - props.step;
      if (newValue >= props.min) {
        emit("update:modelValue", newValue);
      }
    }
    return;
  }

  // Block if not a number key (0-9)
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
};

// Format price with thousand separators for display
const formatPrice = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>

<template>
  <div class="relative w-full">
    <div class="flex items-center justify-between border border-gray-300 bg-[#ffffff] text-black px-4 py-2 rounded-md h-[45px]">
      <span class="text-black">Rp</span>
      <input
        type="text"
        :value="formatPrice(modelValue)"
        @input="updateValue"
        @keydown="handleKeyDown"
        class="w-full text-black bg-transparent border-none outline-none text-right px-2"
      />
      <div class="flex flex-col">
        <button @click="increment" class="p-1 hover:opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7-7-7 7" />
          </svg>
        </button>
        <button @click="decrement" class="p-1 hover:opacity-70">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7 7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter agar seragam */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
