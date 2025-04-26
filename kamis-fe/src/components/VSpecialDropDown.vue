<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

interface OptionItem {
  label: string;
  value: string;
}

const props = defineProps({
  options: {
    type: Array as () => Array<OptionItem>,
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

const selectOption = (optionValue: string) => {
  emit("update:modelValue", optionValue);
  isOpen.value = false;
};

// Cari label berdasarkan value (biar yang tampil nama supplier)
const selectedLabel = () => {
  const found = props.options.find(opt => opt.value === props.modelValue);
  return found ? found.label : "Select an option...";
};
</script>

<template>
  <div class="relative w-full max-w-md font-inter">
    <!-- Input Field -->
    <div 
      class="flex items-center justify-between border border-[#1E3A5F] bg-[#E5EAF2] text-black px-4 py-2 rounded-md h-[45px]"
      @click="toggleDropdown"
    >
      <span>
        {{ selectedLabel() }}
      </span>
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
        :key="option.value" 
        class="px-4 py-2 hover:bg-[#1E3A5F] hover:text-white cursor-pointer"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
