<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "../stores/purchase";
import VCancelButton from "../components/VCancelButton.vue";
import VSuccessButton from "../components/VSuccessButton.vue";

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();

// Ambil ID aset dari Pinia/localStorage
const idAsset = computed(() => purchaseStore.draftPurchase?.purchaseAsset || null);

// State
const assetDetails = ref(null);
const purchaseNote = ref("");

// Fetch data aset dari API berdasarkan `idAsset`
const fetchAssetDetails = async () => {
    if (!idAsset.value) {
        alert("ID Aset tidak ditemukan!");
        router.push("/purchase");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8084/api/purchase/asset/${idAsset.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc0MjIyNDM1MywiZXhwIjoxNzQyMzEwNzUzfQ.J70CZ19O39Yc447iOaLXPyaaoaQNCVSVlzX1Kb3vF3idCVorhctLiKXTwYd11M4U4Jy7Td6IrDAjf6GmnksWAHjRdO15juVmARmLxQ9elG0tW7wb1tbw7kie0QChS_F3MmIt7yfN1zgihtaQivOWMBhJlNPOPbtsC_XTXllwgveRzrGHnBIIOs75_EUit8MhiPnGbNehZRQsW6irOJm_EoaFZIgZW76xI5WDRQjEJ7MnskIdRSi1E9jzFky7fzqthWPDK4-ibcmrJ-sDQ2vkDYznnCMDb0Jxzj-LOvSbHkRwbkcOj4WoatuXWcesczq7oOXc-xNvgoUPKv71e1iMDA` // Token Autentikasi
            }
        });

        if (!response.ok) {
            throw new Error("Gagal mengambil data aset.");
        }

        const data = await response.json();
        assetDetails.value = data.data;
    } catch (error) {
        console.error("Error fetching asset details:", error);
    }
};

// Format harga
const formatCurrency = (value ) => {
    return `Rp ${parseInt(value || 0).toLocaleString("id-ID")},00`;
};

// Tanggal hari ini
const currentDate = computed(() => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
});

// Fungsi Submit menggunakan `addPurchase`
const handleSubmit = async () => {
    if (!assetDetails.value) return;

    const purchaseData = {
        purchaseSupplier: purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada",
        purchaseType: false, // Karena ini aset
        purchaseAsset: idAsset.value, // ✅ **Ambil ID aset dari Pinia**
        purchaseNote: purchaseNote.value
    };

    // Kirim ke API menggunakan metode `addPurchase()`
    await purchaseStore.addPurchase(purchaseData);
    purchaseStore.clearDraftPurchase();
};

// Fungsi Batal
const handleCancel = () => {
    purchaseStore.clearDraftPurchase();
    router.push("/purchase");
};

// Fetch data saat halaman dimuat
onMounted(() => {
    fetchAssetDetails();
});
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
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetNameString }}</p>

                    <p class="font-lato font-bold">Deskripsi</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ assetDetails.assetDescription }}</p>

                    <p class="font-lato font-bold">Total Harga</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ formatCurrency(assetDetails?.assetPrice) }}</p>
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
