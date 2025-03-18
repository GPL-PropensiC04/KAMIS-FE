<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

// Props untuk nilai input
const props = defineProps({
    modelValue: {
        type: String,
        required: false,
        default: "",
    },
    placeholder: {
        type: String,
        required: false,
        default: "",
    },
});

// Emit untuk memperbarui modelValue di parent
const emit = defineEmits(["update:modelValue"]);

// Bind nilai input
const textValue = ref(props.modelValue);

// Watch perubahan & emit ke parent
const updateValue = () => {
    emit("update:modelValue", textValue.value);
};

// Focus input saat diklik div
const inputRef = ref<HTMLInputElement | null>(null);
const focusInput = () => {
    inputRef.value?.focus();
};
</script>

<template>
    <div class="relative w-full max-w-lg font-inter">
        <!-- Textbox -->
        <div 
            class="border px-4 py-3 cursor-text text-lg relative"
            :class="{ 'border-[#1E3A5F] bg-[#E5EAF2] text-black rounded-md': true }"
            @click="focusInput"
        >
            <input
                ref="inputRef"
                v-model="textValue"
                :placeholder="placeholder"
                class="w-full bg-transparent focus:outline-none"
                @input="updateValue"
            />
        </div>
    </div>
</template>

<style scoped>
/* Menggunakan font Inter */
.font-inter {
    font-family: 'Inter', sans-serif;
}
</style>
