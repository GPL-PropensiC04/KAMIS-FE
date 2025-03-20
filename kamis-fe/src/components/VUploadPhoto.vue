<template>
  <div class="upload-card">
    <div class="upload-container" @click="triggerFileInput">
      <input type="file" ref="fileInput" @change="handleFileChange" class="hidden" />

      <div class="upload-content" v-if="!uploadedImageUrl">
        <UploadIcon class="upload-icon" />
        <p class="upload-text">Upload Foto Aset</p>
      </div>

      <div class="image-preview" v-if="uploadedImageUrl">
        <img :src="uploadedImageUrl" alt="Uploaded Image" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UploadIcon from '@/components/icons/UploadIcon.vue'

const emit = defineEmits(['file-change', 'upload-status'])
const fileInput = ref<HTMLInputElement | null>(null)
const uploadedImageUrl = ref<string | null>(null)
const uploadSuccess = ref<boolean>(false)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Validate file size - 8MB max
    const MAX_SIZE_MB = 8
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    
    if (file.size > MAX_SIZE_BYTES) {
      alert(`Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB.`)
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan.')
      return
    }
    
    // For large images, resize before emitting
    if (file.size > 2 * 1024 * 1024) { // If larger than 2MB
      try {
        const resizedFile = await resizeImage(file)
        console.log(`Resized image from ${Math.round(file.size/1024)}KB to ${Math.round(resizedFile.size/1024)}KB`)
        
        // Show preview
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedImageUrl.value = e.target?.result as string
          uploadSuccess.value = true
        }
        reader.readAsDataURL(resizedFile)
        
        // Emit the resized file to parent component
        emit('file-change', resizedFile)
      } catch (error) {
        console.error('Error resizing image:', error)
        showOriginalPreview(file)
      }
    } else {
      // For smaller images, use as is
      showOriginalPreview(file)
    }
  }
}

// Helper to show preview and emit original file
const showOriginalPreview = (file: File) => {
  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImageUrl.value = e.target?.result as string
    uploadSuccess.value = true
  }
  reader.readAsDataURL(file)
  
  // Emit the file to parent component
  emit('file-change', file)
}

// Helper function to resize large images
const resizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    
    img.onload = () => {
      // Release object URL to avoid memory leaks
      URL.revokeObjectURL(img.src)
      
      // Calculate new dimensions - aim for max 1600px width/height
      let width = img.width
      let height = img.height
      const MAX_DIMENSION = 1600
      
      if (width > height && width > MAX_DIMENSION) {
        height = Math.round((height * MAX_DIMENSION) / width)
        width = MAX_DIMENSION
      } else if (height > MAX_DIMENSION) {
        width = Math.round((width * MAX_DIMENSION) / height)
        height = MAX_DIMENSION
      }
      
      // Create canvas and resize
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }
      
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'))
          return
        }
        
        // Create new File from the blob
        const resizedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        })
        
        resolve(resizedFile)
      }, file.type, 0.85) // Quality 0.85 offers good balance between size and quality
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }
  })
}
</script>

<style scoped>
.upload-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px dashed #1E3A5F;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-card:hover {
  border-color: #888;
}

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 150px;
  position: relative;
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
  object-fit: contain;
}
</style>