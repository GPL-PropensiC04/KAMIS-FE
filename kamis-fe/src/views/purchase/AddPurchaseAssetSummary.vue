<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VCancelButton from "@/components/VCancelButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
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
    return today.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
});

const handleSubmit = async () => {
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
    }
};

// Fungsi Batal
const handleCancel = () => {
    purchaseStore.clearDraftPurchase();
    router.push("/purchase");
};
</script>

<template>
    <Breadcrumb />
    <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            
            <!-- Bagian Atas -->
            <div class="flex justify-between items-center mb-4">
                <div>
                    <p class="text-lg font-bold font-lato">Tanggal Pengajuan</p>
                    <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ currentDate }}</p>
                </div>
                <div class="flex gap-2">
                    <VCancelButton label="Batal" @click="handleCancel" />
                    <VSuccessButton label="Submit" @click="handleSubmit" :disabled="!assetDetails" />
                </div>
            </div>

            <!-- Informasi Supplier & Tipe Barang -->
            <div class="grid grid-cols-2 gap-4 border-b pb-2 mb-4">
                <div>
                    <p class="font-lato font-bold">Supplier</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ supplierName }}</p>
                </div>
                <div>
                    <p class="font-lato font-bold">Tipe Barang</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">Aset</p>
                </div>
            </div>

            <!-- Detail Aset -->
            <div v-if="assetDetails" class="grid grid-cols-2 gap-4">
                <!-- Kolom Kiri (Detail Aset) -->
                <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-0.5 items-center text-sm">
                    <p class="font-lato font-bold">Nama Aset</p>
                    <p class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetName}}</p>

                    <p class="font-lato font-bold">Deskripsi</p>
                    <p class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetDescription }}</p>

                    <p class="font-lato font-bold">Total Harga</p>
                    <p class="pl-5 text-[#1E3A5F] font-lato font-bold">{{ formatCurrency(assetDetails?.assetPrice) }}</p>
                </div>

                <!-- Kolom Kanan (Gambar Aset) -->
                <div class="flex justify-center items-start">
                    <img 
                        :src="imagePreview || '/placeholder-asset.jpg'" 
                        alt="Gambar Aset" 
                        class="rounded-md shadow-md w-[250px] h-auto object-cover"
                    >
                </div>
            </div>

            <!-- Catatan Pembelian -->
            <div class="mt-4">
                <textarea 
                    v-model="purchaseNote" 
                    placeholder="Tambahkan catatan pembelian..."
                    class="w-full border border-[#1E3A5F] p-2 rounded-md bg-[#E5EAF2] font-lato"
                    rows="4"
                ></textarea>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Menggunakan font Lato */
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

.font-lato {
    font-family: 'Lato', sans-serif;
}
</style>
