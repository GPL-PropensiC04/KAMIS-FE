<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VOptionInput from "@/components/VOptionInput.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import { useToast } from "vue-toastification";
import axios from "axios";
import { API_URLS } from "@/config/api.config";
import type { UUID } from "crypto";
import VSpecialDropDown from "@/components/VSpecialDropDown.vue";
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter();
const purchaseStore = usePurchaseStore();

// Data form
const selectedSupplier = ref(purchaseStore.draftPurchase?.purchaseSupplier || "");
const selectedType = ref(purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");

const supplierOptions = ref<{ label: string; value: UUID }[]>([]);

const fetchSuppliers = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/all`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierOptions.value = response.data.data.map((item: { id: UUID; companySupplier: string; }) => ({
            label: item.companySupplier,
            value: item.id
        }));
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// Simpan data ke Pinia & localStorage
const saveDraft = () => {
    const draftData = {
        purchaseSupplier: selectedSupplier.value,
        purchaseType: selectedType.value,
        purchaseAsset: null,
        id: "",
        purchaseId: "",
        purchaseStatus: "",
        purchasePrice: 0,
        purchaseNote: "",
        purchaseSubmissionDate: "",
        purchaseUpdateDate: "",
        purchaseResource: [],
        purchasePaymentDate: null,
        purchaseLogs: []
    };

    purchaseStore.setDraftPurchase(draftData);
};

// Fungsi untuk menangani tombol "Selanjutnya"
const handleNext = () => {
    if (!selectedSupplier.value) {
        useToast().error("Silakan pilih Supplier terlebih dahulu!");
        return;
    }

    saveDraft();

    if (selectedType.value === "Resource") {
        router.push("/purchase/add/resource");
    } else {
        router.push("/purchase/add/asset");
    }
};

// Ambil data dari Pinia saat komponen dimuat
onMounted(() => {
    fetchSuppliers();

    if (purchaseStore.draftPurchase) {
        selectedSupplier.value = purchaseStore.draftPurchase.purchaseSupplier;
        selectedType.value = purchaseStore.draftPurchase.purchaseType ? "Resource" : "Aset";
    }
});

// Watch perubahan tipe barang dan otomatis menyimpan ke store
watch(selectedType, () => {
    saveDraft();
});
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <!-- Header Section -->
        <div class="bg-white shadow-sm border-b border-gray-100">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Breadcrumb />
            </div>
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
                                <h1 class="text-2xl font-bold text-white">Tambah Pembelian Baru</h1>
                                <p class="text-blue-100 mt-1">Langkah pertama - Tambahkan Informasi Dasar</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 text-white/80">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Form Card with Side-by-Side Layout -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="grid grid-cols-12 gap-0">
                    <!-- Left Column - Form Fields -->
                    <div class="col-span-8 p-8 pr-6">
                        <!-- Form Content -->
                        <div class="space-y-8">
                            <!-- Supplier and Type Section - Side by Side -->
                            <div class="group">
                                <div class="flex items-center mb-6">
                                    <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mr-3">
                                        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 8v-2a1 1 0 011-1h2a1 1 0 011 1v2m-4 0h4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 class="text-lg font-semibold text-gray-800">Informasi Pembelian</h2>
                                        <p class="text-sm text-gray-500 mt-1">Pilih supplier dan tentukan tipe barang</p>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-6">
                                    <!-- Supplier Section -->
                                    <div class="form-group">
                                        <label class="form-label">
                                            <span class="label-text">Pilih Supplier</span>
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200">
                                            <VSpecialDropDown 
                                                v-model="selectedSupplier" 
                                                :options="supplierOptions"
                                                class="w-full"
                                            />
                                        </div>
                                    </div>

                                    <!-- Type Section -->
                                    <div class="form-group">
                                        <label class="form-label">
                                            <span class="label-text">Tipe Barang</span>
                                            <span class="text-red-500 ml-1">*</span>
                                        </label>
                                        <div class="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-green-300 transition-colors duration-200">
                                            <VOptionInput 
                                                :options="['Aset', 'Resource']" 
                                                v-model="selectedType"
                                                class="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Info Cards -->
                            <div class="grid grid-cols-2 gap-6">
                                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 8v-2a1 1 0 011-1h2a1 1 0 011 1v2m-4 0h4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-blue-900 mb-2">Aset</h3>
                                            <p class="text-sm text-blue-700">Barang dengan nilai tinggi dan masa pakai panjang seperti komputer, furniture, atau peralatan kantor.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-green-50 border border-green-200 rounded-xl p-6">
                                    <div class="flex items-start space-x-3">
                                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-green-900 mb-2">Resource</h3>
                                            <p class="text-sm text-green-700">Bahan habis pakai seperti alat tulis, supplies kantor, atau bahan operasional sehari-hari.</p>
                                        </div>
                                    </div>
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
                                        <span class="text-gray-600">Supplier:</span>
                                        <span class="font-medium text-gray-900">
                                            {{ supplierOptions.find(s => s.value === selectedSupplier)?.label || '-' }}
                                        </span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Tipe Barang:</span>
                                        <span class="font-medium text-gray-900">{{ selectedType || '-' }}</span>
                                    </div>
                                    <div class="pt-2 border-t border-gray-100">
                                        <div class="flex items-center space-x-2">
                                            <div :class="selectedType === 'Aset' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'" class="w-6 h-6 rounded-full flex items-center justify-center">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path v-if="selectedType === 'Aset'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m0 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-1 8v-2a1 1 0 011-1h2a1 1 0 011 1v2m-4 0h4" />
                                                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                            </div>
                                            <span class="text-xs text-gray-500">{{ selectedType === 'Aset' ? 'Barang Investasi' : 'Bahan Habis Pakai' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Validation Status -->
                            <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
                                <h4 class="text-sm font-medium text-gray-800 mb-3">Status Validasi</h4>
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
                                        <div :class="selectedType ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="w-4 h-4 rounded-full flex items-center justify-center mr-2">
                                            <svg v-if="selectedType" class="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                                                <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                                            </svg>
                                        </div>
                                        <span>Tipe Barang</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Button -->
                            <div class="space-y-3">
                                <VSuccessButton 
                                    :label="selectedSupplier ? 'Lanjutkan ke Detail Barang' : 'Pilih Supplier Dulu'"
                                    @click="handleNext" 
                                    :class="selectedSupplier ? 'btn-primary w-full justify-center' : 'btn-disabled w-full justify-center cursor-not-allowed'"
                                    :disabled="!selectedSupplier"
                                />
                            </div>

                            <!-- Help Text -->
                            <div class="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <h4 class="text-sm font-medium text-yellow-900 mb-2">Tips Pengisian:</h4>
                                <ul class="text-xs text-yellow-800 space-y-1">
                                    <li>• Pilih supplier yang sudah terdaftar</li>
                                    <li>• Pastikan tipe barang sesuai kebutuhan</li>
                                    <li>• Data dapat disimpan sebagai draft</li>
                                    <li>• Lanjutkan ke detail untuk melengkapi</li>
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

/* Custom animations */
.group:hover .hover\:border-blue-300 {
    border-color: #93c5fd;
}

.group:hover .hover\:border-green-300 {
    border-color: #86efac;
}

/* Smooth transitions */
.transition-colors {
    transition-property: color, background-color, border-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
}

/* Responsive improvements */
@media (max-width: 768px) {
    .grid.grid-cols-12 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
    
    .col-span-8,
    .col-span-4 {
        grid-column: span 12 / span 12;
    }
    
    .grid.grid-cols-2 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

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
</style>