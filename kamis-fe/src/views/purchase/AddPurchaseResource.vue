<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import axios from "axios";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VNumberInput from "@/components/VNumberInput.vue";
import VPriceInput from "@/components/VPriceInput.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import { useToast } from "vue-toastification";
import { API_URLS } from '@/config/api.config';
import Breadcrumb from '@/components/Breadcrumb.vue'

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();

// Mengambil data dari store (pastikan tetap ada setelah refresh)
const supplier = computed(() => purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada");
const purchaseType = computed(() => purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");

// Data awal
const resources = ref<{ id: number; name: string }[]>([]);
const selectedResource = ref("");
const quantity = ref(1);
const price = ref(0);
const resourceList = ref(purchaseStore.draftPurchase?.items || []);

const supplierName = ref<string>(""); 
const fetchSupplierName = async () => {
    try {
        const response = await axios.get(`${API_URLS.PROFILE}/supplier/name/${supplier.value}`, {
            headers: { "Content-Type": "application/json" }
        });

        supplierName.value = response.data.data;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
    }
};

// Fetch data resource dari API
const fetchResources = async () => {
    try {
        const response = await axios.get(`${API_URLS.RESOURCE}/resource/find-by-supplier/${supplier.value}`, {
            headers: { "Content-Type": "application/json" }
        });

        resources.value = response.data.data.map((item: { id: number; resourceName: string; }) => ({
            id: item.id,
            name: item.resourceName
        }));
    } catch (error) {
        console.error("Error fetching resources:", error);
    }
};

// Fungsi untuk memformat angka ke Rp X.XXX.XXX,00
const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")},00`;
};

// Tambah resource ke tabel
const addResource = () => {
    if (!selectedResource.value || quantity.value <= 0 || price.value <= 0) {
        useToast().error("Harap isi semua field dengan benar!");
        return;
    }

    const selectedItem = resources.value.find((item) => item.name === selectedResource.value);
    if (!selectedItem) {
        useToast().error("Resource tidak valid!");
        return;
    }

    const existingItem = resourceList.value.find((item: { id: number; }) => item.id === selectedItem.id);
    if (existingItem) {
        useToast().error("Resource ini sudah ditambahkan!");
        return;
    }

    resourceList.value.push({
        id: selectedItem.id,
        name: selectedItem.name,
        quantity: quantity.value,
        price: price.value,
    });

    updateDraftPurchase();

    selectedResource.value = "";
    quantity.value = 1;
    price.value = 0;
};

// **Fungsi untuk menghapus resource dari daftar**
const removeResource = (index: number) => {
    resourceList.value.splice(index, 1);
    updateDraftPurchase();
};

// **Fungsi untuk menyimpan perubahan ke store & localStorage**
const updateDraftPurchase = () => {
    purchaseStore.setDraftPurchase({
        ...purchaseStore.draftPurchase,
        items: resourceList.value
    });

    localStorage.setItem("draftPurchase", JSON.stringify(purchaseStore.draftPurchase));
};

// Hitung total harga
const totalPrice = computed(() => {
    return resourceList.value.reduce((sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity, 0);
});

// Pastikan data tetap ada setelah refresh
onMounted(() => {
    fetchSupplierName();
    fetchResources();
    const savedData = localStorage.getItem("draftPurchase");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        resourceList.value = parsedData.items || [];
    }
});

// Fungsi untuk menambah jumlah
const increaseQuantity = (index: number) => {
    resourceList.value[index].quantity++;
    updateDraftPurchase();
};

// Fungsi untuk mengurangi jumlah (minimal 1)
const decreaseQuantity = (index: number) => {
    if (resourceList.value[index].quantity > 1) {
        resourceList.value[index].quantity--;
        updateDraftPurchase();
    }
};

// Fungsi untuk validasi input jumlah
const validateQuantity = (index: number) => {
    if (resourceList.value[index].quantity < 1 || isNaN(resourceList.value[index].quantity)) {
        resourceList.value[index].quantity = 1;
    }
    updateDraftPurchase();
};

// Navigasi ke halaman berikutnya
const goToSummary = () => {
    if (resourceList.value.length === 0) {
        useToast().error("Harap tambahkan resource!");
        return;
    }
    purchaseStore.setDraftPurchase({
        ...purchaseStore.draftPurchase,
        items: resourceList.value,
        totalPrice: totalPrice.value,
    });

    localStorage.setItem("draftPurchase", JSON.stringify(purchaseStore.draftPurchase));

    router.push("/purchase/add/resource-summary");
};
</script>

<template>
    <Breadcrumb />
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header Section with Breadcrumb -->
        <div class="bg-white shadow-sm border-b border-gray-100">
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Main Content Container -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                
                <!-- Header Section -->
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <button 
                                @click="router.back()" 
                                class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
                            >
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-white">Tambah Resource Purchase</h1>
                                <p class="text-blue-100 mt-1">Kelola dan tambahkan item resource untuk pembelian</p>
                            </div>
                        </div>
                        <VSuccessButton label="Lanjutkan" @click="goToSummary" class="shadow-lg" />
                    </div>
                </div>

                <!-- Content Section -->
                <div class="px-8 py-6">
                    
                    <!-- Supplier & Type Info Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500 uppercase tracking-wide">Supplier</label>
                                    <p class="text-lg font-semibold text-gray-900 mt-1">{{ supplierName || 'Loading...' }}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                            <div class="flex items-center space-x-3 mb-3">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <label class="text-sm font-medium text-gray-500 uppercase tracking-wide">Tipe Barang</label>
                                    <p class="text-lg font-semibold text-gray-900 mt-1">{{ purchaseType }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Add Item Form -->
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Item Baru
                        </h3>
                        
                        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                            <div class="lg:col-span-5">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nama Barang</label>
                                <VDropDownInput 
                                    v-model="selectedResource" 
                                    :options="resources.map(item => item.name)" 
                                    class="w-full"
                                />
                            </div>
                            
                            <div class="lg:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
                                <VNumberInput v-model="quantity" :min="1" class="w-full" />
                            </div>
                            
                            <div class="lg:col-span-3">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Harga Barang</label>
                                <VPriceInput v-model="price" :min="0" class="w-full" />
                            </div>
                            
                            <div class="lg:col-span-2">
                                <VButton 
                                    label="Tambah Item" 
                                    @click="addResource" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div v-if="resourceList.length > 0" class="mb-8">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                                <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Daftar Item ({{ resourceList.length }})
                            </h3>
                        </div>
                        
                        <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                            <table class="w-full divide-y divide-gray-200">
                                <thead class="bg-gradient-to-r from-gray-800 to-gray-900">
                                    <tr>
                                        <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nama Barang</th>
                                        <th class="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Jumlah</th>
                                        <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Harga Satuan</th>
                                        <th class="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                                        <th class="px-6 py-4 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="(item, index) in resourceList" :key="index" class="hover:bg-gray-50 transition-colors duration-150">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center">
                                            <div class="flex items-center justify-center space-x-2">
                                                <button 
                                                    @click="decreaseQuantity(index)" 
                                                    class="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold transition-colors duration-150 flex items-center justify-center"
                                                    :disabled="resourceList[index].quantity <= 1"
                                                    :class="{ 'opacity-50 cursor-not-allowed': resourceList[index].quantity <= 1 }"
                                                >
                                                    −
                                                </button>
                                                
                                                <input 
                                                    type="number"
                                                    v-model.number="resourceList[index].quantity"
                                                    @change="validateQuantity(index)"
                                                    class="w-16 text-center border border-gray-300 rounded-lg py-1 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinner"
                                                    min="1"
                                                />
                                                
                                                <button 
                                                    @click="increaseQuantity(index)" 
                                                    class="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 font-bold transition-colors duration-150 flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            {{ formatCurrency(item.price) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                                            {{ formatCurrency(item.price * item.quantity) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center">
                                            <button 
                                                @click="removeResource(index)" 
                                                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors duration-150"
                                            >
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-12">
                        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada item</h3>
                        <p class="text-gray-500">Tambahkan item resource menggunakan form di atas</p>
                    </div>

                    <!-- Total Section -->
                    <div v-if="resourceList.length > 0" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-gray-600">Total Keseluruhan</p>
                                    <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalPrice) }}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-500">{{ resourceList.length }} item</p>
                                <p class="text-sm text-gray-500">{{ resourceList.reduce((sum : any, item : any) => sum + item.quantity, 0) }} total unit</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Hilangkan spinner pada input number */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.no-spinner {
    -moz-appearance: textfield; /* Firefox */
}

/* Smooth transitions */
* {
    transition: all 0.2s ease-in-out;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>