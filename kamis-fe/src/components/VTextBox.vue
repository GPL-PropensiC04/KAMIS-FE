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
            @click="focusInput"
        >
            <textarea 
                ref="inputRef"
                v-model="textValue"
                :placeholder="placeholder"
                class="w-full border border-[#1E3A5F] p-2 rounded-md bg-[#ffffff] font-lato"
                rows="4"
                @input="updateValue"
            ></textarea>
        </div>
    </div>
</template>

<style scoped>
/* Menggunakan font Inter */
.font-inter {
    font-family: 'Inter', sans-serif;
}

textarea {
    resize: none;
}
</style>
