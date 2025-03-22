<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePurchaseStore } from "../stores/purchase";
import axios from "axios";
import VDropDownInput from "../components/VDropDownInput.vue";
import VCancelButton from "../components/VCancelButton.vue";
import VSuccessButton from "../components/VSuccessButton.vue";
import type { AssetTempInterface } from "../interfaces/assettemp.interface";
// Router & Store
const router = useRouter();
const route = useRoute();
const purchaseStore = usePurchaseStore();

// Ambil ID pembelian dari route
const purchaseId = route.params.purchaseId as string;

// State
const purchaseDate = ref(""); // Tanggal Pengajuan
const selectedSupplier = ref(""); // Supplier yang bisa diubah
const purchaseNote = ref(""); // Catatan yang bisa diubah
const assetDetails = ref<AssetTempInterface>(); // Data aset
// const assetImage = ref(""); // URL gambar aset

// Opsi dropdown supplier
const supplierOptions = ["Supplier A", "Supplier B", "Supplier C"];

// Format tanggal (dd / MM / yyyy)
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
};

// Fetch data purchase detail dari API
const fetchPurchaseDetail = async () => {
    try {
        const response = await axios.get(`http://localhost:8084/api/purchase/detail/${purchaseId}`, {
            headers: { "Content-Type": "application/json" }
        });

        const data = response.data.data;

        // Prefill data dari API
        purchaseDate.value = formatDate(data.purchaseSubmissionDate);
        selectedSupplier.value = data.purchaseSupplier;
        purchaseNote.value = data.purchaseNote;
        assetDetails.value = data.purchaseAsset; // Ambil detail aset dari API

    } catch (error) {
        console.error("Error fetching purchase details:", error);
    }
};

// Format harga ke rupiah
const formatCurrency = (value: number) => {
    return `Rp ${parseInt(String(value) || "0").toLocaleString("id-ID")},00`;
};

// Handle update purchase
const handleUpdatePurchase = async () => {
    if (!assetDetails.value) return;

    const body = {
        purchaseSupplier: selectedSupplier.value,
        purchaseNote: purchaseNote.value,
        purchaseAsset: assetDetails.value.assetId // Kirim ID aset
    };

    await purchaseStore.updatePurchase(body, purchaseId);
    router.push("/purchase");
};

// Handle cancel
const handleCancel = () => {
    router.push("/purchase");
};

// Fetch data saat halaman dimuat
onMounted(() => {
    fetchPurchaseDetail();
});
</script>

<template>
    <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            
            <!-- Bagian Atas -->
            <div class="flex justify-between items-center mb-4">
                <div>
                    <p class="text-lg font-bold font-lato">Tanggal Pengajuan</p>
                    <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchaseDate || "-" }}</p>
                </div>
                <div class="flex gap-2">
                    <VCancelButton label="Batal" @click="handleCancel" />
                    <VSuccessButton label="Update" @click="handleUpdatePurchase" :disabled="!assetDetails" />
                </div>
            </div>

            <!-- Informasi Supplier & Tipe Barang -->
            <div class="grid grid-cols-2 gap-4 border-b pb-2 mb-4">
                <div>
                    <p class="font-lato font-bold">Supplier</p>
                    <VDropDownInput v-model="selectedSupplier" :options="supplierOptions" class="w-full" />
                </div>
                <div>
                    <p class="font-lato font-bold">Tipe Barang</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">Aset</p>
                </div>
            </div>

            <!-- Detail Aset -->
            <div v-if="assetDetails" class="grid grid-cols-2 gap-4">
                <!-- Kolom Kiri (Detail Aset) -->
                <div class="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-center">
                    <p class="font-lato font-bold">Nama Aset</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetNameString }}</p>

                    <p class="font-lato font-bold">Deskripsi</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetDescription }}</p>

                    <p class="font-lato font-bold">Total Harga</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ formatCurrency(assetDetails.assetPrice) }}</p>
                </div>

                <!-- Kolom Kanan (Gambar Aset) -->
                <div class="flex justify-center items-start">
                    <img :src="assetDetails.fotoUrl" alt="Gambar Aset" class="rounded-md shadow-md w-[250px] h-auto object-cover">
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
