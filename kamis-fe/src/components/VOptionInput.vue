<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  options: {
    type: Array as () => Array<string>,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const selectOption = (option: string) => {
  emit("update:modelValue", option);
};
</script>

<template>
  <div class="flex border border-[#1E3A5F] rounded-md overflow-hidden font-inter h-[45px]">
    <button
      v-for="option in props.options"
      :key="option.toString()"
      class="flex-1 py-2 px-4 text-center font-semibold transition-colors"
      :class="[
        modelValue === option
          ? 'bg-[#1E3A5F] text-white'
          : 'bg-[#ffffff] text-[#1E3A5F]',
      ]"
      @click="selectOption(option.toString())"
    >
      {{ option }}
    </button>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
.font-inter {
  font-family: 'Inter', sans-serif;
}
</style>
