<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-gray-100">
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-full mx-auto px-8 py-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-full mx-auto px-8 py-6">
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
                <h1 class="text-2xl font-bold text-white">Update Data Barang</h1>
                <p class="text-blue-100 mt-1">Perbarui informasi barang dengan detail yang akurat</p>
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

      <!-- Form Card with Horizontal Layout -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
            <form @submit.prevent="updateResource" class="space-y-6">
              <!-- Informasi Dasar Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Informasi Dasar Barang</h2>
                </div>

                <!-- Grid dengan 2 kolom untuk form yang lebih kompak -->
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Nama Barang (Read-only) -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nama Barang</span>
                    </label>
                    <div class="relative">
                      <input 
                        :value="resourceName"
                        disabled
                        class="form-input pl-10 disabled"
                      />
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Supplier</span>
                    </label>
                    <div class="relative">
                      <input 
                        :value="supplierName"
                        disabled
                        class="form-input pl-10 disabled"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Informasi Harga & Stok Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Harga & Stok</h2>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <!-- Harga Jual -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Harga Jual</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="resourcePrice"
                        v-model.number="resourcePrice"
                        type="number"
                        min="0"
                        step="1000"
                        required
                        class="form-input pl-10"
                        placeholder="Masukkan harga jual"
                      />
                    </div>
                    <div v-if="validationErrors.resourcePrice" class="text-red-500 text-xs mt-1">
                      {{ validationErrors.resourcePrice }}
                    </div>
                  </div>

                  <!-- Stok Barang -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Stok Barang</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                      <input
                        id="resourceStock"
                        v-model.number="resourceStock"
                        type="number"
                        min="0"
                        required
                        class="form-input pl-10"
                        placeholder="Masukkan jumlah stok"
                      />
                    </div>
                    <div v-if="validationErrors.resourceStock" class="text-red-500 text-xs mt-1">
                      {{ validationErrors.resourceStock }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Deskripsi Section -->
              <div class="mb-6">
                <div class="flex items-center mb-4">
                  <div class="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mr-3">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-800">Deskripsi Barang</h2>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Deskripsi Lengkap</span>
                    <span class="text-red-500 ml-1">*</span>
                  </label>
                  <textarea 
                    id="resourceDescription"
                    v-model="resourceDescription"
                    required
                    rows="4"
                    class="form-textarea"
                    placeholder="Masukkan deskripsi lengkap barang, termasuk spesifikasi dan fitur..."
                  ></textarea>
                  <div v-if="validationErrors.resourceDescription" class="text-red-500 text-xs mt-1">
                    {{ validationErrors.resourceDescription }}
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
                    <span class="text-gray-600">Nama Barang:</span>
                    <span class="font-medium text-gray-900">{{ resourceName || '-' }}</span>
                  </div>
                  <!-- <div class="flex justify-between">
                    <span class="text-gray-600">Supplier:</span>
                    <span class="font-medium text-gray-900">{{ supplierName || '-' }}</span>
                  </div> -->
                  <div class="flex justify-between">
                    <span class="text-gray-600">Harga Jual:</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(resourcePrice) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Stok:</span>
                    <span class="font-medium text-gray-900">{{ resourceStock || 0 }} unit</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Deskripsi:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ resourceDescription || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button 
                  type="button"
                  @click="updateResource"
                  class="btn-primary w-full justify-center"
                  :disabled="isSubmitting"
                >
                  <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting ? 'Mengupdate...' : 'Update Barang' }}
                </button>
              </div>

              <!-- Update Notice -->
              <div class="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h4 class="text-sm font-medium text-amber-900 mb-2">Catatan Update:</h4>
                <ul class="text-xs text-amber-800 space-y-1">
                  <li>• Nama barang dan supplier tidak dapat diubah</li>
                  <li>• Harga jual harus lebih dari 0</li>
                  <li>• Stok tidak boleh bernilai negatif</li>
                  <li>• Deskripsi lengkap membantu identifikasi barang</li>
                  <li>• Perubahan akan tersimpan permanen</li>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useResourceStore } from '@/stores/resource';
import type { ResourceInterface } from '@/interfaces/resource/resource.interface';
import Breadcrumb from '@/components/Breadcrumb.vue';

const router = useRouter();
const route = useRoute();
const resourceStore = useResourceStore();

const resourceId = Number(route.params.id);
const resourceName = ref('');
const resourceStock = ref(0);
const resourcePrice = ref(0);
const resourceDescription = ref('');
const supplierName = ref(''); 
const isLoading = ref(true);
const isSubmitting = ref(false);

// Validation errors state
const validationErrors = ref({
  resourcePrice: '',
  resourceStock: '',
  resourceDescription: ''
});

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Validate form before submission
const validateForm = (): boolean => {
  // Reset all errors
  validationErrors.value = {
    resourcePrice: '',
    resourceStock: '',
    resourceDescription: ''
  };
  
  let isValid = true;

  // Validate resource price
  if (!resourcePrice.value || resourcePrice.value <= 0) {
    validationErrors.value.resourcePrice = 'Harga jual harus lebih dari 0';
    isValid = false;
  }

  // Validate resource stock
  if (resourceStock.value < 0) {
    validationErrors.value.resourceStock = 'Stok barang tidak boleh negatif';
    isValid = false;
  }

  // Validate resource description
  if (!resourceDescription.value || !resourceDescription.value.trim()) {
    validationErrors.value.resourceDescription = 'Deskripsi barang harus diisi';
    isValid = false;
  }

  return isValid;
};

// Fetch existing data
onMounted(async () => {
  try {
    await resourceStore.viewAllResources();
    const resource = resourceStore.resources.find((res) => res.id === resourceId);
    if (resource) {
      resourceName.value = resource.resourceName;
      resourceStock.value = resource.resourceStock;
      resourcePrice.value = resource.resourcePrice;
      resourceDescription.value = resource.resourceDescription || '';
      // Assuming supplier info is available in the resource object
    } else {
      // Handle case where resource is not found
      console.error('Resource not found');
      router.back();
    }
  } catch (error) {
    console.error('Error fetching resource data:', error);
    router.back();
  } finally {
    isLoading.value = false;
  }
});

// Update handler sesuai store
const updateResource = async () => {
  // First validate the form
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }

  isSubmitting.value = true;

  const body: Partial<ResourceInterface> = {
    resourcePrice: resourcePrice.value,
    resourceDescription: resourceDescription.value,
    resourceStock: resourceStock.value,
  };

  try {
    await resourceStore.updateResource(resourceId, body);
    // If successful, redirect to resources list or detail
    router.push('/resource');
  } catch (error) {
    console.error('Gagal update resource:', error);
  } finally {
    isSubmitting.value = false;
  }
};
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

/* Button Styling */
.btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    background-color: #1E3A5F;
    color: white;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    text-decoration: none;
}

.btn-primary:hover:not(:disabled) {
    background-color: #1a325a;
    transform: scale(1.02);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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

.btn-secondary:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
}

.btn-secondary:focus {
    outline: none;
    box-shadow: 0 0 0 2px #6b7280, 0 0 0 4px rgba(107, 114, 128, 0.1);
}

.btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Disabled state for read-only fields */
.form-input:disabled {
    background-color: #f3f4f6;
    color: #6b7280;
    cursor: not-allowed;
    border-color: #e5e7eb;
}

.disabled {
    background-color: #f3f4f6 !important;
    color: #6b7280 !important;
    cursor: not-allowed !important;
    border-color: #e5e7eb !important;
}

/* Loading animation */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: .5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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

/* Responsive improvements */
@media (max-width: 1024px) {
    .grid.grid-cols-12 {
        grid-template-columns: 1fr;
    }
    
    .col-span-8, .col-span-4 {
        grid-column: span 12;
    }
    
    .border-l {
        border-left: none;
        border-top: 1px solid #e5e7eb;
    }
}

@media (max-width: 640px) {
    .grid.grid-cols-2 {
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
</style>