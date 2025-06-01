<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VSuccessButton from "@/components/VSuccessButton.vue";
import { useToast } from "vue-toastification";
import axios from "axios";
import { API_URLS } from "@/config/api.config";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Router, Store, & Toast
const router = useRouter();
const purchaseStore = usePurchaseStore();
const toast = useToast();

// State
const isSubmitting = ref(false);

// Data dari store
const supplier = computed(() => purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada");
const purchaseType = computed(() => purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");
const purchaseItems = ref(purchaseStore.draftPurchase?.items || []);
const purchaseNote = ref("");

const supplierName = ref<string>(""); 
const fetchSupplierName = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/name/${purchaseStore.draftPurchase?.purchaseSupplier}`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierName.value = response.data.data;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// Tanggal hari ini
const currentDate = computed(() => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", { 
        weekday: 'long',
        day: "2-digit", 
        month: "long", 
        year: "numeric" 
    });
});

// **Hitung Total Harga**
const totalPrice = computed(() => {
    return purchaseItems.value.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);
});

// Format harga
const formatCurrency = (value: number) => {
    return `Rp ${parseInt(String(value || 0)).toLocaleString("id-ID")},00`;
};

// **Handle Submit (Memanggil addPurchase API)**
const handleSubmit = async () => {
    if (isSubmitting.value) return;
    
    if (purchaseItems.value.length === 0) {
        toast.error("Tambahkan barang sebelum mengajukan pembelian!");
        return;
    }

    isSubmitting.value = true;

    // **Siapkan payload untuk API**
    const purchaseData = {
        purchaseSupplier: supplier.value,
        purchaseType: purchaseType.value === "Resource",
        purchaseNote: purchaseNote.value,
        purchaseResource: purchaseItems.value.map((item: { id: any; name: any; quantity: any; price: any; }) => ({
            resourceId: item.id,  // **Tambahkan ID dari database**
            resourceName: item.name,
            resourceTotal: item.quantity,
            resourcePrice: item.price
        }))
    };

    try {
        await purchaseStore.addPurchase(purchaseData);
        purchaseStore.clearDraftPurchase();
        router.push("/purchase");
    } catch (error) {
        toast.error("Gagal mengajukan pembelian.");
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};

const handleBack = () => {
    router.back();
};

// **Pastikan Data Terisi Saat Komponen Dimuat**
onMounted(() => {
    fetchSupplierName();
});
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
                                @click="handleBack" 
                                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                                title="Kembali"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-white">Ringkasan Pembelian Resource</h1>
                                <p class="text-blue-100 mt-1">Verifikasi data sebelum submit pembelian</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 text-white/80">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <!-- Date and Actions Header -->
                <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 class="text-lg font-bold text-gray-800">Tanggal Pengajuan</h2>
                                <p class="text-[#1E3A5F] text-base font-semibold">{{ currentDate }}</p>
                            </div>
                        </div>
                        <div class="flex space-x-3">
                            <VSuccessButton 
                                label="Submit Pembelian"
                                @click="handleSubmit" 
                                :disabled="purchaseItems.length === 0 || isSubmitting"
                                :class="[
                                    'px-6 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center space-x-2',
                                    (purchaseItems.length === 0 || isSubmitting) 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 transform shadow-lg hover:shadow-xl'
                                ]"
                            >
                                <svg v-if="isSubmitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>{{ isSubmitting ? 'Memproses...' : 'Submit Pembelian' }}</span>
                            </VSuccessButton>
                        </div>
                    </div>
                </div>

                <!-- Purchase Information -->
                <div class="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <div class="grid grid-cols-2 gap-8">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                                <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 mb-1">Supplier</p>
                                <p class="text-[#1E3A5F] text-lg font-bold">{{ supplierName || 'Loading...' }}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 mb-1">Tipe Barang</p>
                                <div class="flex items-center space-x-2">
                                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                        {{ purchaseType }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resource Details -->
                <div class="p-8">
                    <!-- Resource Items Header -->
                    <div class="flex items-center mb-6">
                        <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">Daftar Resource</h3>
                    </div>

                    <!-- Resource Items Table -->
                    <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 mb-8">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-[#1E3A5F] text-white">
                                        <th class="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider rounded-tl-lg">
                                            <div class="flex items-center space-x-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                                </svg>
                                                <span>Nama Resource</span>
                                            </div>
                                        </th>
                                        <th class="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                                            <div class="flex items-center justify-center space-x-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                                                </svg>
                                                <span>Jumlah</span>
                                            </div>
                                        </th>
                                        <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                                            <div class="flex items-center justify-end space-x-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                                </svg>
                                                <span>Harga Satuan</span>
                                            </div>
                                        </th>
                                        <th class="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider rounded-tr-lg">
                                            <div class="flex items-center justify-end space-x-2">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                                </svg>
                                                <span>Total</span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="(item, index) in purchaseItems" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center space-x-3">
                                                <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                                    </svg>
                                                </div>
                                                <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center">
                                            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                                {{ item.quantity }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            {{ formatCurrency(item.price) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-700">
                                            {{ formatCurrency(item.price * item.quantity) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Total Price Section -->
                        <div class="mt-6 pt-6 border-t border-gray-300">
                            <div class="flex justify-end">
                                <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                                            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium text-gray-600 mb-1">Total Harga Keseluruhan</p>
                                            <p class="text-green-700 text-2xl font-bold">{{ formatCurrency(totalPrice) }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Purchase Notes -->
                    <div class="pt-6 border-t border-gray-200">
                        <div class="flex items-center mb-4">
                            <div class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3">
                                <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-800">Catatan Pembelian</h3>
                        </div>

                        <div class="relative">
                            <textarea 
                                v-model="purchaseNote" 
                                placeholder="Tambahkan catatan khusus untuk pembelian ini (opsional)..."
                                class="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                rows="4"
                            ></textarea>
                            <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                                {{ purchaseNote.length }}/500
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

.grid > div {
    animation: slideIn 0.3s ease-out;
}

/* Smooth transitions */
button, input, textarea {
    transition: all 0.2s ease;
}

/* Custom scrollbar for textarea */
textarea::-webkit-scrollbar {
    width: 6px;
}

textarea::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}

/* Table hover effects */
tbody tr:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive design */
@media (max-width: 768px) {
    .grid-cols-2 {
        grid-template-columns: 1fr;
    }
    
    .px-8 {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    
    .overflow-x-auto {
        overflow-x: scroll;
    }
}

@media (max-width: 640px) {
    .flex-col {
        flex-direction: column;
    }
    
    .space-x-3 > * + * {
        margin-left: 0;
        margin-top: 0.75rem;
    }
}
</style>