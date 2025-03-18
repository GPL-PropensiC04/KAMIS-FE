<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    label: {
        type: String,
        default: "Batal", // Default teks tombol
    }
});

const emit = defineEmits(["click"]);
</script>

<template>
    <button 
        class="bg-[#F04438] text-white px-6 py-2 rounded-md font-inter font-medium text-center transition hover:bg-[#245C40] active:scale-95"
        @click="emit('click')"
    >
        {{ label }}
    </button>
</template>

<style scoped>
/* Menggunakan font Inter agar seragam */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

.font-inter {
    font-family: 'Inter', sans-serif;
}
</style>
