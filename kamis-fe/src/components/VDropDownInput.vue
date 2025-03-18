<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  options: {
    type: Array as () => Array<string>,
    required: true,
  },
  modelValue: {
    type: String,
    required: false,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: string) => {
  emit("update:modelValue", option);
  isOpen.value = false;
};
</script>

<template>
  <div class="relative w-full max-w-md font-inter">
    <!-- Input Field -->
    <div 
      class="flex items-center justify-between border px-4 py-2 cursor-pointer"
      :class="{
        'border-[#1E3A5F] bg-[#E5EAF2] text-black rounded-md': true, 
      }"
      @click="toggleDropdown"
    >
      <span>
        {{ modelValue || "Select an option..." }}
      </span>
      <!-- Tailwind CSS Heroicons Chevron Down -->
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 9l-7.5 7.5L4.5 9" />
      </svg>
    </div>

    <!-- Dropdown List -->
    <ul 
      v-if="isOpen" 
      class="absolute left-0 mt-2 w-full border border-[#1E3A5F] bg-[#E5EAF2] rounded-md shadow-lg z-10"
    >
      <li 
        v-for="option in props.options" 
        :key="option.toString()" 
        class="px-4 py-2 hover:bg-[#1E3A5F] hover:text-white cursor-pointer"
        @click="selectOption(option.toString())"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
