<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Notification popup -->
    <div 
      v-if="showNotification" 
      :class="[
        'fixed top-5 right-5 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-slide-in',
        notificationType === 'error' ? 'bg-red-500' : 'bg-green-500'
      ]"
    >
      {{ notificationMessage }}
    </div>

    <!-- Main Content -->
    <div class="max-w-full mx-auto px-8 py-6">
      <!-- Header Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div class="bg-[#1E3A5F] px-8 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                @click="cancel" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Edit Aset</h1>
                <p class="text-blue-100 mt-1">Ubah informasi aset {{ formattedPlateNumber }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p class="text-gray-600">Memuat data aset...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="text-red-600 mb-4">{{ error }}</p>
          <button 
            @click="loadData" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- Form Card with Horizontal Layout -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
            <form @submit.prevent="updateAsset" class="space-y-6">
              <!-- Foto Aset Section -->
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
                    <div class="w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img 
                        :src="assetImageUrl || '/placeholder-truck.jpg'" 
                        alt="Asset Image" 
                        class="w-full h-full object-cover"
                        @error="handleImageError"
                      />
                    </div>
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

                <div class="grid grid-cols-2 gap-4">
                  <!-- Nama Aset -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nama Aset</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <VTextArea
                      v-model="formData.nama"
                      placeholder="Masukkan nama aset"
                      class="w-full"
                      required
                    />
                    <p v-if="errors.nama" class="mt-1 text-sm text-red-600">{{ errors.nama }}</p>
                  </div>

                  <!-- Jenis Aset -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Jenis Aset</span>
                    </label>
                    <VDropDownInput
                      :options="jenisAsetOptions.map(option => option.value)"
                      v-model="formData.jenisAset"
                      placeholder="Pilih Jenis Aset"
                      class="form-dropdown"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-4">
                  <!-- No Polisi -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">No Polisi</span>
                    </label>
                    <VLockedInput
                      :value="formattedPlateNumber"
                      class="w-full"
                    />
                  </div>

                  <!-- Status -->
                  <div class="form-group">
                    <label class="form-label">
                    </label>
                  </div>
                </div>
              </div>

              <!-- Detail Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Detail Aset</h2>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <!-- Deskripsi Aset -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Deskripsi Aset</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <VTextBox
                      v-model="formData.deskripsi"
                      placeholder="Masukkan deskripsi detail aset..."
                      class="w-full h-32"
                      required
                    />
                    <p v-if="errors.deskripsi" class="mt-1 text-sm text-red-600">{{ errors.deskripsi }}</p>
                  </div>
                </div>
              </div>
            </form>
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
                    <span class="font-medium text-gray-900">{{ formData.nama || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Jenis:</span>
                    <span class="font-medium text-gray-900">{{ formData.jenisAset || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">No Polisi:</span>
                    <span class="font-medium text-gray-900">{{ formattedPlateNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status:</span>
                    <span class="font-medium text-gray-900">{{ formData.status || '-' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Deskripsi:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ formData.deskripsi || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Validation Status -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
                <h4 class="text-sm font-medium text-gray-800 mb-3">Status Validasi</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center">
                    <div :class="formData.nama.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="formData.nama.trim()" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Nama Aset</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="formData.jenisAset ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="formData.jenisAset" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Jenis Aset</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="formData.deskripsi.trim() ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="formData.deskripsi.trim()" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Deskripsi</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="formData.status ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="formData.status" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Status Aset</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <VSuccessButton 
                  :label="isFormValid ? 'Update Aset' : 'Lengkapi Data'"
                  @click="updateAsset" 
                  :class="isFormValid ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                  :disabled="!isFormValid"
                />
                <VCancelButton 
                  @click="cancel"
                  class="w-full justify-center"
                >
                  Batal
                </VCancelButton>
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Edit Aset:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Pastikan nama aset mudah dikenali</li>
                  <li>• Pilih jenis aset yang sesuai</li>
                  <li>• Update status sesuai kondisi terkini</li>
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

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AsetInterface } from '@/interfaces/asset/asset.interface';
import { AsetService } from '@/stores/asset';
import { byteArrayToImageUrl } from '@/utils/formatters';
import VLockedInput from '@/components/VLockedInput.vue';
import VDropDownInput from '@/components/VDropDownInput.vue';
import VTextBox from '@/components/VTextBox.vue';
import VTextArea from '@/components/VTextArea.vue';
import VCancelButton from '@/components/VCancelButton.vue';
import VSuccessButton from '@/components/VSuccessButton.vue';
import axios from 'axios';
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const platNomor = route.params.platNomor as string;

// State variables
const asset = ref<AsetInterface | null>(null);
const assetImageUrl = ref('');
const isLoading = ref(true);
const error = ref('');

// Notification state
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error'>('success');

// Form data for editing
const formData = ref({
  nama: '',
  jenisAset: '',
  deskripsi: '',
  status: '',
  assetMaintenance: ''
});

// Options for dropdown
const jenisAsetOptions = [
  { value: 'Truk', label: 'Truk' },
  { value: 'Mobil', label: 'Mobil' },
  { value: 'Pick Up', label: 'Pick Up' },
];


// Formatted plate number computed property
const formattedPlateNumber = computed(() => {
  return platNomor;
});

// Form validation
const errors = ref({
  nama: '',
  deskripsi: ''
});

// Form validation computed property
const isFormValid = computed(() => {
  return formData.value.nama.trim() !== '' && 
         formData.value.deskripsi.trim() !== '' && 
         formData.value.jenisAset !== '' && 
         formData.value.status !== '';
});

// Validate form function
const validateForm = () => {
  let isValid = true;
  errors.value = {
    nama: '',
    deskripsi: ''
  };
  
  if (!formData.value.nama.trim()) {
    errors.value.nama = 'Nama aset tidak boleh kosong';
    isValid = false;
  }
  
  if (!formData.value.deskripsi.trim()) {
    errors.value.deskripsi = 'Deskripsi aset tidak boleh kosong';
    isValid = false;
  }
  
  return isValid;
};

// Show notification helper function
const showNotificationPopup = (message: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// Handle image loading errors
const handleImageError = () => {
  console.log('Image failed to load, using placeholder');
  assetImageUrl.value = '/placeholder-truck.jpg';
};

// Fetch asset image from backend
const fetchAssetImage = async (id: string) => {
  try {
    if (!id || id === 'undefined' || id === 'null') {
      console.warn('Invalid asset ID for image fetch:', id);
      assetImageUrl.value = '/placeholder-truck.jpg';
      return;
    }

    const response = await axios.get(`${API_URLS.ASSET}/asset/${id}/foto`, {
      responseType: 'blob',
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 300,
    });
    
    if (response.data && response.data.size > 0) {
      assetImageUrl.value = URL.createObjectURL(response.data);
    } else {
      console.warn('Empty image data received');
      assetImageUrl.value = '/placeholder-truck.jpg';
    }
  } catch (error) {
    console.error("Error fetching asset image:", error);
    assetImageUrl.value = '/placeholder-truck.jpg';
  }
};

const loadData = async () => {
  isLoading.value = true;
  error.value = '';

  try {
    const loadedAsset = await AsetService.getAsetByPlatNomor(platNomor);
    asset.value = loadedAsset;
    
    formData.value.nama = loadedAsset.nama;
    formData.value.jenisAset = loadedAsset.jenisAset;
    formData.value.deskripsi = loadedAsset.deskripsi;
    formData.value.status = loadedAsset.status;
    formData.value.assetMaintenance = loadedAsset.assetMaintenance;
    
    await fetchAssetImage(platNomor);
    
    if (loadedAsset.gambarAset) {
      const byteArrayImage = byteArrayToImageUrl(loadedAsset.gambarAset as unknown as number[]);
      if (byteArrayImage && !assetImageUrl.value) {
        assetImageUrl.value = byteArrayImage;
      }
    }
  } catch (err) {
    console.error('Failed to load asset:', err);
    error.value = 'Gagal memuat data aset. Silakan coba lagi.';
    showNotificationPopup('Gagal memuat data aset', 'error');
    assetImageUrl.value = '/placeholder-truck.jpg';
  } finally {
    isLoading.value = false;
  }
};

const updateAsset = async () => {
  if (!validateForm()) {
    showNotificationPopup('Harap lengkapi semua field yang wajib diisi', 'error');
    return;
  }
  
  try {
    const assetData = {
      platNomor: platNomor,
      nama: formData.value.nama,
      jenisAset: formData.value.jenisAset,
      deskripsi: formData.value.deskripsi,
      status: formData.value.status
    };
    
    await AsetService.updateAset(platNomor, assetData);
    useToast().success(`${formData.value.nama} berhasil diperbarui`);
    
    setTimeout(() => {
      router.push({
        path: `/asset/${platNomor}`,
        query: { edited: 'true' }
      });
    }, 1500);
  } catch (err) {
    console.error('Failed to update asset:', err);
    error.value = 'Gagal memperbarui aset. Silakan coba lagi.';
    showNotificationPopup('Gagal memperbarui aset', 'error');
  }
};

const cancel = () => {
  router.push(`/asset/${platNomor}`);
};

onMounted(() => {
  loadData();
});
</script>

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

/* Animation for notification */
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
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

/* Responsive improvements */
@media (max-width: 640px) {
    .grid.grid-cols-12 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .col-span-8, .col-span-4 {
        grid-column: span 12;
    }
    
    .form-input {
        font-size: 1rem;
    }
}
</style>