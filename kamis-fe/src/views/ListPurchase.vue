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
const sortByDate = ref(null);
const sortByNominal = ref(null);

// **State untuk Filter Rentang Nominal**
const startNominal = ref<number | null>(null);
const endNominal = ref<number | null>(null);
const selectedNominalLabel = ref("Seluruh Total Harga");

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
  { label: "Seluruh Total Harga", start: null, end: null },
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
    newDate: !sortByDate.value || null,
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

const goToPurchaseDetail = (purchaseId: string) => {
  if (purchaseId.startsWith("A-")) {
    router.push(`/purchase/detail/asset/${purchaseId}`);
  } else {
    router.push(`/purchase/detail/resource/${purchaseId}`);
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#E5EAF2] p-6">
    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md mb-4">
      <template v-if="canViewFinancialInfo">
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
      </template>
      <template v-else>
        <div class="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
          <VSearchBar v-model="searchId" placeholder="Cari ID..." class="w-1/4" />
          <VDateRangeFilter v-model="dateRange" class="w-1/4" />
          <VSortButton v-model:sortOrder="sortByDate" />
        </div>
      </template>
    </div>

    <div class="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <!-- Filter & Tombol Tambah Pembelian -->
      <div class="flex justify-between items-center mb-4">
        <VOptionInput v-model="selectedType" :options="['All', 'Aset', 'Resource']" class="w-1/4" />
        <div v-if="canEditPurchase">
          <VButton label="Tambah Pembelian" @click="goToAddPurchase" />
        </div>
      </div>

      <!-- Tabel Daftar Pembelian -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-800 border border-gray-200">
          <thead class="bg-[#1E3A5F] text-white">
            <tr>
              <th class="px-4 py-3">ID Pembelian</th>
              <th class="px-4 py-3">Tanggal Pengajuan</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Supplier</th>
              <th class="px-4 py-3">Tipe Barang</th>
              <th v-if="canViewFinancialInfo" class="px-4 py-3 text-right">Total Harga</th>
              <th class="px-4 py-3 text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="purchaseStore.purchases.length">
              <tr 
                v-for="purchase in purchaseStore.purchases" 
                :key="purchase.id" 
                class="bg-[#E5EAF2] border-t border-gray-200 hover:bg-[#dbe3eb] transition-colors cursor-pointer"
                @click="goToPurchaseDetail(purchase.purchaseId)"
              >
                <td class="px-4 py-3">{{ purchase.purchaseId }}</td>
                <td class="px-4 py-3">{{ formatDate(purchase.purchaseSubmissionDate) }}</td>
                <td class="px-4 py-3">{{ purchase.purchaseStatus }}</td>
                <td class="px-4 py-3">{{ purchase.purchaseSupplier }}</td>
                <td class="px-4 py-3">{{ purchase.purchaseType }}</td>
                <td 
                  v-if="canViewFinancialInfo" 
                  class="px-4 py-3 text-right font-bold text-[#1E3A5F]"
                >
                  {{ formatCurrency(purchase.purchasePrice) }}
                </td>
                <td class="px-4 py-3 text-right text-xs">
                  {{ formatDate(purchase.purchaseUpdateDate) }}
                </td>
              </tr>
            </template>

            <!-- Baris Kosong jika tidak ada data -->
            <tr v-else>
              <td 
                :colspan="canViewFinancialInfo ? 7 : 6" 
                class="text-center py-6 text-gray-500 italic"
              >
                Tidak ada data pembelian ditemukan.
              </td>
            </tr>
          </tbody>

        </table>
      </div>


      <!-- ⚠ Jika Tidak Ada Data -->
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}
</style>
