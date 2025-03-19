<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "../stores/purchase";
import axios from "axios";
import VCancelButton from "../components/VCancelButton.vue";
import VSuccessButton from "../components/VSuccessButton.vue";
import { useAssetTempStore } from "@/stores/assetTemp";

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();
const assetTempStore = useAssetTempStore();

// State
const assetDetails = ref(assetTempStore.draftAssetTemp);
const purchaseNote = ref("");

// Format harga
const formatCurrency = (value ) => {
    return `Rp ${parseInt(value || 0).toLocaleString("id-ID")},00`;
};

// Tanggal hari ini
const currentDate = computed(() => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
});

const handleSubmit = async () => {
    try {
        // 🔹 Tunggu ID Aset dari addAssetTemp()
        await assetTempStore.addAssetTemp(assetTempStore.draftAssetTemp);

        const idAsset = assetTempStore.assetTemps.at(-1)?.id
        console.log(assetTempStore.assetTemps)

        // 🔹 Pastikan idAsset valid sebelum mengirim data ke backend
        if (!idAsset || isNaN(idAsset)) {
            throw new Error("Gagal mendapatkan ID Aset.");
        }

        const purchaseData = {
            purchaseSupplier: purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada",
            purchaseType: false, // Karena ini aset
            purchaseAsset: Number(idAsset), // ✅ Konversi ke Number
            purchaseNote: purchaseNote.value
        };

        console.log("Mengirim purchaseData:", purchaseData); // 🔍 Debugging

        // 🔹 Kirim data pembelian ke API
        await purchaseStore.addPurchase(purchaseData);

        // 🔹 Hapus draft setelah berhasil submit
        purchaseStore.clearDraftPurchase();
        assetTempStore.clearDraftAssetTemp();
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
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada" }}</p>
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
                    <img :src="assetDetails.imageUrl" alt="Gambar Aset" class="rounded-md shadow-md w-[250px] h-auto object-cover">
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
