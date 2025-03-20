<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePurchaseStore } from "../stores/purchase";
import VSearchBar from "../components/VSearchBar.vue";
import VDateRangeFilter from "../components/VDateRangeFilter.vue";
import VSortButton from "../components/VSortButton.vue";
import VDropDownInput from "../components/VDropDownInput.vue";
import VOptionInput from "@/components/VOptionInput.vue";
import VButton from "@/components/VButton.vue";
import { useAuthStore } from "@/stores/auth";

// Router
const router = useRouter();

// Store
const purchaseStore = usePurchaseStore();
const authStore = useAuthStore();

// **State untuk filter & sorting**
const searchId = ref("");
const dateRange = ref({ start: "", end: "" });
const selectedType = ref("All");
const sortByDate = ref(false);
const sortByNominal = ref(false);

// **State untuk Filter Rentang Nominal**
const startNominal = ref<number | null>(null);
const endNominal = ref<number | null>(null);
const selectedNominalLabel = ref("Semua");

// Role-based permission computed properties
const canViewFinancialInfo = computed(() => {
  const userRole = authStore.userRole;
  // Only Direksi and Finance can see financial info
  return userRole === 'Direksi' || userRole === 'Finance' || userRole === 'Admin';
});

const canEditPurchase = computed(() => {
  const userRole = authStore.userRole;
  // Only Staf Operasional can edit assets
  return userRole === 'Operasional' || userRole === 'Admin';
});

// **List Rentang Harga**
const nominalOptions = [
  { label: "Semua", start: null, end: null },
  { label: "0 - 1 Juta", start: 0, end: 1000000 },
  { label: "1 Juta - 10 Juta", start: 1000000, end: 10000000 },
  { label: "10 Juta - 100 Juta", start: 10000000, end: 100000000 },
  { label: "100 Juta - 1 Miliar", start: 100000000, end: 1000000000 },
];

// **Ambil daftar pembelian dari API**
const fetchPurchases = async () => {
  await purchaseStore.viewAllPurchase({
    idSearch: searchId.value || null,
    startDate: dateRange.value.start || null,
    endDate: dateRange.value.end || null,
    startNominal: startNominal.value,
    endNominal: endNominal.value,
    highNominal: sortByNominal.value || null,
    newDate: sortByDate.value || null,
    type: selectedType.value,
  });
};

// **Watch perubahan dropdown nominal & update nilai filter**
const updateNominalFilter = (selectedLabel: string) => {
  selectedNominalLabel.value = selectedLabel;

  const selectedOption = nominalOptions.find((opt) => opt.label === selectedLabel);
  if (selectedOption) {
    startNominal.value = selectedOption.start;
    endNominal.value = selectedOption.end;
  }
};

// Watch for changes in filter values only
watch(
  [
    searchId,
    dateRange,
    selectedType,
    sortByDate,
    sortByNominal,
    startNominal,
    endNominal
  ],
  () => {
    fetchPurchases();
  }
);

// Initial data fetch
onMounted(() => {
  fetchPurchases();
});

// **Format Rupiah**
const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")},00`;
};

// **Format Tanggal**
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

// **Navigasi ke halaman tambah pembelian**
const goToAddPurchase = () => {
  router.push("/purchase/add");
};
</script>

<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <div class="grid grid-cols-[1fr_auto_auto_1fr_auto_auto] gap-2 items-center">
        <VSearchBar v-model="searchId" placeholder="Cari ID..." class="w-1/4" />
        <VDateRangeFilter v-model="dateRange" class="w-1/4" />
        <VSortButton v-model:sortOrder="sortByDate" />
        <VDropDownInput
          :options="nominalOptions.map((opt) => opt.label)"
          v-model="selectedNominalLabel"
          @update:modelValue="updateNominalFilter"
          class="w-1/4"
        />
        <VSortButton v-model:sortOrder="sortByNominal" />
      </div>
    </div>

    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Filter & Tombol Tambah Pembelian -->
      <div class="flex justify-between items-center mb-4">
        <VOptionInput v-model="selectedType" :options="['All', 'Aset', 'Resource']" class="w-1/4" />
        <din v-if="canEditPurchase">
          <VButton label="Tambah Pembelian" @click="goToAddPurchase"/>
        </din>
      </div>

      <div v-if="purchaseStore.purchases.length" class="mt-4 space-y-6">
        <div 
          v-for="purchase in purchaseStore.purchases" 
          :key="purchase.id" 
          class="rounded-lg shadow-md overflow-hidden bg-white"
        >
          <!-- Header -->
          <router-link :to="purchase.purchaseId.startsWith('A-') ? `/purchase/detail/asset/${purchase.purchaseId}` : `/purchase/detail/resource/${purchase.purchaseId}`" class="block">
          <div class="bg-[#1E3A5F] text-white px-6 py-3 flex justify-between items-center">
            <h3 class="text-lg font-semibold">
              Pembelian {{ purchase.purchaseId }}
            </h3>
            <span class="text-xs">Last Updated: {{ formatDate(purchase.purchaseUpdateDate) }}</span>
          </div>

          <!-- Content -->
            <div class="p-6 bg-[#E5EAF2] text-gray-800 text-sm">
              <div class="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-2 items-center">
                <p class="font-semibold">Tanggal Pengajuan</p>
                <p>: {{ formatDate(purchase.purchaseSubmissionDate) }}</p>
                <p></p> <!-- Spacer -->

                <p class="font-semibold">Status Pembelian</p>
                <p>: {{ purchase.purchaseStatus }}</p>
                <p></p>

                <p class="font-semibold">Supplier</p>
                <p>: {{ purchase.purchaseSupplier }}</p>
                <p></p>

                <p class="font-semibold">Tipe Barang</p>
                <p>: {{ purchase.purchaseType }}</p>

                <din v-if="canViewFinancialInfo">
                  <p class="font-bold text-[#1E3A5F] text-right">
                  Total Harga : <span class="text-[#1E3A5F] font-bold">{{ formatCurrency(purchase.purchasePrice) }}</span>
                  </p>
                </din>
              </div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- ⚠ Jika Tidak Ada Data -->
      <p v-else class="text-center text-gray-500 mt-4">Tidak ada data pembelian ditemukan.</p>
    </div>
  </div>
</template>

<style scoped>
/* Menggunakan font Inter */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}
</style>
