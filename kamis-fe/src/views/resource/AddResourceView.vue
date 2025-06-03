<template>
  <Breadcrumb />
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

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
                <h1 class="text-2xl font-bold text-white">Tambah Barang Baru</h1>
                <p class="text-blue-100 mt-1">Lengkapi informasi barang dengan detail yang akurat</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 text-white/80">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
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
            <form @submit.prevent="handleSubmit" class="space-y-6">
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
                  <!-- Nama Barang -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nama Barang</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="relative">
                      <input 
                        id="resourceName"
                        v-model="formData.resourceName"
                        type="text"
                        required
                        class="form-input pl-10"
                        placeholder="Masukkan nama barang"
                      />
                    </div>
                    <div v-if="validationErrors.resourceName" class="text-red-500 text-xs mt-1">
                      {{ validationErrors.resourceName }}
                    </div>
                  </div>

                  <!-- Supplier -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Supplier</span>
                      <span class="text-red-500 ml-1">*</span>
                    </label>
                    <VSpecialDropDown v-model="selectedSupplier" :options="supplierOptions" />
                    <div v-if="validationErrors.resourceSupplierId" class="text-red-500 text-xs mt-1">
                      {{ validationErrors.resourceSupplierId }}
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
                      <VPriceInput
                        id="resourcePrice"
                        v-model="formData.resourcePrice"
                        :min="0"
                        :step="10000"
                        required
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
                      <VNumberInput
                        id="resourceStock"
                        v-model="formData.resourceStock"
                        :min="0"
                        required
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
                    v-model="formData.resourceDescription"
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
                    <span class="font-medium text-gray-900">{{ formData.resourceName || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Supplier:</span>
                    <span class="font-medium text-gray-900">{{ getSupplierName() || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Harga Jual:</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(formData.resourcePrice) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Stok:</span>
                    <span class="font-medium text-gray-900">{{ formData.resourceStock || 0 }} unit</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Deskripsi:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ formData.resourceDescription || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button 
                  type="button"
                  @click="handleSubmit"
                  class="btn-primary w-full justify-center"
                  :disabled="isLoading"
                >
                  <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isLoading ? 'Menambahkan...' : 'Simpan Barang' }}
                </button>
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Pengisian:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Pastikan nama barang jelas dan mudah dikenali</li>
                  <li>• Pilih supplier yang tepat untuk barang ini</li>
                  <li>• Harga jual harus mencakup margin keuntungan</li>
                  <li>• Stok awal sesuai dengan ketersediaan barang</li>
                  <li>• Deskripsi lengkap membantu identifikasi barang</li>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { AddResourceRequestInterface } from '@/interfaces/resource/resource.interface';
import { useResourceStore } from '@/stores/resource';
import VPriceInput from '@/components/VPriceInput.vue';
import VNumberInput from '@/components/VNumberInput.vue';
import Breadcrumb from '@/components/Breadcrumb.vue';
import axios from "axios";
import { API_URLS } from "@/config/api.config";
import type { UUID } from "crypto";
import VSpecialDropDown from "@/components/VSpecialDropDown.vue";
import { watch } from 'vue';

const router = useRouter();
const resourceStore = useResourceStore();
const isLoading = computed(() => resourceStore.loading);
const selectedSupplier = ref<string | undefined>(undefined);

const formData = ref<AddResourceRequestInterface>({
  resourceName: '',
  resourcePrice: 0,
  resourceStock: 0,
  resourceDescription: '',
  resourceSupplierId: '',
});

// Validation errors state
const validationErrors = ref({
  resourceName: '',
  resourcePrice: '',
  resourceStock: '',
  resourceDescription: '',
  resourceSupplierId: ''
});

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function to get supplier name
const getSupplierName = (): string => {
  const supplier = supplierOptions.value.find(option => option.value === selectedSupplier.value);
  return supplier ? supplier.label : '';
};

// Validate form before submission
const validateForm = (): boolean => {
  
  // Reset all errors
  validationErrors.value = {
    resourceName: '',
    resourcePrice: '',
    resourceStock: '',
    resourceDescription: '',
    resourceSupplierId: ''
  };
  
  let isValid = true;

  // Validate resource name
  if (!formData.value.resourceName.trim()) {
    validationErrors.value.resourceName = 'Nama barang harus diisi';
    isValid = false;
  }

  // Validate resource price
  if (formData.value.resourcePrice <= 0) {
    validationErrors.value.resourcePrice = 'Harga jual harus lebih dari 0';
    isValid = false;
  }

  // Validate resource stock
  if (formData.value.resourceStock <= 0) {
    validationErrors.value.resourceStock = 'Stok barang tidak boleh 0';
    isValid = false;
  }

  // Validate resource description
  if (!formData.value.resourceDescription.trim()) {
    validationErrors.value.resourceDescription = 'Deskripsi barang harus diisi';
    isValid = false;
  }

  // Validate supplier selection
  if (!formData.value.resourceSupplierId) {
    validationErrors.value.resourceSupplierId = 'Supplier harus dipilih';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  // First validate the form
  if (!validateForm()) {
    return; // Stop submission if validation fails
  }
  
  try {
    await resourceStore.addResource(formData.value);
    // If successful, redirect to resources list
    router.push('/resource');
  } catch (error) {
    console.error('Error adding resource:', error);
  }
};

const supplierOptions = ref<{ label: string; value: UUID }[]>([]);

const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/all`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierOptions.value = response.data.data.map((item: { id: UUID; nameSupplier: string; companySupplier: string}) => ({
            label: item.companySupplier, // untuk ditampilkan
            value: item.id // untuk disimpan
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

onMounted(() => {
  fetchSuppliers();
});

// Update formData when supplier changes
watch(selectedSupplier, (newValue) => {
  formData.value.resourceSupplierId = newValue || '';
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
    
    .btn-primary {
        width: 100%;
        justify-content: center;
    }
}
</style>