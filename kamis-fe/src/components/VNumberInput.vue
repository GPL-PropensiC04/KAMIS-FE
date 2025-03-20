<script setup lang="ts">
import {defineProps, defineEmits} from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: Number.NEGATIVE_INFINITY, // Tidak ada batas minimal secara default
  },
  max: {
    type: Number,
    default: Number.POSITIVE_INFINITY, // Tidak ada batas maksimal secara default
  },
});

const emit = defineEmits(["update:modelValue"]);

// Fungsi untuk menambah angka
const increment = (e: MouseEvent) => {
  // Prevent default to avoid form submission
  e.preventDefault();
  
  if (props.modelValue < props.max) {
    emit("update:modelValue", props.modelValue + 1);
  }
};

// Fungsi untuk mengurangi angka
const decrement = (e: MouseEvent) => {
  // Prevent default to avoid form submission
  e.preventDefault();
  
  if (props.modelValue > props.min) {
    emit("update:modelValue", props.modelValue - 1);
  }
};

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

  // Handle arrow up/down for increment/decrement
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    
    if (event.key === 'ArrowUp') {
      if (props.modelValue < props.max) {
        emit("update:modelValue", props.modelValue + 1);
      }
    } else if (event.key === 'ArrowDown') {
      if (props.modelValue > props.min) {
        emit("update:modelValue", props.modelValue - 1);
      }
    }
    return;
  }

  // Block if not a number key (0-9)
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
};

// Format number with thousand separators for display
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
</script>

<template>
  <div class="relative w-full">
    <div 
      class="flex items-center justify-between border border-[#1E3A5F] bg-[#E5EAF2] text-black px-4 py-2 rounded-md h-[45px]"
    >
      <input 
        type="text" 
        :value="formatNumber(modelValue)" 
        @input="updateValue"
        @keydown="handleKeyDown"
        class="w-full text-black bg-transparent border-none outline-none px-2"
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
