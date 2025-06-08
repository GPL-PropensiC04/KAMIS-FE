<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

// Props untuk nilai textarea
const props = defineProps({
    modelValue: {
        type: String,
        required: false,
        default: "",
    },
});

// Emit untuk memperbarui modelValue di parent
const emit = defineEmits(["update:modelValue"]);

// Bind nilai textarea
const textValue = ref(props.modelValue);

// Watch perubahan & emit ke parent
const updateValue = () => {
    emit("update:modelValue", textValue.value);
};

// Focus textarea saat diklik div
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const focusTextarea = () => {
    textareaRef.value?.focus();
};
</script>

<template>
    <div class="relative w-full max-w-full font-inter">
        <!-- Textarea -->
        <div 
            class="border px-4 py-2 cursor-text relative"
            :class="{ 'border-[#1E3A5F] bg-[#ffffff] text-black rounded-md': true }"
            @click="focusTextarea"
        >
            <textarea
                ref="textareaRef"
                v-model="textValue"
                class="w-full bg-transparent resize-none focus:outline-none"
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
</style>
