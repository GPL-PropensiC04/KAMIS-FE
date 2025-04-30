<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ start: "", end: "" }),
  },
});

// Emit perubahan ke parent
const emit = defineEmits(["update:modelValue"]);

// Fungsi untuk mengubah format tanggal ke "dd-MM-yyyy"
const formatDate = (date: Date | null) => {
  if (!date) return "";
  return date.toISOString().split("T")[0].split("-").reverse().join("-");
};

// Fungsi untuk memperbarui nilai tanggal dengan format yang diinginkan
const updateDate = (field: "start" | "end", value: Date | null) => {
  const formattedDate = formatDate(value);
  emit("update:modelValue", { ...props.modelValue, [field]: formattedDate });
};
</script>

<template>
  <div class="flex items-center space-x-1 rounded-md w-full max-w-lg h-[45px]">
    <!-- Tanggal Mulai -->
    <div class="relative w-full">
      <Datepicker 
        :model-value="props.modelValue.start ? new Date(props.modelValue.start.split('-').reverse().join('-')) : null"
        @update:modelValue="(value: Date) => updateDate('start', value)"
        format="dd/MM/yyyy"
        placeholder="Tanggal Mulai"
        class="w-full"
        :auto-apply="true"
      />
    </div>

    <span class="text-gray-600">-</span>

    <!-- Tanggal Akhir -->
    <div class="relative w-full">
      <Datepicker 
        :model-value="props.modelValue.end ? new Date(props.modelValue.end.split('-').reverse().join('-')) : null"
        @update:modelValue="(value: Date) => updateDate('end', value)"
        format="dd/MM/yyyy"
        placeholder="Tanggal Akhir"
        class="w-full"
        :auto-apply="true"
      />
    </div>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

:deep(.dp__input) {
  background-color: #E5EAF2 !important;
  color: black;
  border: 1px solid #1E3A5F;
  border-radius: 6px;
  height: 45px;
}
</style>
