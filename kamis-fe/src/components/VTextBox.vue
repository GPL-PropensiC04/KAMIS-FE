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
    <div class="relative w-full max-w-full font-inter">
        <!-- Textbox 1 baris -->
        <div
            @click="focusInput"
        >
            <input 
                ref="inputRef"
                v-model="textValue"
                :placeholder="placeholder"
                type="text"
                class="w-full border text-gray-800 placeholder-gray-500 border-gray-300 px-4 py-3 rounded-lg bg-white font-lato"
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