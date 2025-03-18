<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "@/stores/purchase";
import VDropDownInput from "@/components/VDropDownInput.vue";
import VNumberInput from "@/components/VNumberInput.vue";
import VPriceInput from "@/components/VPriceInput.vue";
import VLockedInput from "@/components/VLockedInput.vue";
import VButton from "@/components/VButton.vue";
import VSuccessButton from "@/components/VSuccessButton.vue";

// Router & Store
const router = useRouter();
const purchaseStore = usePurchaseStore();

// Mengambil data dari store (pastikan tetap ada setelah refresh)
const supplier = computed(() => purchaseStore.draftPurchase?.purchaseSupplier || "Tidak Ada");
const purchaseType = computed(() => purchaseStore.draftPurchase?.purchaseType ? "Resource" : "Aset");

// Data awal
const resources = ref([]);
const selectedResource = ref("");
const quantity = ref(1);
const price = ref(0);
const resourceList = ref(purchaseStore.draftPurchase?.items || []);

// Fetch data resource dari API
const fetchResources = async () => {
    try {
        const response = await fetch("http://localhost:8085/api/resource/viewall", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsImlhdCI6MTc0MjIyNDM1MywiZXhwIjoxNzQyMzEwNzUzfQ.J70CZ19O39Yc447iOaLXPyaaoaQNCVSVlzX1Kb3vF3idCVorhctLiKXTwYd11M4U4Jy7Td6IrDAjf6GmnksWAHjRdO15juVmARmLxQ9elG0tW7wb1tbw7kie0QChS_F3MmIt7yfN1zgihtaQivOWMBhJlNPOPbtsC_XTXllwgveRzrGHnBIIOs75_EUit8MhiPnGbNehZRQsW6irOJm_EoaFZIgZW76xI5WDRQjEJ7MnskIdRSi1E9jzFky7fzqthWPDK4-ibcmrJ-sDQ2vkDYznnCMDb0Jxzj-LOvSbHkRwbkcOj4WoatuXWcesczq7oOXc-xNvgoUPKv71e1iMDA` // Token Otentikasi
            }
        });
        const data = await response.json();

        // **Pastikan kita menyimpan ID dan Nama**
        resources.value = data.data.map(item => ({
            id: item.id,
            name: item.resourceName
        }));
    } catch (error) {
        console.error("Error fetching resources:", error);
    }
};

// Fungsi untuk memformat angka ke Rp X.XXX.XXX,00
const formatCurrency = (value) => {
    let number = parseInt(value) || 0;
    return `Rp ${number.toLocaleString("id-ID")},00`;
};

// Tambah resource ke tabel
const addResource = () => {
    if (!selectedResource.value || quantity.value <= 0 || price.value <= 0) {
        alert("Harap isi semua field dengan benar!");
        return;
    }

    // **Temukan ID berdasarkan nama yang dipilih**
    const selectedItem = resources.value.find(item => item.name === selectedResource.value);
    if (!selectedItem) {
        alert("Resource tidak valid!");
        return;
    }

    // **Cek apakah resource sudah ada dalam tabel**
    const existingItem = resourceList.value.find(item => item.id === selectedItem.id);
    if (existingItem) {
        alert("Resource ini sudah ditambahkan!");
        return;
    }

    // **Tambahkan ke daftar pembelian**
    resourceList.value.push({
        id: selectedItem.id, // **Simpan ID dari database**
        name: selectedItem.name,
        quantity: quantity.value,
        price: price.value,
    });

    // **Simpan ke store & localStorage**
    purchaseStore.setDraftPurchase({
        ...purchaseStore.draftPurchase,
        items: resourceList.value
    });
    localStorage.setItem("draftPurchase", JSON.stringify(purchaseStore.draftPurchase));

    // **Reset form setelah menambah**
    selectedResource.value = "";
    quantity.value = 1;
    price.value = 0;
};

// Hitung total harga
const totalPrice = computed(() => {
    return resourceList.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Pastikan data tetap ada setelah refresh
onMounted(() => {
    fetchResources();

    const savedData = localStorage.getItem("draftPurchase");
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        resourceList.value = parsedData.items || [];
    }
});

// Navigasi ke halaman berikutnya
const goToSummary = () => {
    purchaseStore.setDraftPurchase({
        ...purchaseStore.draftPurchase,
        items: resourceList.value,
        totalPrice: totalPrice.value,
    });

    localStorage.setItem("draftPurchase", JSON.stringify(purchaseStore.draftPurchase));

    router.push("/add-purchase-resource/summary");
};
</script>

<template>
    <div class="min-h-screen flex justify-center items-center bg-[#E5EAF2]">
        <div class="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
            <!-- Tombol Back -->
            <div class="grid grid-cols-2 flex">
                <button @click="router.back()" class="text-black hover:underline flex items-center mb-4 text-[28px]">
                    ←
                </button>
                <div class="flex justify-end mt-6">
                    <VSuccessButton label="Selanjutnya" @click="goToSummary" />
                </div>
            </div>

            <!-- Supplier & Tipe Barang -->
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Supplier</label>
                    <VLockedInput :value="supplier" />
                </div>
                <div>
                    <label class="block text-black mb-1 font-lato font-bold text-lg">Tipe Barang</label>
                    <VLockedInput :value="purchaseType" />
                </div>
            </div>

            <!-- Form Input -->
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
            <div class="mt-6">
                <table class="w-full border-collapse border border-[#1E3A5F]">
                    <thead>
                        <tr class="bg-[#1E3A5F] text-white">
                            <th class="p-2 border border-[#1E3A5F]">Nama Barang</th>
                            <th class="p-2 border border-[#1E3A5F]">Jumlah</th>
                            <th class="p-2 border border-[#1E3A5F]">Harga Barang</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in resourceList" :key="index" class="text-center">
                            <td class="p-2 border border-[#1E3A5F]">{{ item.name }}</td>
                            <td class="p-2 border border-[#1E3A5F]">{{ item.quantity }}</td>
                            <td class="p-2 border border-[#1E3A5F]">{{ formatCurrency(item.price) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Total Harga -->
            <div class="flex justify-end mt-4 text-lg font-bold">
                <span>Total Harga: {{ formatCurrency(totalPrice) }}</span>
            </div>
        </div>
    </div>
</template>
