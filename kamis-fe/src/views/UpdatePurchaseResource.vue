<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { usePurchaseStore } from "../stores/purchase";
import axios from "axios";
import VDropDownInput from "../components/VDropDownInput.vue";
import VNumberInput from "../components/VNumberInput.vue";
import VPriceInput from "../components/VPriceInput.vue";
import VLockedInput from "../components/VLockedInput.vue";
import VButton from "../components/VButton.vue";
import VSuccessButton from "../components/VSuccessButton.vue";
import VCancelButton from "@/components/VCancelButton.vue";
import { useToast } from "vue-toastification";

// Router & Store
const router = useRouter();
const route = useRoute();
const purchaseStore = usePurchaseStore();

// **Ambil purchaseId dari route**
const purchaseId = route.params.purchaseId as string;

// **Data Purchase**
const purchaseDate = ref("");
const selectedSupplier = ref("");
const purchaseType = ref("");
const purchaseNote = ref("");

// **Data Resource**
const resources = ref<{ id: number; name: string }[]>([]);
const selectedResource = ref("");
const quantity = ref(1);
const price = ref(0);
const resourceList = ref<{
  id: number;
  name: string;
  quantity: number;
  price: number;
}[]>([]);

// **Format Tanggal (dd / MM / yyyy)**
const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`;
};

// **Fetch Detail Purchase dari API**
const fetchPurchaseDetail = async () => {
    try {
        const response = await axios.get(`http://localhost:8084/api/purchase/detail/${purchaseId}`, {
            headers: { "Content-Type": "application/json" }
        });

        const data = response.data.data;

        // **Prefill Data**
        purchaseDate.value = formatDate(data.purchaseSubmissionDate);
        selectedSupplier.value = data.purchaseSupplier;
        purchaseType.value = data.purchaseType ? "Resource" : "Aset";
        purchaseNote.value = data.purchaseNote;

        resourceList.value = data.purchaseResource.map((item: { resourceId: number; resourceName: string; resourceTotal: number; resourcePrice: number }) => ({
            id: item.resourceId,
            name: item.resourceName,
            quantity: item.resourceTotal,
            price: item.resourcePrice
        }));

        // **Simpan ke Pinia & LocalStorage**
        updateDraftPurchase();
    } catch (error) {
        console.error("Error fetching purchase details:", error);
    }
};

// **Fetch Data Resource dari API**
const fetchResources = async () => {
    try {
        const response = await axios.get("http://localhost:8085/api/resource/viewall", {
            headers: { "Content-Type": "application/json" }
        });

        resources.value = response.data.data.map((item: { id: number; resourceName: string }) => ({
            id: item.id,
            name: item.resourceName
        }));
    } catch (error) {
        console.error("Error fetching resources:", error);
    }
};

// **Format ke Rupiah**
const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")},00`;
};

// **Hitung Total Harga**
const totalPrice = computed(() => {
    return resourceList.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// **Hapus Resource dari List**
const removeResource = (index: number) => {
    resourceList.value.splice(index, 1);
    updateDraftPurchase();
};

// **Simpan Perubahan ke Store & LocalStorage**
const updateDraftPurchase = () => {
    purchaseStore.setDraftPurchase({
        purchaseSupplier: selectedSupplier.value,
        purchaseType: purchaseType.value,
        items: resourceList.value,
        totalPrice: totalPrice.value,
        purchaseNote: purchaseNote.value,
    });

    localStorage.setItem("draftPurchase", JSON.stringify(purchaseStore.draftPurchase));
};

// **Tambah Resource ke List**
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

    const existingItem = resourceList.value.find((item) => item.id === selectedItem.id);
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


const handleUpdatePurchase = async () => {
    if (resourceList.value.length === 0) {
        useToast().error("Harap tambahkan resource!");
        return;
    }
    
    const body = {
        purchaseSupplier: selectedSupplier.value,
        purchaseNote: purchaseNote.value,
        purchaseResource: resourceList.value.map((item) => ({
            resourceId: item.id,
            resourceName: item.name,
            resourceTotal: item.quantity,
            resourcePrice: item.price,
            quantity: item.quantity
        })),
    };

    await purchaseStore.updatePurchase(body, purchaseId);
    router.push(`/purchase`);
};

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


// **Pastikan Data Prefilled setelah Refresh**
onMounted(() => {
    fetchPurchaseDetail();
    fetchResources();
});

// Handle cancel
const handleCancel = () => {
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
                    <p class="text-[#1E3A5F] text-lg font-lato font-bold">{{ purchaseDate || "-" }}</p>
                </div>
                <div class="flex gap-2">
                    <VCancelButton label="Batal" @click="handleCancel" />
                    <VSuccessButton label="Update" @click="handleUpdatePurchase"/>
                </div>

            </div>

            <!-- Supplier & Tipe Barang -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Supplier</label>
                    <VDropDownInput v-model="selectedSupplier" :options="['Supplier A', 'Supplier B', 'Supplier C']" />
                </div>
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Tipe Barang</label>
                    <VLockedInput :value="purchaseType" />
                </div>
            </div>

            <!-- Tambahkan di dalam <template>, tepat sebelum tabel resource -->
            <div class="grid grid-cols-[2fr_1fr_3fr] gap-4 mt-6 items-end">
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Nama Barang</label>
                    <VDropDownInput v-model="selectedResource" :options="resources.map(item => item.name)" />
                </div>
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Jumlah</label>
                    <VNumberInput v-model="quantity" :min="1" />
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-black mb-1 font-lato font-bold text-lg">Harga Barang</label>
                        <VPriceInput v-model="price" :min="0" class="w-full" />
                    </div>
                    <VButton label="Tambah" @click="addResource" class="mt-auto" />
                </div>
            </div>


            <!-- Tabel Resource -->
            <div class="mt-6" v-if="resourceList.length > 0">
                <table class="w-full border-collapse border border-[#1E3A5F]">
                    <thead>
                        <tr class="bg-[#1E3A5F] text-white">
                            <th class="p-2 border border-[#1E3A5F]">Nama Barang</th>
                            <th class="p-2 border border-[#1E3A5F]">Jumlah</th>
                            <th class="p-2 border border-[#1E3A5F]">Harga Barang</th>
                            <th class="p-2 border border-[#1E3A5F]">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in resourceList" :key="index" class="text-center">
                            <td class="p-2 border border-[#1E3A5F]">{{ item.name }}</td>
                            <td class="p-2 border border-[#1E3A5F]">
                                <div class="flex items-center justify-center gap-2">
                                    <!-- Tombol Kurang (-) -->
                                    <button @click="decreaseQuantity(index)" class="text-red-500 font-bold text-xl hover:text-red-700">
                                        −
                                    </button>

                                    <!-- Input Jumlah (Bisa Diketik) -->
                                    <input 
                                        type="number"
                                        v-model.number="item.quantity"
                                        @change="validateQuantity(index)"
                                        class="w-14 text-center border border-gray-400 rounded no-spinner"
                                        min="1"
                                    />


                                    <!-- Tombol Tambah (+) -->
                                    <button @click="increaseQuantity(index)" class="text-green-500 font-bold text-xl hover:text-green-700">
                                        +
                                    </button>
                                </div>
                            </td>
                            <td class="p-2 border border-[#1E3A5F]">{{ formatCurrency(item.price) }}</td>
                            <td class="p-2 border border-[#1E3A5F]">
                                <button @click="removeResource(index)" class="text-red-500 hover:text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Total Harga -->
            <div class="flex justify-end mt-4 text-lg font-bold">
                <span>Total Harga: {{ formatCurrency(totalPrice) }}</span>
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
