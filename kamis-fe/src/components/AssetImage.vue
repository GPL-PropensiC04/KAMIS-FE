<template>
    <div class="gambar-aset-container">
      <img 
        :src="imageUrl || '/placeholder-truck.jpg'" 
        :alt="alt" 
        class="gambar-aset" 
      />
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps({
    imageUrl: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Gambar Aset'
    }
  });
  </script>
  
  <style scoped>
  .gambar-aset-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .gambar-aset {
    max-width: 100%;
    max-height: 200px;
    object-fit: contain;
    border-radius: 4px;
  }
  </style>