<script setup lang="ts">
import VUploadPhoto from '@/components/VUploadPhoto.vue'
import VTextBox from '@/components/VTextBox.vue'
import VTextArea from '@/components/VTextArea.vue'
import VPriceInput from '@/components/VPriceInput.vue'
import VDropDownInput from '@/components/VDropDownInput.vue'
import VSuccessButton from '@/components/VSuccessButton.vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAssetTempStore } from '@/stores/assetTemp'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@/components/Breadcrumb.vue'

const assetName = ref('');
const assetDescription = ref('');
const assetType = ref('');
const assetPrice = ref(0);
const foto = ref<File | null>(null);
const toast = useToast();

const router = useRouter();
const assetTempStore = useAssetTempStore();

const isFormValid = computed(() => {
  return assetName.value.trim() !== '' && 
         assetDescription.value.trim() !== '' && 
         assetType.value !== '' && 
         assetPrice.value > 0 && 
         foto.value !== null;
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Harap isi semua field sebelum submit!');
    return;
  }

  try {
    assetTempStore.setDraftAssetTemp({
      ...assetTempStore.draftAssetTemp,
      assetName: assetName.value,
      assetDescription: assetDescription.value,
      assetType: assetType.value,
      assetPrice: assetPrice.value
    });
    
    console.log('Draft asset stored, navigating to summary');
    router.push('/purchase/add/asset-summary');
  } catch (error) {
    console.error('Error submitting asset:', error);
  }
};

// Add a file change handler function
const handleFileChange = (file: File) => {
  console.log('File received:', file);
  foto.value = file;
  
  // Generate preview using FileReader
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target?.result as string;
    
    // Store only metadata in localStorage, not the image itself
    assetTempStore.setDraftAssetTemp({
      ...assetTempStore.draftAssetTemp,
      fileName: foto.value?.name,
      fileSize: foto.value?.size,
      contentType: foto.value?.type,
      // Don't store imageBase64 in localStorage - it's too large
      hasImage: true // Just a flag to indicate an image exists
    });
    
    // Store the actual image data only in sessionStorage
    sessionStorage.setItem('tempFileData', base64String);
    console.log(`Image stored in sessionStorage (${Math.round((base64String.length * 0.75) / 1024)} KB)`);
  };
  reader.readAsDataURL(file);
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
</script>

<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-100">
    </div>

    <!-- Main Content -->
    <div class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="router.back()" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Tambah Aset Baru</h1>
                <p class="text-blue-100 mt-1">Lengkapi informasi aset yang akan dibeli</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card with Horizontal Layout -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
          <!-- Upload Foto Section -->
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Foto Aset</h2>
            </div>

            <div class="flex justify-center">
              <div class="w-full max-w-md">
                <VUploadPhoto class="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors" @file-change="handleFileChange" />
              </div>
            </div>

            <!-- File info -->
            <div v-if="foto" class="mt-2 text-center">
              <div class="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                {{ foto.name }} ({{ Math.round(foto.size / 1024) }} KB)
              </div>
            </div>
          </div>

          <!-- Informasi Dasar Section -->
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Informasi Dasar</h2>
            </div>

            <!-- Baris pertama: Nama Aset, Jenis Aset, Nilai Perolehan -->
            <div class="grid grid-cols-3 gap-4 mb-4">
              <!-- Nama Aset -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Nama Aset</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <VTextBox v-model="assetName" placeholder="Masukkan nama aset" class="w-full" />
              </div>

              <!-- Jenis Aset -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Jenis Aset</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <VDropDownInput 
                  v-model="assetType" 
                  :options="['Truk', 'Mobil', 'Pickup']" 
                  placeholder="Pilih Jenis Aset" 
                  class="form-dropdown"
                />
              </div>

              <!-- Nilai Perolehan -->
              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Nilai Perolehan</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <VPriceInput v-model="assetPrice" placeholder="Rp0,00" class="w-full" />
              </div>
            </div>

            <!-- Baris kedua: Deskripsi Aset -->
            <div class="grid grid-cols-1 gap-4">
              <div class="form-group">
                <label class="form-label">
                  <span class="label-text">Deskripsi Aset</span>
                  <span class="text-red-500 ml-1">*</span>
                </label>
                <VTextArea v-model="assetDescription" placeholder="Masukkan deskripsi detail aset..." class="w-full" />
              </div>
            </div>
          </div>
        </div>

          <!-- Right Column - Summary & Actions -->
          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <!-- Preview Summary -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Data</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nama:</span>
                    <span class="font-medium text-gray-900">{{ assetName || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Jenis:</span>
                    <span class="font-medium text-gray-900">{{ assetType || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nilai:</span>
                    <span class="font-medium text-gray-900">{{ assetPrice > 0 ? formatPrice(assetPrice) : '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Foto:</span>
                    <span class="font-medium text-gray-900">{{ foto ? '✓ Uploaded' : 'Belum upload' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Deskripsi:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ assetDescription || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Validation Status -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
                <h4 class="text-sm font-medium text-gray-800 mb-3">Status Validasi</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center">
                    <div :class="assetName.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="assetName.trim()" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Nama Aset</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="assetType ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="assetType" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Jenis Aset</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="assetDescription.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="assetDescription.trim()" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Deskripsi</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="assetPrice > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="assetPrice > 0" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Nilai Perolehan</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="foto ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="foto" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Foto Aset</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <VSuccessButton 
                  :label="isFormValid ? 'Tambah Aset' : 'Lengkapi Data'"
                  @click="handleSubmit" 
                  :class="isFormValid ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                  :disabled="!isFormValid"
                />
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Pengisian:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Upload foto yang jelas untuk identifikasi</li>
                  <li>• Pastikan nama aset mudah dikenali</li>
                  <li>• Isi nilai perolehan sesuai harga beli</li>
                  <li>• Deskripsi detail membantu pengelolaan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700&display=swap');

* {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Form Styling */
.form-group {
    margin-bottom: 1.5rem;
}

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
}

.label-text {
    color: #374151;
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    transition: all 0.2s ease;
    color: #111827;
    font-size: 0.875rem;
}

.form-input::placeholder {
    color: #9ca3af;
}

.form-input:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
}

.form-input:hover:not(:disabled) {
    border-color: #d1d5db;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background-color: white;
    transition: all 0.2s ease;
    color: #111827;
    font-size: 0.875rem;
    resize: vertical;
    min-height: 100px;
}

.form-textarea::placeholder {
    color: #9ca3af;
}

.form-textarea:focus {
    outline: none;
    border-color: transparent;
    box-shadow: 0 0 0 2px #3b82f6;
}

.form-textarea:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
}

/* Button Styling */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    text-decoration: none;
}

.btn-primary:hover {
    transform: scale(1.02);
}

.btn-disabled {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #9ca3af;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: not-allowed;
    opacity: 0.6;
}

.btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: white;
    color: #374151;
    font-weight: 500;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.btn-secondary:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

.btn-secondary:focus {
    outline: none;
    box-shadow: 0 0 0 2px #6b7280, 0 0 0 4px rgba(107, 114, 128, 0.1);
}

/* Disabled state for company field */
.form-input:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
}

/* Responsive improvements */
@media (max-width: 640px) {
    .grid.grid-cols-1.lg\\:grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .form-input {
        font-size: 1rem; /* Prevents zoom on iOS */
    }
    
    .btn-primary, .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}

/* Custom animations */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.form-group {
    animation: slideIn 0.3s ease-out;
}

/* Focus states for accessibility */
.form-input:focus-visible,
.form-textarea:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* Hover effects */
.form-group:hover .input-icon {
    color: #6b7280;
}

.space-x-2 > * + * {
    margin-left: 0.5rem;
}

.space-x-4 > * + * {
    margin-left: 1rem;
}

/* Responsive grid */
@media (min-width: 1024px) {
    .lg\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 640px) {
    .sm\\:flex-row {
        flex-direction: row;
    }
    
    .sm\\:order-1 {
        order: 1;
    }
    
    .sm\\:order-2 {
        order: 2;
    }
    
    .sm\\:flex {
        display: flex;
    }
}

/* Order utilities */
.order-1 {
    order: 1;
}

.order-2 {
    order: 2;
}
</style>