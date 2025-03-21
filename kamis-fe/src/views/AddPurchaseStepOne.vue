<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VOptionInput from "@/components/VOptionInput.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";
import { useToast } from "vue-toastification";

const router = useRouter();
const purchaseStore = usePurchaseStore();

// Data form
const supplierOptions = ["Supplier A", "Supplier B", "Supplier C"];
const selectedSupplier = ref(purchaseStore.draftPurchase?.purchaseSupplier || "");
const selectedType = ref(purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");

// Simpan data ke Pinia & localStorage
const saveDraft = () => {
    const draftData = {
        purchaseSupplier: selectedSupplier.value,
        purchaseType: selectedType.value === "Resource",
        purchaseAsset: null,
        purchaseStatus: 'PENDING',
        id: '',
        purchaseId: '',
        purchasePrice: 0,
        purchaseNote: '',
        purchaseSubmissionDate: new Date().toISOString(),
        purchaseUpdateDate: new Date().toISOString(),
        purchaseResource: []
    };
    
    purchaseStore.setDraftPurchase(draftData);
};

// Fungsi untuk menangani tombol "Selanjutnya"
const handleNext = () => {
    if (!selectedSupplier.value) {
        useToast().error("Silakan pilih Supplier terlebih dahulu!");
        return;
    }

    saveDraft(); // Simpan data sebelum berpindah halaman

    // Pindahkan halaman berdasarkan tipe barang
    if (selectedType.value === "Resource") {
        router.push("/purchase/add/resource");
    } else {
        router.push("/purchase/add/asset"); //nanti gunakan yang ini
    }
};

// Ambil data dari Pinia saat komponen dimuat
onMounted(() => {
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
    <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
        <div class="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
            <!-- Tombol Back -->
            <button @click="router.back()" class="hover:underline flex items-center mb-4 text-[28px]">
                ←
            </button>

            <div class="grid grid-cols-2 gap-4">
                <!-- Dropdown Supplier -->
                <div>
                    <label class="block mb-1 font-lato font-bold">
                        Supplier
                    </label>
                    <VDropDownInput v-model="selectedSupplier" :options="supplierOptions" />
                </div>

                <!-- Pilihan Tipe Barang -->
                <div>
                    <label class="block mb-1 font-lato font-bold">
                        Tipe Barang
                    </label>
                    <VOptionInput :options="['Aset', 'Resource']" v-model="selectedType" />
                </div>
            </div>

            <!-- Tombol Selanjutnya -->
            <div class="flex justify-center mt-6">
                <VSuccessButton label="Selanjutnya" @click="handleNext" />
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
