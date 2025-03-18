<template>
    <div>
      <div class="upload-container" @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />
        <div class="upload-content" v-if="!uploadedImageUrl">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="upload-icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <p>Upload Foto Aset</p>
        </div>
        <div class="image-preview" v-if="uploadedImageUrl">
          <img :src="uploadedImageUrl" alt="Uploaded Image" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  const fileInput = ref<HTMLInputElement | null>(null);
  const uploadedImageUrl = ref<string | null>(null);
  const uploadSuccess = ref<boolean>(false);
  
  const triggerFileInput = () => {
    fileInput.value?.click();
  };
  
  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      // Lakukan sesuatu dengan file yang diunggah, misalnya mengirim ke server
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImageUrl.value = e.target?.result as string;
        uploadSuccess.value = true;
      };
      reader.readAsDataURL(file);
    }
  };
  </script>
  
  <style scoped>
  .upload-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
    height: 150px; /* Ubah dari 200px menjadi 150px */
    border: 2px dashed #1E3A5F;
    border-radius: 8px;
    cursor: pointer;
    background-color: #E5EAF2;
    transition: background-color 0.3s;
    position: relative;
  }
  
  .upload-container:hover {
    background-color: #D1D9E6;
  }
  
  .upload-content {
    text-align: center;
    color: #1E3A5F;
  }
  
  .upload-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 8px;
  }
  
  .hidden {
    display: none;
  }
  
  .notification {
    margin-top: 10px;
    color: green;
    text-align: center;
  }
  
  .image-preview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    object-fit: contain; /* Menyesuaikan ukuran gambar dengan kotak */
  }
  </style>