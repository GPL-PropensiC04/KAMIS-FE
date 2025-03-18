<template>
    <font-awesome-icon
      :icon="icon"
      :size="size"
      :class="['base-icon', customClass]"
      @click="handleClick"
    />
  </template>
  
  <script setup lang="ts">
  import { defineEmits } from 'vue'
  
  const emit = defineEmits(['click'])
  
  const props = defineProps<{
    icon: string
    size?: string  // 'sm', 'lg', '2x', etc.
    customClass?: string
    clickable?: boolean
  }>()
  
  const handleClick = () => {
    if (props.clickable) {
      emit('click')
    }
  }
  </script>
  
  <style scoped>
  .base-icon {
    color: #ffffff;
    cursor: default;
    transition: color 0.2s ease, transform 0.2s ease;
    font-size: 20px;
  }
  
  .base-icon.clickable {
    cursor: pointer;
  }
  
  .base-icon:hover {
    color: #ffffff;
    transform: scale(1.1);
  }
  </style>
  