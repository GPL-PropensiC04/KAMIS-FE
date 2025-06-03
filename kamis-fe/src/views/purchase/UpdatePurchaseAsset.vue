<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import axios from "axios";
import VSuccessButton from "@/components/VSuccessButton.vue";
import type { AssetTempInterface } from "@/interfaces/purchase/assettemp.interface";
import { API_URLS } from "@/config/api.config";
import type { UUID } from "crypto";
import VSpecialDropDown from "@/components/VSpecialDropDown.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Router & Store
const router = useRouter();
const route = useRoute();
const purchaseStore = usePurchaseStore();

// Ambil ID pembelian dari route
const purchaseId = route.params.purchaseId as string;
console.log("Route params:", route.params);
console.log("Purchase ID from route:", purchaseId);

// State
const purchaseDate = ref(""); // Tanggal Pengajuan
const selectedSupplier = ref(""); // Supplier yang bisa diubah
const purchaseNote = ref(""); // Catatan yang bisa diubah
const assetDetails = ref<AssetTempInterface>(); // Data aset
const assetImage = ref(""); // URL gambar aset

const supplierOptions = ref<{ label: string; value: UUID }[]>([]);

const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/all`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierOptions.value = response.data.data.map((item: { id: UUID; companySupplier: string; }) => ({
            label: item.companySupplier, // untuk ditampilkan
            value: item.id // untuk disimpan
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// Format tanggal (dd / MM / yyyy)
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
};

const fetchPurchaseDetail = async () => {
    try {
        console.log("Fetching purchase details for ID:", purchaseId);
        const data = await purchaseStore.getPurchaseById(purchaseId);
        console.log("Purchase data returned:", data);
        
        if (data) {
            // Prefill data dari store
            purchaseDate.value = formatDate(data.purchaseSubmissionDate);
            selectedSupplier.value = data.purchaseSupplier;
            purchaseNote.value = data.purchaseNote;
            
            // In the response, purchaseAsset is already a full object, not just an ID
            if (data.purchaseAsset) {
                console.log("Asset details found in purchase:", data.purchaseAsset);
                
                // Direct use the asset from response - no need for another API call
                assetDetails.value = data.purchaseAsset;
                
                // Fetch asset image if available
                if (data.purchaseAsset.fotoUrl) {
                    fetchAssetImage(data.purchaseAsset.id);
                }
            } else {
                console.warn("No asset found in purchase data");
            }
        } else {
            console.warn("No purchase data returned");
        }
    } catch (error) {
        console.log("MASUK ERROR:", error);
        console.error("Error fetching purchase details:", error);
    }
};

// Fetch gambar berdasarkan URL
const fetchAssetImage = async (assetId?: number) => {
    if (!assetId) return;
    
    try {
        const response = await axios.get(`${API_URLS.PURCHASE}/purchase/asset/${assetId}/foto`, { responseType: "blob" });
        assetImage.value = URL.createObjectURL(response.data); // Konversi ke URL objek
    } catch (error) {
        console.error("Error fetching asset image:", error);
    }
};

// Watch untuk mengambil gambar setiap kali `assetDetails` berubah
watch(assetDetails, (newAsset) => {
    if (newAsset?.fotoUrl) {
        fetchAssetImage(newAsset.id);
    }
});

// Format harga ke rupiah
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

// Handle update purchase
const handleUpdatePurchase = async () => {
    if (!assetDetails.value) return;

    const body = {
        purchaseSupplier: selectedSupplier.value,
        purchaseNote: purchaseNote.value,
        purchaseAsset: assetDetails.value.id // Kirim ID aset
    };

    await purchaseStore.updatePurchase(body, purchaseId);
    router.push(`/purchase/detail/asset/${purchaseId}`);
};

// Handle cancel
const handleCancel = () => {
    router.push(`/purchase/detail/asset/${purchaseId}`);
};

// Computed for validation
const isFormValid = computed(() => {
    return selectedSupplier.value && assetDetails.value;
});

// Fetch data saat halaman dimuat
onMounted(() => {
    fetchSuppliers();
    fetchPurchaseDetail();
});
</script>

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
                @click="handleCancel" 
                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                title="Kembali"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-white">Update Pembelian Aset</h1>
                <p class="text-blue-100 mt-1">Perbarui informasi pembelian aset</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <VSuccessButton label="Update" @click="handleUpdatePurchase" :disabled="!assetDetails" />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Card with Horizontal Layout -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="grid grid-cols-12 gap-0">
          <!-- Left Column - Form Fields -->
          <div class="col-span-8 p-8 pr-6">
            
            <!-- Purchase Info Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Informasi Pembelian</h2>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <!-- Purchase Date -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Tanggal Pengajuan</span>
                  </label>
                  <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">{{ purchaseDate || 'Loading...' }}</div>
                </div>

                <!-- Supplier -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Supplier</span>
                  </label>
                  <VSpecialDropDown v-model="selectedSupplier" :options="supplierOptions" class="form-dropdown" />
                </div>

                <!-- Type -->
                <div class="form-group">
                  <label class="form-label">
                    <span class="label-text">Tipe Barang</span>
                  </label>
                  <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">Aset</div>
                </div>
              </div>
            </div>

            <!-- Asset Details Section -->
            <div v-if="assetDetails" class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Detail Aset</h2>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <!-- Asset Info -->
                <div class="space-y-4">
                  <!-- Nama Aset -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nama Aset</span>
                    </label>
                    <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">{{ assetDetails.assetNameString }}</div>
                  </div>

                  <!-- Jenis Aset -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Jenis Aset</span>
                    </label>
                    <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">{{ assetDetails.assetType || '-' }}</div>
                  </div>

                  <!-- Nilai Perolehan -->
                  <div class="form-group">
                    <label class="form-label">
                      <span class="label-text">Nilai Perolehan</span>
                    </label>
                    <div class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">{{ formatCurrency(assetDetails.assetPrice) }}</div>
                  </div>
                </div>

                <!-- Asset Image -->
                <div>
                  <label class="form-label">
                    <span class="label-text">Foto Aset</span>
                  </label>
                  <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center" style="min-height: 200px;">
                    <img 
                      v-if="assetImage" 
                      :src="assetImage" 
                      alt="Gambar Aset" 
                      class="rounded-lg shadow-sm max-w-full max-h-48 object-cover"
                    />
                    <div v-else class="text-center text-gray-500">
                      <svg class="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="text-sm">Memuat gambar...</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Asset Description -->
              <div class="mt-4">
                <label class="form-label">
                  <span class="label-text">Deskripsi Aset</span>
                </label>
                <div class="form-textarea bg-gray-50 text-gray-900" style="min-height: 80px; padding: 12px;">
                  {{ assetDetails.assetDescription || '-' }}
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-else class="mb-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">Memuat data aset...</h3>
              <p class="text-gray-500">Harap tunggu sebentar</p>
            </div>

            <!-- Purchase Note Section -->
            <div class="mb-6">
              <div class="flex items-center mb-4">
                <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mr-3">
                  <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800">Catatan Pembelian</h2>
              </div>

              <div class="form-group">
                <textarea 
                  v-model="purchaseNote" 
                  placeholder="Tambahkan catatan pembelian..."
                  class="form-textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Right Column - Summary & Actions -->
          <div class="col-span-4 bg-gray-50 p-8 pl-6 border-l border-gray-100">
            <div class="sticky top-6">
              <!-- Asset Preview -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Preview Aset</h3>
                <div v-if="assetDetails" class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nama:</span>
                    <span class="font-medium text-gray-900">{{ assetDetails.assetNameString }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Jenis:</span>
                    <span class="font-medium text-gray-900">{{ assetDetails.assetType || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Nilai:</span>
                    <span class="font-medium text-gray-900">{{ formatCurrency(assetDetails.assetPrice) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Foto:</span>
                    <span class="font-medium text-gray-900">{{ assetImage ? '✓ Tersedia' : 'Memuat...' }}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-100">
                    <span class="text-gray-600 block mb-1">Deskripsi:</span>
                    <span class="font-medium text-gray-900 text-xs leading-relaxed">{{ assetDetails.assetDescription || '-' }}</span>
                  </div>
                </div>
                <div v-else class="text-center text-gray-500">
                  <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>

              <!-- Purchase Info -->
              <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Info Purchase</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tanggal:</span>
                    <span class="font-medium text-gray-900">{{ purchaseDate || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Supplier:</span>
                    <span class="font-medium text-gray-900">{{ supplierOptions.find(s => s.value === selectedSupplier)?.label || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Tipe:</span>
                    <span class="font-medium text-gray-900">Aset</span>
                  </div>
                </div>
              </div>

              <!-- Validation Status -->
              <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
                <h4 class="text-sm font-medium text-gray-800 mb-3">Status Update</h4>
                <div class="space-y-2 text-xs">
                  <div class="flex items-center">
                    <div :class="selectedSupplier ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="selectedSupplier" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Pilih Supplier</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="assetDetails ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="assetDetails" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Data Aset</span>
                  </div>
                  <div class="flex items-center">
                    <div :class="purchaseNote ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <svg v-if="purchaseNote" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                      </svg>
                    </div>
                    <span>Catatan (Opsional)</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <VSuccessButton 
                  :label="isFormValid ? 'Update Purchase' : 'Lengkapi Data'"
                  @click="handleUpdatePurchase" 
                  :class="isFormValid ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                  :disabled="!isFormValid"
                />
              </div>

              <!-- Help Text -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Tips Update:</h4>
                <ul class="text-xs text-blue-800 space-y-1">
                  <li>• Edit supplier jika diperlukan</li>
                  <li>• Data aset tidak dapat diubah</li>
                  <li>• Update catatan pembelian</li>
                  <li>• Pastikan supplier sudah benar</li>
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