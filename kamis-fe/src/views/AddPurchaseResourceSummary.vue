<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import VCancelButton from "@/components/VCancelButton.vue";
import { useToast } from "vue-toastification";

// Router, Store, & Toast
const router = useRouter();
const purchaseStore = usePurchaseStore();
const toast = useToast();

// Data dari store
const supplier = computed(() => purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada");
const purchaseType = computed(() => purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");
const purchaseItems = ref(purchaseStore.draftPurchase?.items || []);
const purchaseNote = ref("");

// **Tanggal Pengajuan Otomatis**
const submissionDate = ref("");

// Fungsi untuk mengatur tanggal hari ini
const setTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    submissionDate.value = `${day} / ${month} / ${year}`;
};

// **Hitung Total Harga**
const totalPrice = computed(() => {
    return purchaseItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// **Handle Submit (Memanggil addPurchase API)**
const handleSubmit = async () => {
    if (purchaseItems.value.length === 0) {
        toast.error("Tambahkan barang sebelum mengajukan pembelian!");
        return;
    }

    // **Siapkan payload untuk API**
    const purchaseData = {
        purchaseSupplier: supplier.value,
        purchaseType: purchaseType.value === "Resource",
        purchaseNote: purchaseNote.value,
        purchaseResource: purchaseItems.value.map(item => ({
            resourceId: item.id,  // **Tambahkan ID dari database**
            resourceName: item.name,
            resourceTotal: item.quantity,
            resourcePrice: item.price
        }))
    };

    try {
        await purchaseStore.addPurchase(purchaseData);
        purchaseStore.clearDraftPurchase();
        toast.success("Pembelian berhasil diajukan!");
        router.push("/purchase");
    } catch (error) {
        toast.error("Gagal mengajukan pembelian.");
        console.error(error);
    }
};

// **Handle Cancel (Batal)**
const handleCancel = () => {
    purchaseStore.clearDraftPurchase();
    router.push("/purchase");
};

// **Pastikan Tanggal Terisi Saat Komponen Dimuat**
onMounted(setTodayDate);
</script>

<template>
    <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <!-- Bagian Atas -->
            <div class="flex justify-between items-center mb-4">
                <div>
                    <p class="text-lg font-bold font-lato">Tanggal Pengajuan</p>
                    <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ submissionDate }}</p>
                </div>
                <div class="flex gap-2">
                    <VCancelButton label="Batal" @click="handleCancel" />
                    <VSuccessButton label="Submit" @click="handleSubmit" />
                </div>
            </div>

            <!-- Informasi Supplier & Tipe Barang -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p class="font-lato font-bold">Supplier</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ supplier }}</p>
                </div>
                <div>
                    <p class="font-lato font-bold">Tipe Barang</p>
                    <p class="text-[#1E3A5F] font-lato font-bold">{{ purchaseType }}</p>
                </div>
            </div>

            <!-- Tabel Barang -->
            <div>
                <table class="w-full border-collapse border border-[#1E3A5F]">
                    <thead>
                        <tr class="bg-[#1E3A5F] text-white">
                            <th class="p-2 border border-[#1E3A5F]">Nama Barang</th>
                            <th class="p-2 border border-[#1E3A5F]">Jumlah</th>
                            <th class="p-2 border border-[#1E3A5F]">Harga Barang</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in purchaseItems" :key="index" class="text-center">
                            <td class="p-2 border border-[#1E3A5F]">{{ item.name }}</td>
                            <td class="p-2 border border-[#1E3A5F]">{{ item.quantity }}</td>
                            <td class="p-2 border border-[#1E3A5F]">Rp{{ item.price.toLocaleString("id-ID") }},00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Total Harga -->
            <div class="flex justify-end mt-4 text-lg font-bold">
                <span>Total Harga: Rp{{ totalPrice.toLocaleString("id-ID") }},00</span>
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
