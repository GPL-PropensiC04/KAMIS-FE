<script setup>
import { ref, defineProps, defineEmits, computed } from "vue";

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
const increment = () => {
  if (props.modelValue < props.max) {
    emit("update:modelValue", props.modelValue + 1);
  }
};

// Fungsi untuk mengurangi angka
const decrement = () => {
  if (props.modelValue > props.min) {
    emit("update:modelValue", props.modelValue - 1);
  }
};

// Fungsi untuk menangani input manual dan memastikan hanya angka yang valid
const updateValue = (event) => {
  let rawValue = event.target.value.replace(/[^0-9]/g, ""); // Hanya angka
  let numericValue = rawValue ? parseInt(rawValue, 10) : 0;

  // Pastikan tidak melewati batas min/max
  if (numericValue < props.min) numericValue = props.min;
  if (numericValue > props.max) numericValue = props.max;

  emit("update:modelValue", numericValue);
};
</script>

<template>
  <div class="relative w-full">
    <div 
      class="flex items-center border border-[#1E3A5F] rounded-md bg-[#E5EAF2] text-black px-3 py-2"
    >
      <input 
        type="text" 
        :value="modelValue" 
        @input="updateValue"
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
