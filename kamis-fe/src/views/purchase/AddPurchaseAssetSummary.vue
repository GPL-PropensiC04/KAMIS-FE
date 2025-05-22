<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import { useAssetTempStore } from "@/stores/assetTemp";
import type { AddAssetTemp } from "@/interfaces/purchase/assettemp.interface";
import { API_URLS } from "@/config/api.config";
import axios from "axios";
import Breadcrumb from "@/components/Breadcrumb.vue";

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();
const assetTempStore = useAssetTempStore();

// State
const assetDetails = ref(assetTempStore.draftAssetTemp);
const purchaseNote = ref("");
const fileObject = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isSubmitting = ref(false);

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

// Create File object from base64 when component mounts
onMounted(() => {
    fetchSupplierName();
  // Get the base64 data from sessionStorage
  const base64Data = sessionStorage.getItem('tempFileData');
  
  if (base64Data && assetDetails.value?.fileName && assetDetails.value?.contentType) {
    // Set the image preview
    imagePreview.value = base64Data;
    
    // Convert base64 to Blob
    const byteString = atob(base64Data.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: assetDetails.value.contentType });
    
    // Create File object
    fileObject.value = new File(
      [blob], 
      assetDetails.value.fileName, 
      { type: assetDetails.value.contentType }
    );
    
    console.log('Created File object from sessionStorage data');
    console.log(`File size: ${Math.round(fileObject.value.size / 1024)} KB`);
  }
});

// Format harga
const formatCurrency = (value: number) => {
    return `Rp ${parseInt(String(value || 0)).toLocaleString("id-ID")},00`;
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

const handleSubmit = async () => {
    if (isSubmitting.value) return;
    
    isSubmitting.value = true;
    
    try {
        // Create asset data object that matches the AddAssetTemp interface
        const assetData: AddAssetTemp = {
            assetName: assetDetails.value.assetName,
            assetDescription: assetDetails.value.assetDescription,
            assetType: assetDetails.value.assetType,
            assetPrice: assetDetails.value.assetPrice,
        };

        // If we have reconstructed the File object successfully
        if (fileObject.value instanceof File) {
            console.log('Submitting with reconstructed File object');
            console.log(`File name: ${fileObject.value.name}, size: ${Math.round(fileObject.value.size / 1024)} KB`);
            assetData.foto = fileObject.value;
        } else if (imagePreview.value) {
            // Convert base64 to File object if file reconstruction failed
            console.log('Converting base64 image to File object');
            
            // Extract the content type and base64 data
            const matches = imagePreview.value.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
            
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                const byteCharacters = atob(base64Data);
                const byteArrays = [];
                
                for (let i = 0; i < byteCharacters.length; i += 512) {
                    const slice = byteCharacters.slice(i, i + 512);
                    const byteNumbers = new Array(slice.length);
                    
                    for (let j = 0; j < slice.length; j++) {
                        byteNumbers[j] = slice.charCodeAt(j);
                    }
                    
                    byteArrays.push(new Uint8Array(byteNumbers));
                }
                
                const blob = new Blob(byteArrays, { type: contentType });
                const fileName = `asset_image_${Date.now()}.${contentType.split('/')[1] || 'jpg'}`;
                
                // Create a File object from the blob
                assetData.foto = new File([blob], fileName, { type: contentType });
                assetData.fotoContentType = contentType;
                
                console.log(`Created File from base64: ${fileName}, size: ${Math.round(assetData.foto.size / 1024)} KB`);
            } else {
                throw new Error("Invalid base64 image format");
            }
        }

        // Use the store method instead of direct API call
        await assetTempStore.addAssetTemp(assetData);

        const idAsset = assetTempStore.assetTemps.at(-1)?.id;
        console.log("Asset added, id:", idAsset);

        // Ensure idAsset valid before sending data to backend
        if (!idAsset || isNaN(idAsset)) {
            throw new Error("Gagal mendapatkan ID Aset.");
        }

        const purchaseData = {
            purchaseSupplier: purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada",
            purchaseType: false, // Karena ini aset
            purchaseAsset: Number(idAsset),
            purchaseNote: purchaseNote.value
        };

        console.log("Mengirim purchaseData:", purchaseData);

        // Send purchase data to API
        await purchaseStore.addPurchase(purchaseData);

        // Clear drafts after successful submission
        purchaseStore.clearDraftPurchase();
        assetTempStore.clearDraftAssetTemp();
        sessionStorage.removeItem('tempFileData'); // Clean up temporary file data
        
        // Navigate back to purchase list
        router.push("/purchase");
    } catch (error) {
        console.error("Error saat submit pembelian:", error);
    } finally {
        isSubmitting.value = false;
    }
};

const handleBack = () => {
    router.back();
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
                                @click="handleBack" 
                                class="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 text-white hover:scale-105 transform"
                                title="Kembali"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                            </button>
                            <div>
                                <h1 class="text-2xl font-bold text-white">Ringkasan Pembelian Aset</h1>
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
                            <button 
                                @click="handleSubmit" 
                                :disabled="!assetDetails || isSubmitting"
                                :class="[
                                    'px-6 py-2.5 font-medium rounded-lg transition-all duration-200 flex items-center space-x-2',
                                    (!assetDetails || isSubmitting) 
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
                            </button>
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
                            <div class="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-600 mb-1">Tipe Barang</p>
                                <div class="flex items-center space-x-2">
                                    <span class="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                                        Aset
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Asset Details -->
                <div v-if="assetDetails" class="p-8">
                    <div class="grid grid-cols-12 gap-8">
                        <!-- Left Column - Asset Information -->
                        <div class="col-span-7">
                            <div class="flex items-center mb-6">
                                <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mr-3">
                                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2"></path>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">Detail Aset</h3>
                            </div>

                            <div class="space-y-6">
                                <!-- Asset Name -->
                                <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mt-1">
                                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-600 mb-1">Nama Aset</p>
                                        <p class="text-[#1E3A5F] text-lg font-bold">{{ assetDetails.assetName }}</p>
                                    </div>
                                </div>

                                <!-- Asset Type -->
                                <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div class="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg mt-1">
                                        <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-600 mb-1">Jenis Aset</p>
                                        <span class="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                                            {{ assetDetails.assetType }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Asset Description -->
                                <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div class="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mt-1">
                                        <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-600 mb-2">Deskripsi Aset</p>
                                        <p class="text-gray-800 text-sm leading-relaxed">{{ assetDetails.assetDescription }}</p>
                                    </div>
                                </div>

                                <!-- Asset Price -->
                                <div class="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mt-1">
                                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium text-gray-600 mb-1">Total Harga</p>
                                        <p class="text-green-700 text-2xl font-bold">{{ formatCurrency(assetDetails?.assetPrice) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Asset Image -->
                        <div class="col-span-5">
                            <div class="flex items-center mb-6">
                                <div class="flex items-center justify-center w-8 h-8 bg-pink-100 rounded-lg mr-3">
                                    <svg class="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <h3 class="text-xl font-bold text-gray-800">Foto Aset</h3>
                            </div>

                            <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                                <div class="relative group">
                                    <img 
                                        :src="imagePreview || '/placeholder-asset.jpg'"
                                        alt="Gambar Aset" 
                                        class="w-full h-80 object-cover rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg transition-shadow duration-200"
                                    >
                                </div>
                                <div v-if="fileObject" class="mt-4 flex items-center justify-center">
                                    <div class="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                        </svg>
                                        <span class="text-sm text-gray-600">{{ Math.round(fileObject.size / 1024) }} KB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Purchase Notes -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
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
/* Responsive design */
@media (max-width: 768px) {
    .grid-cols-12 {
        grid-template-columns: repeat(2, 1fr);
    }
}
@media (max-width: 640px) {
    .grid-cols-12 {
        grid-template-columns: 1fr;
    }
}
</style>